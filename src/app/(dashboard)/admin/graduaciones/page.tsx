import Link from "next/link";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { auth } from "@/auth";
import { getGraduaciones } from "@/lib/services/graduaciones.service";
import { Button } from "@/components/ui/button";
import { GraduacionesTable } from "@/components/graduaciones/graduaciones-table";
import { PlusCircle, ArrowUpDown } from "lucide-react";

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
          <GraduacionesTable graduaciones={graduaciones} userPermissions={userPermissions} />
        </table>
      </div>
    </div>
  );
}
