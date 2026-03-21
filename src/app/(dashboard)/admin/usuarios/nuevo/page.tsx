import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { getRoles } from "@/lib/services/roles.service";
import { getGraduaciones } from "@/lib/services/graduaciones.service";
import { UsuarioForm } from "@/components/usuarios/usuario-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Nuevo usuario" };

export default async function NuevoUsuarioPage() {
  await requirePermission(PERMISSIONS.USERS_CREATE);

  const [roles, graduaciones] = await Promise.all([
    getRoles(true),
    getGraduaciones(true),
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link
        href="/admin/usuarios"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a usuarios
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo usuario</CardTitle>
          <CardDescription>
            Rellena los datos para registrar un nuevo miembro del escuadrón.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsuarioForm
            roles={roles}
            graduaciones={graduaciones}
            mode="create"
          />
        </CardContent>
      </Card>
    </div>
  );
}
