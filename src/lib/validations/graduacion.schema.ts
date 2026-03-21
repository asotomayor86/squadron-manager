import { z } from "zod";

export const createGraduacionSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(100),
  descripcion: z.string().max(255).nullable().optional(),
  nivel: z.coerce.number().int().min(0).max(999).default(0),
  activo: z.boolean().default(true),
});

export const updateGraduacionSchema = createGraduacionSchema;

export type CreateGraduacionInput = z.infer<typeof createGraduacionSchema>;
export type UpdateGraduacionInput = z.infer<typeof updateGraduacionSchema>;
