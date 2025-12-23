"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema } from "@/lib/validations/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function login(formData: FormData) {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validated = loginSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      error: validated.error.errors[0].message,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    return {
      error: "E-mail ou senha inválidos",
    };
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

export async function signup(formData: FormData) {
  const rawData = {
    nome: formData.get("nome") as string,
    email: formData.get("email") as string,
    telefone: formData.get("telefone") as string,
    segmento: formData.get("segmento") as string,
    password: formData.get("password") as string,
  };

  const validated = signupSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      error: validated.error.errors[0].message,
    };
  }

  const supabase = await createClient();

  // Cria usuário no Supabase Auth com metadata
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: {
        nome: validated.data.nome,
        telefone: validated.data.telefone,
        segmento: validated.data.segmento,
      },
    },
  });

  if (authError) {
    return {
      error: authError.message,
    };
  }

  if (!authData.user) {
    return {
      error: "Erro ao criar usuário",
    };
  }

  console.log("✅ Usuário criado no Auth:", authData.user.id);
  console.log("   O perfil na tabela 'users' será criado automaticamente pelo trigger.");

  revalidatePath("/", "layout");
  redirect("/auth/confirm-email");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}
