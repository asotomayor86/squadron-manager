/**
 * Constantes y helpers de permisos — seguros para Client Components.
 * No importa nada de servidor (auth, prisma, bcryptjs).
 */

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

export function hasPermission(userPermissions: string[], required: string): boolean {
  return userPermissions.includes(required);
}

export function hasAnyPermission(userPermissions: string[], required: string[]): boolean {
  return required.some((p) => userPermissions.includes(p));
}

export function hasRole(userRoles: string[], role: string): boolean {
  return userRoles.includes(role);
}
