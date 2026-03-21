import Link from "next/link";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { auth } from "@/auth";
import { getGraduaciones } from "@/lib/services/graduaciones.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PermissionGate } from "@/components/shared/permission-gate";
import { deleteGraduacionAction } from "@/actions/graduaciones.actions";
import { PlusCircle, Edit, Trash2, Users, ArrowUpDown } from "lucide-react";

export const metadata = { title: "Graduaciones" };

export default async function GraduacionesPage() {
  await requirePermission(PERMISSIONS.GRADUACIONES_READ);
  const session = await auth();
  const userPermissions = session?.user.permissions ?? [];

  const graduaciones = await getGraduaciones();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Graduaciones / Estados</h1>
          <p className="text-muted-foreground mt-1">
            Categorías configurables asignables a usuarios. Ordenadas por nivel.
          </p>
        </div>
        {userPermissions.includes(PERMISSIONS.GRADUACIONES_CREATE) && (
          <Button asChild>
            <Link href="/admin/graduaciones/nuevo">
              <PlusCircle className="h-4 w-4" />
              Nueva graduación
            </Link>
          </Button>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ArrowUpDown className="h-3.5 w-3.5" /> Nivel
                </span>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Descripción</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Usuarios</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
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
                    <PermissionGate userPermissions={userPermissions} required={PERMISSIONS.GRADUACIONES_UPDATE}>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/graduaciones/${g.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </PermissionGate>

                    <PermissionGate userPermissions={userPermissions} required={PERMISSIONS.GRADUACIONES_DELETE}>
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
        </table>
      </div>
    </div>
  );
}
