import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Onboarding com dados mockados
  // Verificação de onboarding completo será feita no client (localStorage)
  return <>{children}</>;
}

