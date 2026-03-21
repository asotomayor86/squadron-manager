import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { getGraduacionById } from "@/lib/services/graduaciones.service";
import { GraduacionForm } from "@/components/graduaciones/graduacion-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Editar graduación" };

export default async function EditarGraduacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission(PERMISSIONS.GRADUACIONES_UPDATE);
  const { id } = await params;
  const graduacion = await getGraduacionById(id);
  if (!graduacion) notFound();

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
          <CardTitle>Editar: {graduacion.nombre}</CardTitle>
          <CardDescription>
            Los cambios se reflejan en todos los usuarios con esta graduación asignada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GraduacionForm
            mode="edit"
            defaultValues={{
              id: graduacion.id,
              nombre: graduacion.nombre,
              descripcion: graduacion.descripcion,
              nivel: graduacion.nivel,
              activo: graduacion.activo,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
