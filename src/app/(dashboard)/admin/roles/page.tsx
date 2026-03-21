import Link from "next/link";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { auth } from "@/auth";
import { getRoles } from "@/lib/services/roles.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PermissionGate } from "@/components/shared/permission-gate";
import { deleteRolAction } from "@/actions/roles.actions";
import { PlusCircle, Edit, Trash2, Users } from "lucide-react";

export const metadata = { title: "Roles" };

export default async function RolesPage() {
  await requirePermission(PERMISSIONS.ROLES_READ);
  const session = await auth();
  const userPermissions = session?.user.permissions ?? [];

  const roles = await getRoles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roles</h1>
          <p className="text-muted-foreground mt-1">
            Gestión de roles y sus permisos. Cambios aquí afectan a todos los usuarios asignados.
          </p>
        </div>
        {userPermissions.includes(PERMISSIONS.ROLES_CREATE) && (
          <Button asChild>
            <Link href="/admin/roles/nuevo">
              <PlusCircle className="h-4 w-4" />
              Nuevo rol
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {roles.map((rol) => (
          <RolCard key={rol.id} rol={rol} userPermissions={userPermissions} />
        ))}

        {roles.length === 0 && (
          <p className="text-muted-foreground col-span-3 text-center py-12">
            No hay roles configurados.
          </p>
        )}
      </div>
    </div>
  );
}

function RolCard({
  rol,
  userPermissions,
}: {
  rol: {
    id: string;
    nombre: string;
    descripcion: string | null;
    activo: boolean;
    rolePermissions: { permission: { nombre: string; modulo: string } }[];
    _count: { userRoles: number };
  };
  userPermissions: string[];
}) {
  const modulosUnicos = [...new Set(rol.rolePermissions.map((rp) => rp.permission.modulo))];

  return (
    <div className="border rounded-lg p-4 bg-card space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{rol.nombre}</h3>
            <Badge variant={rol.activo ? "success" : "secondary"}>
              {rol.activo ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          {rol.descripcion && (
            <p className="text-xs text-muted-foreground mt-1">{rol.descripcion}</p>
          )}
        </div>
        <div className="flex gap-1">
          <PermissionGate userPermissions={userPermissions} required={PERMISSIONS.ROLES_UPDATE}>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/admin/roles/${rol.id}`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
          </PermissionGate>
          <PermissionGate userPermissions={userPermissions} required={PERMISSIONS.ROLES_DELETE}>
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              }
              title="Eliminar rol"
              description={`¿Eliminar el rol "${rol.nombre}"? Solo es posible si no tiene usuarios asignados.`}
              confirmLabel="Eliminar"
              onConfirm={() => deleteRolAction(rol.id)}
            />
          </PermissionGate>
        </div>
      </div>

      {/* Módulos con acceso */}
      <div className="flex flex-wrap gap-1">
        {modulosUnicos.map((m) => (
          <Badge key={m} variant="secondary" className="text-xs">
            {m}
          </Badge>
        ))}
        {modulosUnicos.length === 0 && (
          <span className="text-xs text-muted-foreground">Sin permisos</span>
        )}
      </div>

      {/* Usuarios asignados */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-t pt-2">
        <Users className="h-3.5 w-3.5" />
        <span>{rol._count.userRoles} usuario{rol._count.userRoles !== 1 ? "s" : ""} asignado{rol._count.userRoles !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}
