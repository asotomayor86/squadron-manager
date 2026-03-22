"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PermissionGate } from "@/components/shared/permission-gate";
import { deleteGraduacionAction } from "@/actions/graduaciones.actions";
import { Edit, Trash2, Users } from "lucide-react";

interface Graduacion {
  id: string;
  nombre: string;
  descripcion: string | null;
  nivel: number;
  activo: boolean;
  _count: { usuarios: number };
}

interface GraduacionesTableProps {
  graduaciones: Graduacion[];
  userPermissions: string[];
}

export function GraduacionesTable({ graduaciones, userPermissions }: GraduacionesTableProps) {
  return (
    <tbody className="divide-y">
      {graduaciones.map((g) => (
        <tr key={g.id} className="hover:bg-muted/30 transition-colors">
          <td className="px-4 py-3">
            <span className="font-mono font-bold text-muted-foreground">{g.nivel}</span>
          </td>
          <td className="px-4 py-3 font-medium">{g.nombre}</td>
          <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
            {g.descripcion ?? "—"}
          </td>
          <td className="px-4 py-3">
            <Badge variant={g.activo ? "success" : "secondary"}>
              {g.activo ? "Activa" : "Inactiva"}
            </Badge>
          </td>
          <td className="px-4 py-3">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {g._count.usuarios}
            </span>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center justify-end gap-1">
              <PermissionGate userPermissions={userPermissions} required="graduaciones:update">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/admin/graduaciones/${g.id}`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
              </PermissionGate>
              <PermissionGate userPermissions={userPermissions} required="graduaciones:delete">
                <ConfirmDialog
                  trigger={
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  }
                  title="Eliminar graduación"
                  description={`¿Eliminar "${g.nombre}"? Solo es posible si no tiene usuarios asignados.`}
                  confirmLabel="Eliminar"
                  onConfirm={() => deleteGraduacionAction(g.id)}
                />
              </PermissionGate>
            </div>
          </td>
        </tr>
      ))}

      {graduaciones.length === 0 && (
        <tr>
          <td colSpan={6} className="text-center py-12 text-muted-foreground">
            No hay graduaciones configuradas.
          </td>
        </tr>
      )}
    </tbody>
  );
}
