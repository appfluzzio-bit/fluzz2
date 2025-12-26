import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { WorkspaceProvider } from "@/lib/workspace-context";
import { SidebarProvider } from "@/lib/sidebar-context";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const supabase = await createClient();

  // Verificar se o usuário pertence a uma organização
  const { data: orgMember, error } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .maybeSingle(); // Use maybeSingle() em vez de single() para evitar erro quando não há resultado

  // Log para debug
  console.log("🔍 Verificando organização no dashboard:", {
    userId: user.id,
    hasMember: !!orgMember,
    error: error?.message,
  });

  if (!orgMember) {
    console.log("❌ Usuário sem organização, redirecionando para onboarding");
    redirect("/onboarding");
  }

  // Por enquanto, usar workspaces mockados
  // Será substituído por dados reais quando criarmos a tabela workspaces
  const mockWorkspaces = [
    {
      id: "1",
      name: "Workspace Principal",
      slug: "principal",
      organization_id: orgMember.organization_id,
      created_at: new Date().toISOString(),
    },
  ];

  const workspaces = mockWorkspaces;

  return (
    <WorkspaceProvider
      initialWorkspaces={workspaces}
      initialWorkspace={workspaces[0] || null}
    >
      <SidebarProvider>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header user={user} />
            <main className="flex-1 overflow-y-auto bg-background p-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </WorkspaceProvider>
  );
}
