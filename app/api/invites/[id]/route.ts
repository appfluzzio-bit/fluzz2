import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Get invite with related data
  const { data: invite, error } = await supabase
    .from("invites")
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
  if (invite.status !== "pending" || new Date(invite.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "Este convite expirou ou já foi aceito" },
      { status: 400 }
    );
  }

  // Return invite data
  return NextResponse.json({
    id: invite.id,
    email: invite.email,
    role: invite.role,
    organization_id: invite.organization_id,
    workspace_id: invite.workspace_id,
    organization_name: (invite.organizations as any)?.name,
    workspace_name: invite.workspaces ? (invite.workspaces as any).name : null,
    metadata: invite.metadata,
    expires_at: invite.expires_at,
  });
}

