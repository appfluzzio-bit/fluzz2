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

  // Verificar se o usuário já pertence a uma organização
  const supabase = await createClient();
  const { data: existingMember, error } = await supabase
    .from("organization_members")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle(); // Use maybeSingle() em vez de single() para evitar erro quando não há resultado

  // Log para debug
  console.log("🔍 Verificando organização no onboarding:", {
    userId: user.id,
    hasMember: !!existingMember,
    error: error?.message,
  });

  // Se já pertence a uma organização, redirecionar para o dashboard
  if (existingMember) {
    console.log("✅ Usuário já tem organização, redirecionando para dashboard");
    redirect("/dashboard");
  }

  return <>{children}</>;
}
