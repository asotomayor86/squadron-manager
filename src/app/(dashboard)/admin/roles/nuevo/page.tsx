import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { getAllPermissions } from "@/lib/services/roles.service";
import { RolForm } from "@/components/roles/rol-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Nuevo rol" };

export default async function NuevoRolPage() {
  await requirePermission(PERMISSIONS.ROLES_CREATE);
  const permissions = await getAllPermissions();

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
          <CardTitle>Nuevo rol</CardTitle>
          <CardDescription>
            Define el nombre del rol y los permisos que tendrá asignados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RolForm permissions={permissions} mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
