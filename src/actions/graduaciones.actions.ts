"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import * as graduacionesService from "@/lib/services/graduaciones.service";
import { logAction } from "@/lib/services/audit.service";
import { createGraduacionSchema, updateGraduacionSchema } from "@/lib/validations/graduacion.schema";

type ActionResult = { success?: boolean; error?: string };

export async function createGraduacionAction(formData: FormData): Promise<ActionResult> {
  const session = await requirePermission(PERMISSIONS.GRADUACIONES_CREATE);

  const raw = {
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion") || null,
    nivel: formData.get("nivel"),
    activo: formData.get("activo") === "true",
  };

  const parsed = createGraduacionSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Datos inválidos" };
  }

  try {
    const graduacion = await graduacionesService.createGraduacion(parsed.data);
    await logAction({
      actorId: session.user.id,
      accion: "CREATE",
      entidad: "Graduacion",
      entidadId: graduacion.id,
      datosNuevos: { nombre: graduacion.nombre, nivel: graduacion.nivel },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error al crear graduación";
    if (msg.includes("Unique constraint")) return { error: "Ya existe una graduación con ese nombre" };
    return { error: msg };
  }

  revalidatePath("/admin/graduaciones");
  redirect("/admin/graduaciones");
}

export async function updateGraduacionAction(id: string, formData: FormData): Promise<ActionResult> {
  const session = await requirePermission(PERMISSIONS.GRADUACIONES_UPDATE);

  const raw = {
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion") || null,
    nivel: formData.get("nivel"),
    activo: formData.get("activo") === "true",
  };

  const parsed = updateGraduacionSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Datos inválidos" };
  }

  try {
    const anterior = await graduacionesService.getGraduacionById(id);
    const graduacion = await graduacionesService.updateGraduacion(id, parsed.data);
    await logAction({
      actorId: session.user.id,
      accion: "UPDATE",
      entidad: "Graduacion",
      entidadId: id,
      datosAnteriores: anterior ? { nombre: anterior.nombre } : null,
      datosNuevos: { nombre: graduacion.nombre, nivel: graduacion.nivel },
    });
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Error al actualizar graduación" };
  }

  revalidatePath("/admin/graduaciones");
  redirect("/admin/graduaciones");
}

export async function deleteGraduacionAction(id: string): Promise<ActionResult> {
  const session = await requirePermission(PERMISSIONS.GRADUACIONES_DELETE);

  try {
    const graduacion = await graduacionesService.getGraduacionById(id);
    await graduacionesService.deleteGraduacion(id);
    await logAction({
      actorId: session.user.id,
      accion: "DELETE",
      entidad: "Graduacion",
      entidadId: id,
      datosAnteriores: graduacion ? { nombre: graduacion.nombre } : null,
    });
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Error al eliminar graduación" };
  }

  revalidatePath("/admin/graduaciones");
  return { success: true };
}
