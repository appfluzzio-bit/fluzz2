"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { canManageWorkspaces } from "@/lib/permissions";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const workspaceSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
});

export async function createWorkspace(formData: FormData) {
  const user = await getUser();
  if (!user) {
    console.error("❌ Usuário não autenticado");
    return { error: "Não autenticado" };
  }

  const organizationId = formData.get("organization_id") as string;
  console.log("🔍 Criando workspace para organização:", organizationId);

  const canManage = await canManageWorkspaces(user.id, organizationId);
  if (!canManage) {
    console.error("❌ Usuário sem permissão para criar workspaces");
    return { error: "Sem permissão para criar workspaces" };
  }

  const rawData = {
    name: formData.get("name") as string,
  };

  const validated = workspaceSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const supabase = await createClient();

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .insert({
      organization_id: organizationId,
      name: validated.data.name,
    })
    .select()
    .single();

  if (error || !workspace) {
    console.error("❌ Erro ao criar workspace:", error);
    return { error: error?.message || "Erro ao criar workspace" };
  }

  // Add creator as admin
  const { error: memberError } = await supabase.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: "admin",
  });

  if (memberError) {
    console.error("❌ Erro ao adicionar membro ao workspace:", memberError);
    // Não retornamos erro aqui pois o workspace já foi criado
  }

  console.log("✅ Workspace criado com sucesso:", workspace);
  revalidatePath("/workspaces");
  return { success: true, workspace };
}

export async function updateWorkspace(formData: FormData) {
  const user = await getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  const workspaceId = formData.get("workspace_id") as string;
  const organizationId = formData.get("organization_id") as string;

  const canManage = await canManageWorkspaces(user.id, organizationId);
  if (!canManage) {
    return { error: "Sem permissão" };
  }

  const rawData = {
    name: formData.get("name") as string,
  };

  const validated = workspaceSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("workspaces")
    .update({
      name: validated.data.name,
    })
    .eq("id", workspaceId);

  if (error) {
    return { error: "Erro ao atualizar workspace" };
  }

  revalidatePath("/workspaces");
  return { success: true };
}

export async function deleteWorkspace(workspaceId: string, organizationId: string) {
  const user = await getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  const canManage = await canManageWorkspaces(user.id, organizationId);
  if (!canManage) {
    return { error: "Sem permissão" };
  }

  const supabase = await createClient();

  // Soft delete: apenas preenche deleted_at
  const { error } = await supabase
    .from("workspaces")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", workspaceId);

  if (error) {
    console.error("❌ Erro ao excluir workspace:", error);
    return { error: "Erro ao excluir workspace" };
  }

  console.log("✅ Workspace excluído (soft delete):", workspaceId);
  revalidatePath("/workspaces");
  return { success: true };
}

