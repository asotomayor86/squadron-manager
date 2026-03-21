"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PermissionGate } from "@/components/shared/permission-gate";
import { deleteUsuarioAction, toggleUsuarioActivoAction } from "@/actions/usuarios.actions";
import { PERMISSIONS } from "@/lib/permissions";
import { formatDateShort } from "@/lib/utils";

interface Usuario {
  id: string;
  nombre: string;
  apellidos: string;
  username: string;
  email: string;
  activo: boolean;
  fechaAlta: Date;
  graduacion: { nombre: string } | null;
  userRoles: { role: { nombre: string } }[];
}

interface UsuarioTableProps {
  usuarios: Usuario[];
  userPermissions: string[];
}

export function UsuarioTable({ usuarios, userPermissions }: UsuarioTableProps) {
  if (usuarios.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No se encontraron usuarios con los filtros aplicados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nombre</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Usuario</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Graduación</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Roles</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Alta</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {usuarios.map((u) => (
            <UsuarioRow key={u.id} usuario={u} userPermissions={userPermissions} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsuarioRow({
  usuario,
  userPermissions,
}: {
  usuario: Usuario;
  userPermissions: string[];
}) {
  const [, startTransition] = useTransition();

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="font-medium">
            {usuario.nombre} {usuario.apellidos}
          </p>
          <p className="text-xs text-muted-foreground">{usuario.email}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground">@{usuario.username}</td>
      <td className="px-4 py-3 hidden md:table-cell">
        {usuario.graduacion ? (
          <Badge variant="outline">{usuario.graduacion.nombre}</Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="flex flex-wrap gap-1">
          {usuario.userRoles.map((ur) => (
            <Badge key={ur.role.nombre} variant="secondary" className="text-xs">
              {ur.role.nombre}
            </Badge>
          ))}
        </div>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
        {formatDateShort(usuario.fechaAlta)}
      </td>
      <td className="px-4 py-3">
        <Badge variant={usuario.activo ? "success" : "destructive"}>
          {usuario.activo ? "Activo" : "Inactivo"}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          {/* Editar */}
          <PermissionGate userPermissions={userPermissions} required={PERMISSIONS.USERS_UPDATE}>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/admin/usuarios/${usuario.id}`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
          </PermissionGate>

          {/* Toggle activo */}
          <PermissionGate userPermissions={userPermissions} required={PERMISSIONS.USERS_UPDATE}>
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="icon">
                  {usuario.activo ? (
                    <ToggleRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              }
              title={usuario.activo ? "Desactivar usuario" : "Activar usuario"}
              description={`¿Deseas ${usuario.activo ? "desactivar" : "activar"} a ${usuario.nombre} ${usuario.apellidos}?`}
              confirmLabel={usuario.activo ? "Desactivar" : "Activar"}
              variant={usuario.activo ? "destructive" : "default"}
              onConfirm={() => toggleUsuarioActivoAction(usuario.id)}
            />
          </PermissionGate>

          {/* Eliminar */}
          <PermissionGate userPermissions={userPermissions} required={PERMISSIONS.USERS_DELETE}>
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              }
              title="Eliminar usuario"
              description={`Esta acción es irreversible. ¿Deseas eliminar a ${usuario.nombre} ${usuario.apellidos}?`}
              confirmLabel="Eliminar"
              onConfirm={() => deleteUsuarioAction(usuario.id)}
            />
          </PermissionGate>
        </div>
      </td>
    </tr>
  );
}
