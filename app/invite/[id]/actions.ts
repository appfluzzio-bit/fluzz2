"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function acceptInvite(formData: FormData) {
  const inviteId = formData.get("invite_id") as string;
  const password = formData.get("password") as string;

  if (!password || password.length < 6) {
    return { error: "Senha deve ter no mínimo 6 caracteres" };
  }

  const supabase = await createClient();

  // Get the invite
  const { data: invite, error: inviteError } = await (supabase
    .from("invites") as any)
    .select("*")
    .eq("id", inviteId)
    .eq("status", "pending")
    .single();

  if (inviteError || !invite) {
    return { error: "Convite inválido ou expirado" };
  }

  // Check if expired
  if (new Date((invite as any).expires_at) < new Date()) {
    return { error: "Este convite expirou" };
  }

  // Check if user already exists
  const { data: existingUser } = await (supabase
    .from("users") as any)
    .select("id")
    .eq("email", (invite as any).email)
    .is("deleted_at", null)
    .single();

  if (existingUser) {
    return { error: "Já existe uma conta com este e-mail" };
  }

  // Get metadata from invite
  const inviteData = invite as any;
  const metadata = inviteData.metadata || {};
  const nome = metadata.nome || inviteData.email.split("@")[0];
  const telefone = metadata.telefone || null;
  const isOrganizationUser = metadata.is_organization_user || false;

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: inviteData.email,
    password: password,
    options: {
      data: {
        nome: nome,
        telefone: telefone,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
    },
  });

  if (authError || !authData.user) {
    console.error("Erro ao criar auth user:", authError);
    return { error: "Erro ao criar conta. Tente novamente." };
  }

  const userId = authData.user.id;

  // Create user in users table
  const { error: userError } = await (supabase.from("users") as any).insert({
    id: userId,
    nome,
    email: inviteData.email,
    telefone: telefone,
  });

  if (userError) {
    console.error("Erro ao criar usuário:", userError);
    // Se der erro, tentar deletar o auth user
    return { error: "Erro ao criar perfil de usuário" };
  }

  // Add user to organization or workspace based on invite
  if (isOrganizationUser || !inviteData.workspace_id) {
    // Organization member
    const { error: orgMemberError } = await (supabase
      .from("organization_members") as any)
      .insert({
        organization_id: inviteData.organization_id,
        user_id: userId,
        role: inviteData.role,
      });

    if (orgMemberError) {
      console.error("Erro ao adicionar à organização:", orgMemberError);
      return { error: "Erro ao adicionar à organização" };
    }

    // Add to all organization workspaces
    const { data: workspaces } = await (supabase
      .from("workspaces") as any)
      .select("id")
      .eq("organization_id", inviteData.organization_id)
      .is("deleted_at", null);

    if (workspaces && workspaces.length > 0) {
      const workspaceMembers = workspaces.map((ws: any) => ({
        workspace_id: ws.id,
        user_id: userId,
        role: "admin" as const,
      }));

      await (supabase.from("workspace_members") as any).insert(workspaceMembers);
    }
  } else {
    // Workspace member only
    const { error: wsMemberError } = await (supabase
      .from("workspace_members") as any)
      .insert({
        workspace_id: inviteData.workspace_id,
        user_id: userId,
        role: inviteData.role,
      });

    if (wsMemberError) {
      console.error("Erro ao adicionar ao workspace:", wsMemberError);
      return { error: "Erro ao adicionar ao workspace" };
    }
  }

  // Mark invite as accepted
  await (supabase
    .from("invites") as any)
    .update({ status: "accepted" })
    .eq("id", inviteId);

  revalidatePath("/team");
  
  // Sign in the user automatically
  await supabase.auth.signInWithPassword({
    email: inviteData.email,
    password: password,
  });

  return { success: true };
}
