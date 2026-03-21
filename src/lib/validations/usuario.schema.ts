import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "El usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const createUsuarioSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(100),
  apellidos: z.string().min(1, "Los apellidos son requeridos").max(150),
  username: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(50)
    .regex(/^[a-zA-Z0-9._-]+$/, "Solo letras, números, puntos, guiones y barras bajas"),
  email: z.string().email("Email inválido").max(255),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  activo: z.boolean().default(true),
  graduacionId: z.string().nullable().optional(),
  roleIds: z.array(z.string()).min(1, "Asigna al menos un rol"),
  observaciones: z.string().max(1000).nullable().optional(),
});

export const updateUsuarioSchema = createUsuarioSchema
  .omit({ password: true })
  .extend({
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[0-9]/, "Debe contener al menos un número")
      .optional()
      .or(z.literal("")),
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;
