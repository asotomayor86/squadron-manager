"use client";

import { hasPermission, hasAnyPermission } from "@/lib/permissions";

interface PermissionGateProps {
  userPermissions: string[];
  required: string | string[];
  requireAll?: boolean; // true = necesita TODOS, false = basta con uno
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renderiza children solo si el usuario tiene el permiso requerido.
 * Úsalo para ocultar botones/secciones en el cliente sin romper la seguridad
 * (la seguridad real está en los Server Actions y las páginas de servidor).
 */
export function PermissionGate({
  userPermissions,
  required,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGateProps) {
  const allowed = Array.isArray(required)
    ? requireAll
      ? required.every((p) => hasPermission(userPermissions, p))
      : hasAnyPermission(userPermissions, required)
    : hasPermission(userPermissions, required);

  return allowed ? <>{children}</> : <>{fallback}</>;
}
