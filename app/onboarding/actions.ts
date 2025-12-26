"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createOrganizationSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
});

export async function createOrganization(formData: FormData) {
  const rawData = {
    name: formData.get("name") as string,
  };

  // Validar dados
  const validated = createOrganizationSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      error: validated.error.errors[0].message,
    };
  }

  const supabase = await createClient();

  // Verificar se o usuário está autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Usuário não autenticado",
    };
  }

  // Criar a organização usando a função RPC (bypassa RLS de forma segura)
  const { data: organization, error: orgError } = await (supabase.rpc as any)(
    "create_organization_with_owner",
    {
      org_name: validated.data.name,
      owner_user_id: user.id,
    }
  );

  if (orgError) {
    console.error("❌ Erro ao criar organização:", orgError);
    return {
      error: `Erro ao criar organização: ${orgError.message}`,
    };
  }

  console.log("✅ Organização criada:", organization);

  // Revalidar múltiplos caminhos para garantir que o cache seja limpo
  revalidatePath("/", "layout");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/onboarding", "layout");
  
  redirect("/dashboard");
}
