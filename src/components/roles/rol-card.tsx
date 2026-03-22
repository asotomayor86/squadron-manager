"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PermissionGate } from "@/components/shared/permission-gate";
import { deleteRolAction } from "@/actions/roles.actions";
import { Edit, Trash2, Users } from "lucide-react";

interface RolCardProps {
  rol: {
    id: string;
    nombre: string;
    descripcion: string | null;
    activo: boolean;
    rolePermissions: { permission: { nombre: string; modulo: string } }[];
    _count: { userRoles: number };
  };
  userPermissions: string[];
}

export function RolCard({ rol, userPermissions }: RolCardProps) {
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
          <PermissionGate userPermissions={userPermissions} required="roles:update">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/admin/roles/${rol.id}`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
          </PermissionGate>
          <PermissionGate userPermissions={userPermissions} required="roles:delete">
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

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-t pt-2">
        <Users className="h-3.5 w-3.5" />
        <span>{rol._count.userRoles} usuario{rol._count.userRoles !== 1 ? "s" : ""} asignado{rol._count.userRoles !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}
