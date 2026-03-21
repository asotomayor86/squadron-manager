import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { headers } from "next/headers";

interface LogActionParams {
  actorId?: string | null;
  accion: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "TOGGLE";
  entidad: string;
  entidadId?: string | null;
  datosAnteriores?: Record<string, unknown> | null;
  datosNuevos?: Record<string, unknown> | null;
}

export async function logAction(params: LogActionParams) {
  try {
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      "unknown";
    const userAgent = headersList.get("user-agent") ?? undefined;

    await prisma.auditLog.create({
      data: {
        actorId: params.actorId ?? null,
        accion: params.accion,
        entidad: params.entidad,
        entidadId: params.entidadId ?? null,
        datosAnteriores: (params.datosAnteriores ?? undefined) as Prisma.InputJsonValue | undefined,
        datosNuevos: (params.datosNuevos ?? undefined) as Prisma.InputJsonValue | undefined,
        ip,
        userAgent,
      },
    });
  } catch (error) {
    // La auditoría no debe romper el flujo principal
    console.error("[AuditLog] Error al registrar:", error);
  }
}

export async function getAuditLogs({
  page = 1,
  limit = 20,
  entidad,
  actorId,
}: {
  page?: number;
  limit?: number;
  entidad?: string;
  actorId?: string;
}) {
  const where = {
    ...(entidad ? { entidad } : {}),
    ...(actorId ? { actorId } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        actor: { select: { nombre: true, apellidos: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, pages: Math.ceil(total / limit) };
}
