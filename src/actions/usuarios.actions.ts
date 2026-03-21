"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import * as usuariosService from "@/lib/services/usuarios.service";
import { logAction } from "@/lib/services/audit.service";
import { createUsuarioSchema, updateUsuarioSchema } from "@/lib/validations/usuario.schema";

type ActionResult = { success?: boolean; error?: string; fieldErrors?: Record<string, string[]> };

export async function createUsuarioAction(formData: FormData): Promise<ActionResult> {
  const session = await requirePermission(PERMISSIONS.USERS_CREATE);

  const raw = {
    nombre: formData.get("nombre"),
    apellidos: formData.get("apellidos"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    activo: formData.get("activo") === "true",
    graduacionId: formData.get("graduacionId") || null,
    roleIds: formData.getAll("roleIds"),
    observaciones: formData.get("observaciones") || null,
  };

  const parsed = createUsuarioSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Datos inválidos", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const usuario = await usuariosService.createUsuario(parsed.data);
    await logAction({
      actorId: session.user.id,
      accion: "CREATE",
      entidad: "User",
      entidadId: usuario.id,
      datosNuevos: { username: usuario.username, email: usuario.email },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error al crear usuario";
    if (msg.includes("Unique constraint")) {
      return { error: "El username o email ya están en uso" };
    }
    return { error: msg };
  }

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

export async function updateUsuarioAction(id: string, formData: FormData): Promise<ActionResult> {
  const session = await requirePermission(PERMISSIONS.USERS_UPDATE);

  const raw = {
    nombre: formData.get("nombre"),
    apellidos: formData.get("apellidos"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password") || "",
    activo: formData.get("activo") === "true",
    graduacionId: formData.get("graduacionId") || null,
    roleIds: formData.getAll("roleIds"),
    observaciones: formData.get("observaciones") || null,
  };

  const parsed = updateUsuarioSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Datos inválidos", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const anterior = await usuariosService.getUsuarioById(id);
    const usuario = await usuariosService.updateUsuario(id, parsed.data);
    await logAction({
      actorId: session.user.id,
      accion: "UPDATE",
      entidad: "User",
      entidadId: id,
      datosAnteriores: anterior
        ? { username: anterior.username, activo: anterior.activo }
        : null,
      datosNuevos: { username: usuario.username, activo: usuario.activo },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error al actualizar usuario";
    return { error: msg };
  }

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

export async function deleteUsuarioAction(id: string): Promise<ActionResult> {
  const session = await requirePermission(PERMISSIONS.USERS_DELETE);

  try {
    const usuario = await usuariosService.getUsuarioById(id);
    await usuariosService.deleteUsuario(id);
    await logAction({
      actorId: session.user.id,
      accion: "DELETE",
      entidad: "User",
      entidadId: id,
      datosAnteriores: usuario ? { username: usuario.username } : null,
    });
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Error al eliminar usuario" };
  }

  revalidatePath("/admin/usuarios");
  return { success: true };
}

export async function toggleUsuarioActivoAction(id: string): Promise<ActionResult> {
  const session = await requirePermission(PERMISSIONS.USERS_UPDATE);

  try {
    const usuario = await usuariosService.toggleUsuarioActivo(id);
    await logAction({
      actorId: session.user.id,
      accion: "TOGGLE",
      entidad: "User",
      entidadId: id,
      datosNuevos: { activo: usuario.activo },
    });
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Error al cambiar estado" };
  }

  revalidatePath("/admin/usuarios");
  return { success: true };
}
