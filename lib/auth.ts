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

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

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

