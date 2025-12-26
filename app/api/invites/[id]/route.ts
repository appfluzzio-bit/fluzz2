import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Get invite with related data
  const { data: invite, error } = await (supabase
    .from("invites") as any)
    .select(
      `
      *,
      organizations!invites_organization_id_fkey(id, name),
      workspaces(id, name)
    `
    )
    .eq("id", id)
    .single();

  if (error || !invite) {
    return NextResponse.json(
      { error: "Convite não encontrado" },
      { status: 404 }
    );
  }

  // Check if expired
  if ((invite as any).status !== "pending" || new Date((invite as any).expires_at) < new Date()) {
    return NextResponse.json(
      { error: "Este convite expirou ou já foi aceito" },
      { status: 400 }
    );
  }

  // Return invite data
  const inviteData = invite as any;
  return NextResponse.json({
    id: inviteData.id,
    email: inviteData.email,
    role: inviteData.role,
    organization_id: inviteData.organization_id,
    workspace_id: inviteData.workspace_id,
    organization_name: inviteData.organizations?.name,
    workspace_name: inviteData.workspaces?.name || null,
    metadata: inviteData.metadata,
    expires_at: inviteData.expires_at,
  });
}

