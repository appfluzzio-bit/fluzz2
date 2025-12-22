import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if user already has an organization
  const supabase = await createClient();
  const { data: orgMembers } = await supabase
    .from("organization_members")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if (orgMembers && orgMembers.length > 0) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}

