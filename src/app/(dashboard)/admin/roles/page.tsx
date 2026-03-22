import Link from "next/link";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { auth } from "@/auth";
import { getRoles } from "@/lib/services/roles.service";
import { Button } from "@/components/ui/button";
import { RolCard } from "@/components/roles/rol-card";
import { PlusCircle } from "lucide-react";

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
