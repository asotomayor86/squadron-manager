import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/hash";
import type { CreateUsuarioInput, UpdateUsuarioInput } from "@/lib/validations/usuario.schema";

// Selección de campos para listados (sin password)
const usuarioSelect = {
  id: true,
  nombre: true,
  apellidos: true,
  username: true,
  email: true,
  activo: true,
  fechaAlta: true,
  observaciones: true,
  graduacionId: true,
  createdAt: true,
  updatedAt: true,
  graduacion: { select: { id: true, nombre: true, nivel: true } },
  userRoles: {
    include: { role: { select: { id: true, nombre: true } } },
  },
} as const;

export async function getUsuarios({
  page = 1,
  limit = 15,
  search = "",
  activo,
  roleId,
  graduacionId,
}: {
  page?: number;
  limit?: number;
  search?: string;
  activo?: boolean;
  roleId?: string;
  graduacionId?: string;
} = {}) {
  const where = {
    ...(activo !== undefined ? { activo } : {}),
    ...(graduacionId ? { graduacionId } : {}),
    ...(search
      ? {
          OR: [
            { nombre: { contains: search, mode: "insensitive" as const } },
            { apellidos: { contains: search, mode: "insensitive" as const } },
            { username: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(roleId
      ? { userRoles: { some: { roleId } } }
      : {}),
  };

  const [usuarios, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: usuarioSelect,
      orderBy: [{ apellidos: "asc" }, { nombre: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { usuarios, total, pages: Math.ceil(total / limit) };
}

export async function getUsuarioById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: usuarioSelect,
  });
}

export async function createUsuario(data: CreateUsuarioInput) {
  const hashedPassword = await hashPassword(data.password);

  return prisma.user.create({
    data: {
      nombre: data.nombre,
      apellidos: data.apellidos,
      username: data.username,
      email: data.email,
      password: hashedPassword,
      activo: data.activo,
      graduacionId: data.graduacionId ?? null,
      observaciones: data.observaciones ?? null,
      userRoles: {
        create: data.roleIds.map((roleId) => ({ roleId })),
      },
    },
    select: usuarioSelect,
  });
}

export async function updateUsuario(id: string, data: UpdateUsuarioInput) {
  const updateData: Record<string, unknown> = {
    nombre: data.nombre,
    apellidos: data.apellidos,
    username: data.username,
    email: data.email,
    activo: data.activo,
    graduacionId: data.graduacionId ?? null,
    observaciones: data.observaciones ?? null,
  };

  // Solo actualizar password si se proporcionó una nueva
  if (data.password && data.password.trim() !== "") {
    updateData.password = await hashPassword(data.password);
  }

  return prisma.$transaction(async (tx) => {
    // Eliminar roles actuales y asignar los nuevos
    await tx.userRole.deleteMany({ where: { userId: id } });

    return tx.user.update({
      where: { id },
      data: {
        ...updateData,
        userRoles: {
          create: data.roleIds.map((roleId) => ({ roleId })),
        },
      },
      select: usuarioSelect,
    });
  });
}

export async function deleteUsuario(id: string) {
  return prisma.user.delete({ where: { id } });
}

export async function toggleUsuarioActivo(id: string) {
  const usuario = await prisma.user.findUniqueOrThrow({ where: { id } });
  return prisma.user.update({
    where: { id },
    data: { activo: !usuario.activo },
    select: usuarioSelect,
  });
}
