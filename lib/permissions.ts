import { createClient } from "@/lib/supabase/server";
import { OrganizationRole, WorkspaceRole } from "@/types";

export async function isOrgAdmin(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await (supabase
    .from("organization_members") as any)
    .select("role")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .single();

  return (data as any)?.role === "owner" || (data as any)?.role === "admin";
}

export async function isOrgOwner(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await (supabase
    .from("organization_members") as any)
    .select("role")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .single();

  return (data as any)?.role === "owner";
}

export async function canManageWorkspaces(
  userId: string,
  organizationId: string
): Promise<boolean> {
  return await isOrgAdmin(userId, organizationId);
}

export async function canManageWorkspaceMembers(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  const supabase = await createClient();

  // Check if user is workspace admin or manager
  const { data: workspaceMember } = await (supabase
    .from("workspace_members") as any)
    .select("role, workspaces!inner(organization_id)")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .single();

  if (!workspaceMember) return false;

  // Workspace admins can manage members
  if (
    (workspaceMember as any).role === "admin" ||
    (workspaceMember as any).role === "manager"
  ) {
    return true;
  }

  // Organization admins can also manage workspace members
  const organizationId = (
    workspaceMember.workspaces as unknown as { organization_id: string }
  ).organization_id;
  return await isOrgAdmin(userId, organizationId);
}

export async function canManageDepartments(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data: workspaceMember } = await (supabase
    .from("workspace_members") as any)
    .select("role, workspaces!inner(organization_id)")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .single();

  if (!workspaceMember) return false;

  if (
    (workspaceMember as any).role === "admin" ||
    (workspaceMember as any).role === "manager"
  ) {
    return true;
  }

  const organizationId = (
    workspaceMember.workspaces as unknown as { organization_id: string }
  ).organization_id;
  return await isOrgAdmin(userId, organizationId);
}

export async function getOrgRole(
  userId: string,
  organizationId: string
): Promise<OrganizationRole | null> {
  const supabase = await createClient();

  const { data } = await (supabase
    .from("organization_members") as any)
    .select("role")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .single();

  return (data as any)?.role as OrganizationRole | null;
}

export async function getWorkspaceRole(
  userId: string,
  workspaceId: string
): Promise<WorkspaceRole | null> {
  const supabase = await createClient();

  const { data } = await (supabase
    .from("workspace_members") as any)
    .select("role")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .single();

  return (data as any)?.role as WorkspaceRole | null;
}

export async function getUserWorkspaces(userId: string, organizationId: string) {
  const supabase = await createClient();

  // Check if user is org admin (sees all workspaces)
  const isAdmin = await isOrgAdmin(userId, organizationId);

  if (isAdmin) {
    const { data } = await (supabase
      .from("workspaces") as any)
      .select("*")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("name");

    return data || [];
  }

  // Otherwise, only see workspaces where user is a member
  const { data } = await (supabase
    .from("workspace_members") as any)
    .select("workspaces!inner(*)")
    .eq("user_id", userId)
    .eq("workspaces.organization_id", organizationId);

  return data?.map((m: any) => m.workspaces) || [];
}

