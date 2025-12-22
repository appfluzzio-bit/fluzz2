"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";

const organizationSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
});

export async function createOrganization(formData: FormData) {
  const user = await getUser();

  if (!user) {
    return { error: "Usuário não autenticado" };
  }

  const rawData = {
    name: formData.get("name") as string,
  };

  const validated = organizationSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      error: validated.error.errors[0].message,
    };
  }

  const supabase = await createClient();

  // Create organization
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: validated.data.name,
      timezone: "America/Sao_Paulo",
      currency: "BRL",
    })
    .select()
    .single();

  if (orgError) {
    console.error("Erro ao criar organização:", orgError);
    return {
      error: `Erro ao criar organização: ${orgError.message}`,
    };
  }

  if (!org) {
    return {
      error: "Erro ao criar organização",
    };
  }

  // Create organization membership (owner)
  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: org.id,
      user_id: user.id,
      role: "owner",
    });

  if (memberError) {
    console.error("Erro ao criar membership:", memberError);
    return {
      error: `Erro ao criar membership: ${memberError.message}`,
    };
  }

  // Create default workspace
  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({
      organization_id: org.id,
      name: "Principal",
      slug: "principal",
    })
    .select()
    .single();

  if (workspaceError) {
    console.error("Erro ao criar workspace:", workspaceError);
    return {
      error: `Erro ao criar workspace: ${workspaceError.message}`,
    };
  }

  if (!workspace) {
    return {
      error: "Erro ao criar workspace padrão",
    };
  }

  // Add user to workspace
  const { error: workspaceMemberError } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: "admin",
    });

  if (workspaceMemberError) {
    console.error("Erro ao adicionar usuário ao workspace:", workspaceMemberError);
    return {
      error: `Erro ao adicionar usuário ao workspace: ${workspaceMemberError.message}`,
    };
  }

  // Create credit wallet
  await supabase.from("credit_wallets").insert({
    organization_id: org.id,
    balance: 0,
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

