import { prisma } from "@/lib/db";
import type { CreateRolInput, UpdateRolInput } from "@/lib/validations/rol.schema";

const rolSelect = {
  id: true,
  nombre: true,
  descripcion: true,
  activo: true,
  createdAt: true,
  updatedAt: true,
  rolePermissions: {
    include: {
      permission: { select: { id: true, nombre: true, modulo: true, accion: true } },
    },
  },
  _count: { select: { userRoles: true } },
} as const;

export async function getRoles(soloActivos = false) {
  return prisma.role.findMany({
    where: soloActivos ? { activo: true } : {},
    select: rolSelect,
    orderBy: { nombre: "asc" },
  });
}

export async function getRolById(id: string) {
  return prisma.role.findUnique({ where: { id }, select: rolSelect });
}

export async function createRol(data: CreateRolInput) {
  return prisma.role.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion ?? null,
      activo: data.activo,
      rolePermissions: {
        create: data.permissionIds.map((permissionId) => ({ permissionId })),
      },
    },
    select: rolSelect,
  });
}

export async function updateRol(id: string, data: UpdateRolInput) {
  return prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({ where: { roleId: id } });

    return tx.role.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
        activo: data.activo,
        rolePermissions: {
          create: data.permissionIds.map((permissionId) => ({ permissionId })),
        },
      },
      select: rolSelect,
    });
  });
}

export async function deleteRol(id: string) {
  // Verificar que no tenga usuarios asignados
  const count = await prisma.userRole.count({ where: { roleId: id } });
  if (count > 0) {
    throw new Error(
      `No se puede eliminar: hay ${count} usuario(s) con este rol asignado`
    );
  }
  return prisma.role.delete({ where: { id } });
}

export async function getAllPermissions() {
  return prisma.permission.findMany({
    orderBy: [{ modulo: "asc" }, { accion: "asc" }],
  });
}
