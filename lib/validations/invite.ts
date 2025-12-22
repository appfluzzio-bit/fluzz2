import { z } from "zod";

export const inviteSchema = z.object({
  email: z.string().email("E-mail inválido"),
  role: z.string().min(1, "Selecione uma função"),
});

export type InviteInput = z.infer<typeof inviteSchema>;

