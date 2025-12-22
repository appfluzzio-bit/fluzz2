"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { canManageWorkspaces } from "@/lib/permissions";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const workspaceSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  slug: z
    .string()
    .min(2, "Slug deve ter no mínimo 2 caracteres")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug deve conter apenas letras minúsculas, números e hífens"
    ),
});

export async function createWorkspace(formData: FormData) {
  const user = await getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  const organizationId = formData.get("organization_id") as string;

  const canManage = await canManageWorkspaces(user.id, organizationId);
  if (!canManage) {
    return { error: "Sem permissão para criar workspaces" };
  }

  const rawData = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
  };

  const validated = workspaceSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const supabase = await createClient();

  // Check slug uniqueness within organization
  const { data: existing } = await supabase
    .from("workspaces")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("slug", validated.data.slug)
    .single();

  if (existing) {
    return { error: "Slug já existe nesta organização" };
  }

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .insert({
      organization_id: organizationId,
      name: validated.data.name,
      slug: validated.data.slug,
    })
    .select()
    .single();

  if (error || !workspace) {
    return { error: "Erro ao criar workspace" };
  }

  // Add creator as admin
  await supabase.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: "admin",
  });

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
    slug: formData.get("slug") as string,
  };

  const validated = workspaceSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const supabase = await createClient();

  // Check slug uniqueness (excluding current workspace)
  const { data: existing } = await supabase
    .from("workspaces")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("slug", validated.data.slug)
    .neq("id", workspaceId)
    .single();

  if (existing) {
    return { error: "Slug já existe" };
  }

  const { error } = await supabase
    .from("workspaces")
    .update({
      name: validated.data.name,
      slug: validated.data.slug,
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

  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId);

  if (error) {
    return { error: "Erro ao excluir workspace" };
  }

  revalidatePath("/workspaces");
  return { success: true };
}

