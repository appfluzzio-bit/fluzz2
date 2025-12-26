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
import { Building2, Edit, Plus, Trash } from "lucide-react";
import { createWorkspace, updateWorkspace, deleteWorkspace } from "./actions";
import { useToast } from "@/components/ui/use-toast";
import { useWorkspace } from "@/lib/workspace-context";
import type { Workspace, Organization } from "@/types";

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Workspaces - Fluzz";
  }, []);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [deletingWorkspace, setDeletingWorkspace] = useState<Workspace | null>(null);
  const { toast } = useToast();
  const { refreshWorkspaces } = useWorkspace();
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get organization
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organizations(*)")
        .eq("user_id", user.id)
        .single();

      const org = (orgMember?.organizations as any) as Organization;
      setOrganization(org);

      // Get workspaces (apenas não deletados)
      const { data: workspacesData } = await supabase
        .from("workspaces")
        .select("*")
        .eq("organization_id", org.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

      setWorkspaces(workspacesData || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar workspaces",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("organization_id", organization!.id);

    const result = await createWorkspace(formData);

    if (result.error) {
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Workspace criado com sucesso",
        variant: "success",
      });
      setIsCreateOpen(false);
      loadData();
      // Atualizar sidebar
      await refreshWorkspaces();
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("workspace_id", editingWorkspace!.id);
    formData.append("organization_id", organization!.id);

    const result = await updateWorkspace(formData);

    if (result.error) {
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Workspace atualizado com sucesso",
        variant: "success",
      });
      setEditingWorkspace(null);
      loadData();
      // Atualizar sidebar
      await refreshWorkspaces();
    }
  }

  async function handleDelete() {
    if (!deletingWorkspace) return;

    const result = await deleteWorkspace(deletingWorkspace.id, organization!.id);

    if (result.error) {
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Workspace excluído com sucesso",
        variant: "success",
      });
      setDeletingWorkspace(null);
      loadData();
      // Atualizar sidebar
      await refreshWorkspaces();
    }
  }

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workspaces</h1>
          <p className="text-muted-foreground">
            Gerencie os workspaces da sua organização
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Workspace
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Criar Workspace</DialogTitle>
                <DialogDescription>
                  Crie um novo workspace para organizar suas operações
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Ex: Vendas, Suporte, Marketing" 
                    required 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Criar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((workspace) => (
          <Card key={workspace.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle>{workspace.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingWorkspace(workspace)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingWorkspace(workspace)}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Criado em{" "}
                {new Date(workspace.created_at).toLocaleDateString("pt-BR")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingWorkspace}
        onOpenChange={(open) => !open && setEditingWorkspace(null)}
      >
        <DialogContent>
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Editar Workspace</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingWorkspace?.name}
                  placeholder="Ex: Vendas, Suporte, Marketing"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog
        open={!!deletingWorkspace}
        onOpenChange={(open) => !open && setDeletingWorkspace(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o workspace "{deletingWorkspace?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

