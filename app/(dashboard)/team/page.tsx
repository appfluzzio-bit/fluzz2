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
import { Mail, Plus, Trash, UserPlus } from "lucide-react";
import {
  inviteToOrganization,
  inviteToWorkspace,
  removeOrganizationMember,
  cancelInvite,
} from "./actions";
import { useToast } from "@/components/ui/use-toast";
import { useWorkspace } from "@/lib/workspace-context";
import type { Organization, User } from "@/types";

export default function TeamPage() {
  const { currentWorkspace } = useWorkspace();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [orgMembers, setOrgMembers] = useState<any[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);

  useEffect(() => {
    document.title = "Usuários - Fluzz";
  }, []);
  const [loading, setLoading] = useState(true);
  const [isInviteOrgOpen, setIsInviteOrgOpen] = useState(false);
  const [isInviteWorkspaceOpen, setIsInviteWorkspaceOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [removingMember, setRemovingMember] = useState<any>(null);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [currentWorkspace]);

  async function loadData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get organization
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organizations(*)")
        .eq("user_id", user.id)
        .single();

      const org = (orgMember?.organizations as any) as Organization;
      setOrganization(org);

      // Get org members
      const { data: orgMembersData } = await supabase
        .from("organization_members")
        .select("*, users(*)")
        .eq("organization_id", org.id);

      setOrgMembers(orgMembersData || []);

      // Get workspace members
      if (currentWorkspace) {
        const { data: workspaceMembersData } = await supabase
          .from("workspace_members")
          .select("*, users(*)")
          .eq("workspace_id", currentWorkspace.id);

        setWorkspaceMembers(workspaceMembersData || []);
      }

      // Get pending invites
      const { data: invitesData } = await supabase
        .from("invites")
        .select("*")
        .eq("organization_id", org.id)
        .eq("status", "pending");

      setInvites(invitesData || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleInviteOrg(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!organization) return;

    const formData = new FormData(e.currentTarget);
    formData.append("organization_id", organization.id);

    const result = await inviteToOrganization(formData);

    if (result.error) {
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Convite enviado com sucesso",
      });
      setIsInviteOrgOpen(false);
      loadData();
      (e.target as HTMLFormElement).reset();
    }
  }

  async function handleInviteWorkspace(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!currentWorkspace) return;

    const formData = new FormData(e.currentTarget);
    formData.append("workspace_id", currentWorkspace.id);

    const result = await inviteToWorkspace(formData);

    if (result.error) {
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Convite enviado com sucesso",
      });
      setIsInviteWorkspaceOpen(false);
      loadData();
      (e.target as HTMLFormElement).reset();
    }
  }

  async function handleRemoveMember() {
    if (!removingMember || !organization) return;

    const result = await removeOrganizationMember(
      removingMember.id,
      organization.id
    );

    if (result.error) {
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Membro removido com sucesso",
      });
      setRemovingMember(null);
      loadData();
    }
  }

  async function handleCancelInvite(inviteId: string) {
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

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Equipe</h1>
        <p className="text-muted-foreground">
          Gerencie membros da organização e workspaces
        </p>
      </div>

      {/* Organization Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Membros da Organização</CardTitle>
              <CardDescription>
                Administradores e owners da organização
              </CardDescription>
            </div>
            <Dialog open={isInviteOrgOpen} onOpenChange={setIsInviteOrgOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Convidar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleInviteOrg}>
                  <DialogHeader>
                    <DialogTitle>Convidar para Organização</DialogTitle>
                    <DialogDescription>
                      Envie um convite por e-mail
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-email">E-mail</Label>
                      <Input
                        id="org-email"
                        name="email"
                        type="email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-role">Função</Label>
                      <select
                        id="org-role"
                        name="role"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Selecione...</option>
                        <option value="admin">Admin</option>
                        <option value="owner">Owner</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Enviar Convite</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orgMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={undefined} />
                    <AvatarFallback>
                      {getInitials((member.users as any)?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {(member.users as any)?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {(member.users as any)?.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{member.role}</Badge>
                  {member.role !== "owner" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRemovingMember(member)}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Workspace Members */}
      {currentWorkspace && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Membros do Workspace</CardTitle>
                <CardDescription>
                  Membros do workspace {currentWorkspace.name}
                </CardDescription>
              </div>
              <Dialog
                open={isInviteWorkspaceOpen}
                onOpenChange={setIsInviteWorkspaceOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Convidar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleInviteWorkspace}>
                    <DialogHeader>
                      <DialogTitle>Convidar para Workspace</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="ws-email">E-mail</Label>
                        <Input
                          id="ws-email"
                          name="email"
                          type="email"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ws-role">Função</Label>
                        <select
                          id="ws-role"
                          name="role"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          required
                        >
                          <option value="">Selecione...</option>
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="agent">Agent</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Enviar Convite</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workspaceMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={undefined} />
                      <AvatarFallback>
                        {getInitials((member.users as any)?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {(member.users as any)?.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {(member.users as any)?.email}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">{member.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Pending Invites */}
      <Card>
        <CardHeader>
          <CardTitle>Convites Pendentes</CardTitle>
          <CardDescription>
            Convites aguardando aceite
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Nenhum convite pendente
            </p>
          ) : (
            <div className="space-y-4">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{invite.email}</div>
                      <div className="text-sm text-muted-foreground">
                        Expira em{" "}
                        {new Date(invite.expires_at).toLocaleDateString(
                          "pt-BR"
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{invite.role}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelInvite(invite.id)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Member Alert */}
      <AlertDialog
        open={!!removingMember}
        onOpenChange={(open) => !open && setRemovingMember(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Membro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este membro? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

