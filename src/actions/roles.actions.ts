"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import * as rolesService from "@/lib/services/roles.service";
import { logAction } from "@/lib/services/audit.service";
import { createRolSchema, updateRolSchema } from "@/lib/validations/rol.schema";

type ActionResult = { success?: boolean; error?: string };

export async function createRolAction(formData: FormData): Promise<ActionResult> {
  const session = await requirePermission(PERMISSIONS.ROLES_CREATE);

  const raw = {
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion") || null,
    activo: formData.get("activo") === "true",
    permissionIds: formData.getAll("permissionIds"),
  };

  const parsed = createRolSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Datos inválidos" };
  }

  try {
    const rol = await rolesService.createRol(parsed.data);
    await logAction({
      actorId: session.user.id,
      accion: "CREATE",
      entidad: "Role",
      entidadId: rol.id,
      datosNuevos: { nombre: rol.nombre },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error al crear rol";
    if (msg.includes("Unique constraint")) return { error: "Ya existe un rol con ese nombre" };
    return { error: msg };
  }

  revalidatePath("/admin/roles");
  redirect("/admin/roles");
}

export async function updateRolAction(id: string, formData: FormData): Promise<ActionResult> {
  const session = await requirePermission(PERMISSIONS.ROLES_UPDATE);

  const raw = {
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion") || null,
    activo: formData.get("activo") === "true",
    permissionIds: formData.getAll("permissionIds"),
  };

  const parsed = updateRolSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Datos inválidos" };
  }

  try {
    const anterior = await rolesService.getRolById(id);
    const rol = await rolesService.updateRol(id, parsed.data);
    await logAction({
      actorId: session.user.id,
      accion: "UPDATE",
      entidad: "Role",
      entidadId: id,
      datosAnteriores: anterior ? { nombre: anterior.nombre } : null,
      datosNuevos: { nombre: rol.nombre },
    });
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Error al actualizar rol" };
  }

  revalidatePath("/admin/roles");
  redirect("/admin/roles");
}

export async function deleteRolAction(id: string): Promise<ActionResult> {
  const session = await requirePermission(PERMISSIONS.ROLES_DELETE);

  try {
    const rol = await rolesService.getRolById(id);
    await rolesService.deleteRol(id);
    await logAction({
      actorId: session.user.id,
      accion: "DELETE",
      entidad: "Role",
      entidadId: id,
      datosAnteriores: rol ? { nombre: rol.nombre } : null,
    });
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Error al eliminar rol" };
  }

  revalidatePath("/admin/roles");
  return { success: true };
}
