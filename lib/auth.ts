import { createClient } from "@/lib/supabase/server";
import { User } from "@/types";

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  // Tenta buscar o usuário da tabela users
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  // Se não encontrar na tabela (modo mock), retorna dados do auth
  if (!user) {
    return {
      id: authUser.id,
      email: authUser.email!,
      nome: authUser.user_metadata?.nome || authUser.email?.split("@")[0] || "Usuário",
      telefone: authUser.user_metadata?.telefone || null,
      segmento: authUser.user_metadata?.segmento || null,
      created_at: authUser.created_at,
      deleted_at: null,
    } as User;
  }

  return user;
}

export async function getUserWithOrganizations() {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) return null;

  const { data: memberships } = await supabase
    .from("organization_members")
    .select(
      `
      *,
      organizations (*)
    `
    )
    .eq("user_id", user.id);

  return {
    ...user,
    organization_members: memberships || [],
  };
}

