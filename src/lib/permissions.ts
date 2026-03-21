import { auth } from "@/auth";
import { redirect } from "next/navigation";

// Re-exportamos todo lo del módulo compartido para que los Server Components
// puedan seguir importando desde un único lugar
export { PERMISSIONS, hasPermission, hasAnyPermission, hasRole } from "./permissions.shared";
export type { Permission } from "./permissions.shared";

// ── Helpers exclusivos de servidor ────────────────────────────────────────

/** Obtiene la sesión actual. Redirige a /login si no hay sesión. */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

/** Verifica un permiso específico. Redirige a /403 si no lo tiene. */
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
  const hasAny = permissions.some((p) => session.user.permissions.includes(p));
  if (!hasAny) redirect("/403");
  return session;
}
