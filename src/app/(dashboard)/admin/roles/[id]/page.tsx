import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { getRolById, getAllPermissions } from "@/lib/services/roles.service";
import { RolForm } from "@/components/roles/rol-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Editar rol" };

export default async function EditarRolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission(PERMISSIONS.ROLES_UPDATE);
  const { id } = await params;

  const [rol, permissions] = await Promise.all([
    getRolById(id),
    getAllPermissions(),
  ]);

  if (!rol) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link
        href="/admin/roles"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a roles
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Editar rol: {rol.nombre}</CardTitle>
          <CardDescription>
            Modifica los permisos del rol. Los cambios aplican inmediatamente a todos los usuarios con este rol.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RolForm
            permissions={permissions}
            mode="edit"
            defaultValues={{
              id: rol.id,
              nombre: rol.nombre,
              descripcion: rol.descripcion,
              activo: rol.activo,
              permissionIds: rol.rolePermissions.map((rp) => rp.permission.id),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
