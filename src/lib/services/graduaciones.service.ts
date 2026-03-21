import { prisma } from "@/lib/db";
import type { CreateGraduacionInput, UpdateGraduacionInput } from "@/lib/validations/graduacion.schema";

const graduacionSelect = {
  id: true,
  nombre: true,
  descripcion: true,
  nivel: true,
  activo: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { usuarios: true } },
} as const;

export async function getGraduaciones(soloActivas = false) {
  return prisma.graduacion.findMany({
    where: soloActivas ? { activo: true } : {},
    select: graduacionSelect,
    orderBy: { nivel: "asc" },
  });
}

export async function getGraduacionById(id: string) {
  return prisma.graduacion.findUnique({ where: { id }, select: graduacionSelect });
}

export async function createGraduacion(data: CreateGraduacionInput) {
  return prisma.graduacion.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion ?? null,
      nivel: data.nivel,
      activo: data.activo,
    },
    select: graduacionSelect,
  });
}

export async function updateGraduacion(id: string, data: UpdateGraduacionInput) {
  return prisma.graduacion.update({
    where: { id },
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion ?? null,
      nivel: data.nivel,
      activo: data.activo,
    },
    select: graduacionSelect,
  });
}

export async function deleteGraduacion(id: string) {
  const count = await prisma.user.count({ where: { graduacionId: id } });
  if (count > 0) {
    throw new Error(
      `No se puede eliminar: hay ${count} usuario(s) con esta graduación asignada`
    );
  }
  return prisma.graduacion.delete({ where: { id } });
}
