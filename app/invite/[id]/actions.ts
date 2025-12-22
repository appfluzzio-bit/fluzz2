"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function acceptInvite(formData: FormData) {
  const user = await getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  const inviteId = formData.get("invite_id") as string;
  const supabase = await createClient();

  // Get invite
  const { data: invite, error: inviteError } = await supabase
    .from("invites")
    .select("*")
    .eq("id", inviteId)
    .single();

  if (inviteError || !invite) {
    return { error: "Convite não encontrado" };
  }

  // Validate
  if (invite.email !== user.email) {
    return { error: "E-mail não corresponde" };
  }

  if (invite.status !== "pending") {
    return { error: "Convite já foi aceito ou cancelado" };
  }

  if (new Date(invite.expires_at) < new Date()) {
    return { error: "Convite expirado" };
  }

  // Accept invite
  if (invite.workspace_id) {
    // Workspace invite
    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert({
        workspace_id: invite.workspace_id,
        user_id: user.id,
        role: invite.role as "admin" | "manager" | "agent" | "viewer",
      });

    if (memberError) {
      return { error: "Erro ao aceitar convite" };
    }

    // Also ensure user is in organization
    const { data: existingMember } = await supabase
      .from("organization_members")
      .select("id")
      .eq("organization_id", invite.organization_id)
      .eq("user_id", user.id)
      .single();

    if (!existingMember) {
      await supabase.from("organization_members").insert({
        organization_id: invite.organization_id,
        user_id: user.id,
        role: "admin",
      });
    }
  } else {
    // Organization invite only
    const { error: memberError } = await supabase
      .from("organization_members")
      .insert({
        organization_id: invite.organization_id,
        user_id: user.id,
        role: invite.role as "owner" | "admin",
      });

    if (memberError) {
      return { error: "Erro ao aceitar convite" };
    }
  }

  // Mark invite as accepted
  await supabase
    .from("invites")
    .update({ status: "accepted" })
    .eq("id", inviteId);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

