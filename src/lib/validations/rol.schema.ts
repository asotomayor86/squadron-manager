import { z } from "zod";

export const createRolSchema = z.object({
  nombre: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(50)
    .transform((v) => v.toUpperCase()),
  descripcion: z.string().max(255).nullable().optional(),
  activo: z.boolean().default(true),
  permissionIds: z.array(z.string()).default([]),
});

export const updateRolSchema = createRolSchema;

export type CreateRolInput = z.infer<typeof createRolSchema>;
export type UpdateRolInput = z.infer<typeof updateRolSchema>;
