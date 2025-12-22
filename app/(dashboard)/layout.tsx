import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getUserWorkspaces } from "@/lib/permissions";
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

  // Get user's organizations
  const supabase = await createClient();
  const { data: orgMembers } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(*)")
    .eq("user_id", user.id);

  if (!orgMembers || orgMembers.length === 0) {
    redirect("/onboarding");
  }

  const organizationId = (orgMembers[0].organizations as any).id;

  // Get user's workspaces
  const workspaces = await getUserWorkspaces(user.id, organizationId);

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

