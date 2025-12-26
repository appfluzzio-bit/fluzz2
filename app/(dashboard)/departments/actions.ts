"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { canManageDepartments } from "@/lib/permissions";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const departmentSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
});

export async function createDepartment(formData: FormData) {
  const user = await getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  const workspaceId = formData.get("workspace_id") as string;

  const canManage = await canManageDepartments(user.id, workspaceId);
  if (!canManage) {
    return { error: "Sem permissão para criar departamentos" };
  }

  const rawData = {
    name: formData.get("name") as string,
  };

  const validated = departmentSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const supabase = await createClient();

  const { data: department, error } = await (supabase
    .from("departments") as any)
    .insert({
      workspace_id: workspaceId,
      name: validated.data.name,
    })
    .select()
    .single();

  if (error || !department) {
    return { error: "Erro ao criar departamento" };
  }

  revalidatePath("/departments");
  return { success: true, department };
}

export async function updateDepartment(formData: FormData) {
  const user = await getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  const departmentId = formData.get("department_id") as string;
  const workspaceId = formData.get("workspace_id") as string;

  const canManage = await canManageDepartments(user.id, workspaceId);
  if (!canManage) {
    return { error: "Sem permissão" };
  }

  const rawData = {
    name: formData.get("name") as string,
  };

  const validated = departmentSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const supabase = await createClient();

  const { error } = await (supabase
    .from("departments") as any)
    .update({
      name: validated.data.name,
    })
    .eq("id", departmentId);

  if (error) {
    return { error: "Erro ao atualizar departamento" };
  }

  revalidatePath("/departments");
  return { success: true };
}

export async function deleteDepartment(departmentId: string, workspaceId: string) {
  const user = await getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  const canManage = await canManageDepartments(user.id, workspaceId);
  if (!canManage) {
    return { error: "Sem permissão" };
  }

  const supabase = await createClient();

  const { error } = await (supabase
    .from("departments") as any)
    .delete()
    .eq("id", departmentId);

  if (error) {
    return { error: "Erro ao excluir departamento" };
  }

  revalidatePath("/departments");
  return { success: true };
}

export async function addDepartmentMember(
  departmentId: string,
  userId: string,
  role: "manager" | "agent",
  workspaceId: string
) {
  const user = await getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  const canManage = await canManageDepartments(user.id, workspaceId);
  if (!canManage) {
    return { error: "Sem permissão" };
  }

  const supabase = await createClient();

  const { error } = await (supabase.from("department_members") as any).insert({
    department_id: departmentId,
    user_id: userId,
    role: role,
  });

  if (error) {
    return { error: "Erro ao adicionar membro" };
  }

  revalidatePath("/departments");
  return { success: true };
}

export async function removeDepartmentMember(
  departmentMemberId: string,
  workspaceId: string
) {
  const user = await getUser();
  if (!user) {
    return { error: "Não autenticado" };
  }

  const canManage = await canManageDepartments(user.id, workspaceId);
  if (!canManage) {
    return { error: "Sem permissão" };
  }

  const supabase = await createClient();

  const { error } = await (supabase
    .from("department_members") as any)
    .delete()
    .eq("id", departmentMemberId);

  if (error) {
    return { error: "Erro ao remover membro" };
  }

  revalidatePath("/departments");
  return { success: true };
}

