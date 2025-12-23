import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { WorkspaceProvider } from "@/lib/workspace-context";
import { SidebarProvider } from "@/lib/sidebar-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Mock workspaces data - será substituído por dados reais depois
  const mockWorkspaces = [
    {
      id: "1",
      name: "Workspace Principal",
      slug: "principal",
      organization_id: "mock-org-1",
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

