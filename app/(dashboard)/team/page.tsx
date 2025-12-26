"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Plus, Trash, UserPlus, Building2, Check, Copy, RefreshCw, X, Clock, CheckCircle2 } from "lucide-react";
import {
  createUser,
  removeUser,
  resendInvite,
  cancelInvite,
} from "./actions";
import { useToast } from "@/components/ui/use-toast";
import { useWorkspace } from "@/lib/workspace-context";
import type { Organization, User, Workspace, WorkspaceRole, OrganizationRole } from "@/types";

interface UserWithMemberships extends User {
  is_org_member: boolean;
  org_role?: OrganizationRole;
  workspaces: Array<{
    id: string;
    name: string;
    role: WorkspaceRole;
  }>;
}

export default function TeamPage() {
  const { currentWorkspace, workspaces } = useWorkspace();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [users, setUsers] = useState<UserWithMemberships[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserIsOrgMember, setCurrentUserIsOrgMember] = useState(false);
  const [invites, setInvites] = useState<any[]>([]);

  useEffect(() => {
    document.title = "Usuários - Fluzz";
  }, []);
  
  const [loading, setLoading] = useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isOrganizationUser, setIsOrganizationUser] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
  const [phoneValue, setPhoneValue] = useState("");
  const [removingUser, setRemovingUser] = useState<UserWithMemberships | null>(null);
  const { toast } = useToast();
  const supabase = createClient();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspace]);

  async function loadData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get current user details
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      setCurrentUser(userData);

      // Get organization
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organizations(*), role")
        .eq("user_id", user.id)
        .single();

      const org = ((orgMember as any)?.organizations) as Organization;
      setOrganization(org);
      setCurrentUserIsOrgMember(!!orgMember);

      // Get all users that the current user has permission to see
      const usersMap = new Map<string, UserWithMemberships>();

      // If user is org admin, get all org members
      if (orgMember && ((orgMember as any).role === "owner" || (orgMember as any).role === "admin")) {
        const { data: orgMembers } = await supabase
          .from("organization_members")
          .select(`
            user_id,
            role,
            users!inner(*)
          `)
          .eq("organization_id", org.id);

        orgMembers?.forEach((member: any) => {
          const userId = member.user_id;
          if (!usersMap.has(userId)) {
            usersMap.set(userId, {
              ...member.users,
              is_org_member: true,
              org_role: member.role,
              workspaces: [],
            });
          }
        });

        // Get all workspace members from all workspaces
        const { data: allWorkspaceMembers } = await supabase
          .from("workspace_members")
          .select(`
            user_id,
            role,
            workspace_id,
            workspaces!inner(name, organization_id)
          `)
          .eq("workspaces.organization_id", org.id);

        allWorkspaceMembers?.forEach((member: any) => {
          const userId = member.user_id;
          const existing = usersMap.get(userId);
          
          const workspaceInfo = {
            id: member.workspace_id,
            name: member.workspaces.name,
            role: member.role,
          };

          if (existing) {
            existing.workspaces.push(workspaceInfo);
          } else {
            // User is not in org, but is in workspace
            // We need to fetch user data
            (supabase
              .from("users") as any)
              .select("*")
              .eq("id", userId)
              .single()
              .then(({ data: userInfo }: any) => {
                if (userInfo) {
                  usersMap.set(userId, {
                    ...userInfo,
                    is_org_member: false,
                    workspaces: [workspaceInfo],
                  });
                  setUsers(Array.from(usersMap.values()));
                }
              });
          }
        });
      } else {
        // User is not org admin, only see members from their workspaces
        const { data: userWorkspaces } = await (supabase
          .from("workspace_members") as any)
          .select("workspace_id")
          .eq("user_id", user.id);

        const workspaceIds = userWorkspaces?.map((w: any) => w.workspace_id) || [];

        for (const workspaceId of workspaceIds) {
          const { data: workspaceMembers } = await (supabase
            .from("workspace_members") as any)
            .select(`
              user_id,
              role,
              workspace_id,
              workspaces!inner(name),
              users!inner(*)
            `)
            .eq("workspace_id", workspaceId);

          workspaceMembers?.forEach((member: any) => {
            const userId = member.user_id;
            const existing = usersMap.get(userId);
            
            const workspaceInfo = {
              id: member.workspace_id,
              name: member.workspaces.name,
              role: member.role,
            };

            if (existing) {
              existing.workspaces.push(workspaceInfo);
            } else {
              usersMap.set(userId, {
                ...member.users,
                is_org_member: false, // We'll check this separately
                workspaces: [workspaceInfo],
              });
            }
          });
        }

        // Check which users are org members
        const userIds = Array.from(usersMap.keys());
        const { data: orgMembersCheck } = await supabase
          .from("organization_members")
          .select("user_id, role")
          .in("user_id", userIds)
          .eq("organization_id", org.id);

        orgMembersCheck?.forEach((member: any) => {
          const user = usersMap.get(member.user_id);
          if (user) {
            user.is_org_member = true;
            user.org_role = member.role;
          }
        });
      }

      setUsers(Array.from(usersMap.values()));

      // Carregar convites pendentes e expirados
      const { data: invitesData } = await supabase
        .from("invites")
        .select("*, workspaces(name)")
        .eq("organization_id", org.id)
        .in("status", ["pending", "expired"])
        .order("created_at", { ascending: false });

      setInvites(invitesData || []);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!organization) return;

    // Validações
    if (!selectedRole) {
      toast({
        title: "Erro",
        description: "Selecione um nível de acesso",
        variant: "destructive",
      });
      return;
    }

    if (!isOrganizationUser && !selectedWorkspace && currentUserIsOrgMember) {
      toast({
        title: "Erro",
        description: "Selecione um workspace",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append("organization_id", organization.id);
    formData.append("is_organization_user", isOrganizationUser.toString());
    formData.append("role", selectedRole);
    
    // Remove máscara do telefone antes de enviar
    const phoneNumbers = phoneValue.replace(/\D/g, "");
    formData.set("telefone", phoneNumbers);
    
    // Define workspace
    if (!isOrganizationUser) {
      if (currentUserIsOrgMember) {
        formData.append("workspace_id", selectedWorkspace);
      } else if (currentWorkspace) {
        formData.append("workspace_id", currentWorkspace.id);
      }
    }

    const result = await createUser(formData);

    if (result.error) {
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Convite enviado com sucesso! O usuário receberá um link para definir a senha.",
      });
      handleCloseDialog();
      loadData();
    }
  }

  const handleCloseDialog = () => {
    setIsAddUserOpen(false);
    setIsOrganizationUser(true);
    setSelectedRole("");
    setSelectedWorkspace("");
    setPhoneValue("");
  };

  const copyInviteLink = (inviteId: string) => {
    const link = `${baseUrl}/invite/${inviteId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "O link do convite foi copiado para a área de transferência",
    });
  };

  const handleResendInvite = async (inviteId: string) => {
    if (!organization) return;

    const result = await resendInvite(inviteId, organization.id);

    if (result.error) {
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Novo convite gerado! O link foi atualizado.",
      });
      loadData();
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    if (!organization) return;

    const result = await cancelInvite(inviteId, organization.id);

    if (result.error) {
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Convite cancelado",
      });
      loadData();
    }
  };

  const isInviteExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  async function handleRemoveUser() {
    if (!removingUser || !organization) return;

    const result = await removeUser(removingUser.id, organization.id);

    if (result.error) {
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Usuário removido com sucesso",
      });
      setRemovingUser(null);
      loadData();
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      owner: "Proprietário",
      admin: "Administrador",
      manager: "Gerente",
      agent: "Atendente",
      viewer: "Visualizador",
    };
    return labels[role] || role;
  };

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");
    
    // Limita a 11 dígitos
    const limited = numbers.slice(0, 11);
    
    // Aplica a máscara (44)99180-7473
    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 6) {
      return `(${limited.slice(0, 2)})${limited.slice(2)}`;
    } else if (limited.length <= 10) {
      return `(${limited.slice(0, 2)})${limited.slice(2, 6)}-${limited.slice(6)}`;
    } else {
      return `(${limited.slice(0, 2)})${limited.slice(2, 7)}-${limited.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhoneValue(formatted);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Carregando usuários...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários da organização e workspaces
          </p>
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={(open) => {
          if (!open) handleCloseDialog();
          else setIsAddUserOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreateUser}>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo usuário. Um convite será enviado por e-mail.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Tipo de usuário - só mostra se o usuário logado for da organização */}
                {currentUserIsOrgMember && (
                  <div className="space-y-3">
                    <Label>Tipo de Usuário *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={isOrganizationUser ? "default" : "outline"}
                        className="h-auto py-4 flex flex-col items-center gap-2"
                        onClick={() => {
                          setIsOrganizationUser(true);
                          setSelectedRole("");
                          setSelectedWorkspace("");
                        }}
                      >
                        <Building2 className="h-5 w-5" />
                        <div className="text-center">
                          <div className="font-semibold">Organização</div>
                          <div className="text-xs opacity-80">
                            Acesso a todos os workspaces
                          </div>
                        </div>
                      </Button>
                      <Button
                        type="button"
                        variant={!isOrganizationUser ? "default" : "outline"}
                        className="h-auto py-4 flex flex-col items-center gap-2"
                        onClick={() => {
                          setIsOrganizationUser(false);
                          setSelectedRole("");
                          setSelectedWorkspace("");
                        }}
                      >
                        <Building2 className="h-5 w-5" />
                        <div className="text-center">
                          <div className="font-semibold">Workspace</div>
                          <div className="text-xs opacity-80">
                            Acesso a workspace específico
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input id="nome" name="nome" placeholder="Ex: João Silva" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="joao@exemplo.com"
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input 
                    id="telefone" 
                    name="telefone" 
                    type="tel"
                    placeholder="(44)99180-7473"
                    value={phoneValue}
                    onChange={handlePhoneChange}
                  />
                </div>

                {/* Nível de Acesso */}
                <div className="space-y-3">
                  <Label>Nível de Acesso *</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {isOrganizationUser ? (
                      <>
                        <Button
                          type="button"
                          variant={selectedRole === "admin" ? "default" : "outline"}
                          className="h-auto py-4 flex flex-col items-center gap-2"
                          onClick={() => setSelectedRole("admin")}
                        >
                          <div className="font-semibold">Administrador</div>
                          <div className="text-xs opacity-80 text-center">
                            Gerencia tudo
                          </div>
                        </Button>
                        <Button
                          type="button"
                          variant={selectedRole === "manager" ? "default" : "outline"}
                          className="h-auto py-4 flex flex-col items-center gap-2"
                          onClick={() => setSelectedRole("manager")}
                        >
                          <div className="font-semibold">Gerente</div>
                          <div className="text-xs opacity-80 text-center">
                            Gerencia equipes
                          </div>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant={selectedRole === "admin" ? "default" : "outline"}
                          className="h-auto py-4 flex flex-col items-center gap-2"
                          onClick={() => setSelectedRole("admin")}
                        >
                          <div className="font-semibold">Administrador</div>
                          <div className="text-xs opacity-80 text-center">
                            Gerencia workspace
                          </div>
                        </Button>
                        <Button
                          type="button"
                          variant={selectedRole === "manager" ? "default" : "outline"}
                          className="h-auto py-4 flex flex-col items-center gap-2"
                          onClick={() => setSelectedRole("manager")}
                        >
                          <div className="font-semibold">Gerente</div>
                          <div className="text-xs opacity-80 text-center">
                            Gerencia equipe
                          </div>
                        </Button>
                        <Button
                          type="button"
                          variant={selectedRole === "agent" ? "default" : "outline"}
                          className="h-auto py-4 flex flex-col items-center gap-2"
                          onClick={() => setSelectedRole("agent")}
                        >
                          <div className="font-semibold">Atendente</div>
                          <div className="text-xs opacity-80 text-center">
                            Atende chats
                          </div>
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Seleção de workspace - só mostra se não for usuário da organização e o usuário logado for da organização */}
                {!isOrganizationUser && currentUserIsOrgMember && workspaces.length > 0 && (
                  <div className="space-y-3">
                    <Label>Workspace *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {workspaces.map((ws) => (
                        <Button
                          key={ws.id}
                          type="button"
                          variant={selectedWorkspace === ws.id ? "default" : "outline"}
                          className="h-auto py-3 justify-start"
                          onClick={() => setSelectedWorkspace(ws.id)}
                        >
                          <Building2 className="h-4 w-4 mr-2" />
                          {ws.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {!isOrganizationUser && !currentUserIsOrgMember && currentWorkspace && (
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>O usuário será adicionado ao workspace: <strong>{currentWorkspace.name}</strong></span>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Cancelar
                </Button>
                <Button type="submit">Enviar Convite</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Usuários ({users.length})</CardTitle>
          <CardDescription>
            Usuários que você tem permissão para visualizar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Nenhum usuário encontrado
            </p>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={undefined} />
                      <AvatarFallback className="text-lg">
                        {getInitials(user.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="font-semibold text-base flex items-center gap-2">
                          {user.nome}
                          {user.is_org_member && (
                            <Badge variant="default" className="gap-1">
                              <Building2 className="h-3 w-3" />
                              Membro da Organização
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                      
                      {/* Workspaces vinculados */}
                      {user.workspaces.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-muted-foreground">
                            Workspaces:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {user.workspaces.map((ws) => (
                              <Badge
                                key={ws.id}
                                variant="outline"
                                className="gap-1"
                              >
                                {ws.name} • {getRoleLabel(ws.role)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {user.is_org_member && user.org_role && (
                      <Badge variant="secondary">
                        {getRoleLabel(user.org_role)}
                      </Badge>
                    )}
                    {user.id !== currentUser?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setRemovingUser(user)}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Convites Pendentes/Expirados */}
      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Convites Pendentes ({invites.length})</CardTitle>
            <CardDescription>
              Convites enviados aguardando aceite ou que expiraram
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invites.map((invite) => {
                const expired = isInviteExpired(invite.expires_at);
                const inviteLink = `${baseUrl}/invite/${invite.id}`;
                const workspaceName = invite.workspaces ? (invite.workspaces as any).name : null;

                return (
                  <div
                    key={invite.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-semibold">{invite.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {workspaceName ? `Workspace: ${workspaceName}` : "Organização"} • {getRoleLabel(invite.role)}
                          </div>
                        </div>
                      </div>

                      {/* Link do convite */}
                      <div className="flex items-center gap-2 pl-8">
                        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2 text-sm font-mono">
                          <span className="truncate">{inviteLink}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyInviteLink(invite.id)}
                          className="flex-shrink-0"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar
                        </Button>
                      </div>

                      {/* Status e data de expiração */}
                      <div className="flex items-center gap-4 pl-8 text-sm">
                        {expired ? (
                          <Badge variant="destructive" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Expirado
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Pendente
                          </Badge>
                        )}
                        <span className="text-muted-foreground">
                          {expired ? "Expirou" : "Expira"} em{" "}
                          {new Date(invite.expires_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2 ml-4">
                      {expired && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleResendInvite(invite.id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Reenviar
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelInvite(invite.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Remove User Alert */}
      <AlertDialog
        open={!!removingUser}
        onOpenChange={(open) => !open && setRemovingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover {removingUser?.nome}? Esta ação
              removerá o usuário da organização e de todos os workspaces.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

