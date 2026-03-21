import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { GraduacionForm } from "@/components/graduaciones/graduacion-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Nueva graduación" };

export default async function NuevaGraduacionPage() {
  await requirePermission(PERMISSIONS.GRADUACIONES_CREATE);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link
        href="/admin/graduaciones"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a graduaciones
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Nueva graduación / estado</CardTitle>
          <CardDescription>
            Crea una nueva categoría asignable a los miembros del escuadrón.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GraduacionForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
