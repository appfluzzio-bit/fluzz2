"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { isOrgAdmin, canManageWorkspaceMembers } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

// Nova função para criar usuário via convite
export async function createUser(formData: FormData) {
  const currentUser = await getUser();
  if (!currentUser) {
    return { error: "Não autenticado" };
  }

  const organizationId = formData.get("organization_id") as string;
  const isOrganizationUser = formData.get("is_organization_user") === "true";
  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;
  const telefone = formData.get("telefone") as string;
  const role = formData.get("role") as string;
  const workspaceId = formData.get("workspace_id") as string | null;

  // Validações básicas
  if (!nome || !email || !role) {
    return { error: "Preencha todos os campos obrigatórios" };
  }

  // Verificar permissões
  const canCreate = await isOrgAdmin(currentUser.id, organizationId);
  if (!canCreate && !workspaceId) {
    return { error: "Sem permissão para criar usuários" };
  }

  if (workspaceId && !canCreate) {
    const canManage = await canManageWorkspaceMembers(currentUser.id, workspaceId);
    if (!canManage) {
      return { error: "Sem permissão para adicionar usuários neste workspace" };
    }
  }

  const supabase = await createClient();
  const adminClient = createAdminClient(); // Cliente admin para bypass RLS

  // Verificar se o email já existe
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .is("deleted_at", null)
    .single();

  if (existingUser) {
    return { error: "Já existe um usuário com este e-mail" };
  }

  // Verificar se já existe convite pendente para este e-mail
  const { data: existingInvite } = await supabase
    .from("invites")
    .select("id")
    .eq("email", email)
    .eq("organization_id", organizationId)
    .eq("status", "pending")
    .single();

  if (existingInvite) {
    return { error: "Já existe um convite pendente para este e-mail" };
  }

  // Criar convite (expira em 7 dias)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const inviteData: any = {
    organization_id: organizationId,
    email: email,
    role: role,
    status: "pending",
    expires_at: expiresAt.toISOString(),
    invited_by: currentUser.id,
  };

  // Adicionar workspace_id se for usuário de workspace
  if (!isOrganizationUser && workspaceId) {
    inviteData.workspace_id = workspaceId;
  }

  // Armazenar dados adicionais no metadata (será usado ao aceitar o convite)
  inviteData.metadata = {
    nome: nome,
    telefone: telefone || null,
    is_organization_user: isOrganizationUser,
  };

  console.log("=== DEBUG: Tentando criar convite ===");
  console.log("inviteData:", JSON.stringify(inviteData, null, 2));

  // Usar adminClient para bypass RLS policies
  const { error: inviteError, data: invite } = await adminClient
    .from("invites")
    .insert(inviteData)
    .select()
    .single();

  if (inviteError) {
    console.error("=== ERRO DETALHADO ===");
    console.error("Erro completo:", JSON.stringify(inviteError, null, 2));
    console.error("Message:", inviteError.message);
    console.error("Details:", inviteError.details);
    console.error("Hint:", inviteError.hint);
    console.error("Code:", inviteError.code);
    return { error: `Erro ao criar convite: ${inviteError.message}` };
  }

  console.log("=== Convite criado com sucesso! ===");
  console.log("Invite ID:", invite.id);

  // TODO: Enviar e-mail com link de convite
  // Link seria algo como: https://app.fluzz.io/invite/${invite.id}
  console.log(`Convite criado: ${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.id}`);

  revalidatePath("/team");
  return { success: true, inviteId: invite.id };
}

// Nova função para remover usuário
export async function removeUser(userId: string, organizationId: string) {
  const currentUser = await getUser();
  if (!currentUser) {
    return { error: "Não autenticado" };
  }

  const canRemove = await isOrgAdmin(currentUser.id, organizationId);
  if (!canRemove) {
    return { error: "Sem permissão para remover usuários" };
  }

  const supabase = await createClient();

  // Remover de organization_members
  await supabase
    .from("organization_members")
    .delete()
    .eq("user_id", userId)
    .eq("organization_id", organizationId);

  // Remover de workspace_members de todos os workspaces da organização
  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id")
    .eq("organization_id", organizationId);

  if (workspaces) {
    const workspaceIds = workspaces.map((ws) => ws.id);
    await supabase
      .from("workspace_members")
      .delete()
      .eq("user_id", userId)
      .in("workspace_id", workspaceIds);
  }

  // Remover de department_members
  await supabase.from("department_members").delete().eq("user_id", userId);

  // Soft delete do usuário
  const { error } = await supabase
    .from("users")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("Erro ao remover usuário:", error);
    return { error: "Erro ao remover usuário" };
  }

  revalidatePath("/team");
  return { success: true };
}

// Manter funções antigas para compatibilidade
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

  const email = formData.get("email") as string;
  const role = formData.get("role") as string;

  if (!email || !role) {
    return { error: "Preencha todos os campos" };
  }

  const supabase = await createClient();

  // Check if user already exists in organization
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
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
    .eq("email", email)
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
    email: email,
    role: role,
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

  // Get organization_id from workspace (apenas não deletados)
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("organization_id")
    .eq("id", workspaceId)
    .is("deleted_at", null)
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

  // Atualizar status para cancelled ao invés de deletar
  const { error } = await supabase
    .from("invites")
    .update({ status: "cancelled" })
    .eq("id", inviteId);

  if (error) {
    console.error("Erro ao cancelar convite:", error);
    return { error: "Erro ao cancelar convite" };
  }

  revalidatePath("/team");
  return { success: true };
}

export async function resendInvite(inviteId: string, organizationId: string) {
  const user = await getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  const canResend = await isOrgAdmin(user.id, organizationId);
  if (!canResend) {
    return { error: "Sem permissão" };
  }

  const supabase = await createClient();

  // Buscar convite antigo
  const { data: oldInvite, error: fetchError } = await supabase
    .from("invites")
    .select("*")
    .eq("id", inviteId)
    .single();

  if (fetchError || !oldInvite) {
    return { error: "Convite não encontrado" };
  }

  // Cancelar o convite antigo
  await supabase
    .from("invites")
    .update({ status: "expired" })
    .eq("id", inviteId);

  // Criar novo convite com nova data de expiração
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const newInviteData: any = {
    organization_id: oldInvite.organization_id,
    workspace_id: oldInvite.workspace_id,
    email: oldInvite.email,
    role: oldInvite.role,
    status: "pending",
    expires_at: expiresAt.toISOString(),
    invited_by: user.id,
    metadata: oldInvite.metadata,
  };

  const { error: createError, data: newInvite } = await supabase
    .from("invites")
    .insert(newInviteData)
    .select()
    .single();

  if (createError) {
    console.error("Erro ao criar novo convite:", createError);
    return { error: "Erro ao reenviar convite" };
  }

  // TODO: Enviar e-mail com novo link
  console.log(`Novo convite criado: /invite/${newInvite.id}`);

  revalidatePath("/team");
  return { success: true, newInviteId: newInvite.id };
}

