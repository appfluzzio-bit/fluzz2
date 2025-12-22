"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { isOrgAdmin, canManageWorkspaceMembers } from "@/lib/permissions";
import { inviteSchema } from "@/lib/validations/invite";
import { revalidatePath } from "next/cache";

export async function inviteToOrganization(formData: FormData) {
  const user = await getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  const organizationId = formData.get("organization_id") as string;

  const canInvite = await isOrgAdmin(user.id, organizationId);
  if (!canInvite) {
    return { error: "Sem permissão para convidar usuários" };
  }

  const rawData = {
    email: formData.get("email") as string,
    role: formData.get("role") as string,
  };

  const validated = inviteSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const supabase = await createClient();

  // Check if user already exists in organization
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", validated.data.email)
    .single();

  if (existingUser) {
    const { data: existingMember } = await supabase
      .from("organization_members")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("user_id", existingUser.id)
      .single();

    if (existingMember) {
      return { error: "Usuário já é membro desta organização" };
    }
  }

  // Check for pending invite
  const { data: pendingInvite } = await supabase
    .from("invites")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("email", validated.data.email)
    .eq("status", "pending")
    .single();

  if (pendingInvite) {
    return { error: "Já existe um convite pendente para este e-mail" };
  }

  // Create invite (expires in 7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { error } = await supabase.from("invites").insert({
    organization_id: organizationId,
    workspace_id: null,
    email: validated.data.email,
    role: validated.data.role,
    status: "pending",
    expires_at: expiresAt.toISOString(),
    invited_by: user.id,
  });

  if (error) {
    return { error: "Erro ao criar convite" };
  }

  // TODO: Send email invitation

  revalidatePath("/team");
  return { success: true };
}

export async function inviteToWorkspace(formData: FormData) {
  const user = await getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  const workspaceId = formData.get("workspace_id") as string;

  const canInvite = await canManageWorkspaceMembers(user.id, workspaceId);
  if (!canInvite) {
    return { error: "Sem permissão" };
  }

  const rawData = {
    email: formData.get("email") as string,
    role: formData.get("role") as string,
  };

  const validated = inviteSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const supabase = await createClient();

  // Get organization_id from workspace
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("organization_id")
    .eq("id", workspaceId)
    .single();

  if (!workspace) {
    return { error: "Workspace não encontrado" };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { error } = await supabase.from("invites").insert({
    organization_id: workspace.organization_id,
    workspace_id: workspaceId,
    email: validated.data.email,
    role: validated.data.role,
    status: "pending",
    expires_at: expiresAt.toISOString(),
    invited_by: user.id,
  });

  if (error) {
    return { error: "Erro ao criar convite" };
  }

  revalidatePath("/team");
  return { success: true };
}

export async function removeOrganizationMember(
  memberId: string,
  organizationId: string
) {
  const user = await getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  const canRemove = await isOrgAdmin(user.id, organizationId);
  if (!canRemove) {
    return { error: "Sem permissão" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("id", memberId);

  if (error) {
    return { error: "Erro ao remover membro" };
  }

  revalidatePath("/team");
  return { success: true };
}

export async function removeWorkspaceMember(
  memberId: string,
  workspaceId: string
) {
  const user = await getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  const canRemove = await canManageWorkspaceMembers(user.id, workspaceId);
  if (!canRemove) {
    return { error: "Sem permissão" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("id", memberId);

  if (error) {
    return { error: "Erro ao remover membro" };
  }

  revalidatePath("/team");
  return { success: true };
}

export async function cancelInvite(inviteId: string, organizationId: string) {
  const user = await getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  const canCancel = await isOrgAdmin(user.id, organizationId);
  if (!canCancel) {
    return { error: "Sem permissão" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("invites").delete().eq("id", inviteId);

  if (error) {
    return { error: "Erro ao cancelar convite" };
  }

  revalidatePath("/team");
  return { success: true };
}

