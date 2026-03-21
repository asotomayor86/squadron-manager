import { auth } from "@/auth";
import { redirect } from "next/navigation";

// ── Helpers de servidor ────────────────────────────────────────────────────

/** Obtiene la sesión actual. Lanza redirect si no hay sesión. */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

/** Verifica que el usuario tenga un permiso específico.
 *  Si no lo tiene, redirige a /403. */
export async function requirePermission(permission: string) {
  const session = await requireAuth();
  if (!session.user.permissions.includes(permission)) {
    redirect("/403");
  }
  return session;
}

/** Verifica que el usuario tenga AL MENOS uno de los permisos dados. */
export async function requireAnyPermission(permissions: string[]) {
  const session = await requireAuth();
  const hasAny = permissions.some((p) =>
    session.user.permissions.includes(p)
  );
  if (!hasAny) redirect("/403");
  return session;
}

// ── Helpers de cliente / compartidos ──────────────────────────────────────

/** Comprueba si una lista de permisos incluye el requerido. */
export function hasPermission(
  userPermissions: string[],
  required: string
): boolean {
  return userPermissions.includes(required);
}

/** Comprueba si una lista de permisos incluye al menos uno. */
export function hasAnyPermission(
  userPermissions: string[],
  required: string[]
): boolean {
  return required.some((p) => userPermissions.includes(p));
}

/** Comprueba si el usuario tiene un rol concreto. */
export function hasRole(userRoles: string[], role: string): boolean {
  return userRoles.includes(role);
}

// ── Constantes de permisos (evita strings mágicos) ────────────────────────
export const PERMISSIONS = {
  USERS_READ: "users:read",
  USERS_CREATE: "users:create",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",

  ROLES_READ: "roles:read",
  ROLES_CREATE: "roles:create",
  ROLES_UPDATE: "roles:update",
  ROLES_DELETE: "roles:delete",

  GRADUACIONES_READ: "graduaciones:read",
  GRADUACIONES_CREATE: "graduaciones:create",
  GRADUACIONES_UPDATE: "graduaciones:update",
  GRADUACIONES_DELETE: "graduaciones:delete",

  ADMIN_ACCESS: "admin:access",
  AUDIT_READ: "audit:read",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
