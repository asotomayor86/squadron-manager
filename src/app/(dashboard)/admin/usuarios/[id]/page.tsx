import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { getUsuarioById } from "@/lib/services/usuarios.service";
import { getRoles } from "@/lib/services/roles.service";
import { getGraduaciones } from "@/lib/services/graduaciones.service";
import { UsuarioForm } from "@/components/usuarios/usuario-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils";

export const metadata = { title: "Editar usuario" };

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission(PERMISSIONS.USERS_UPDATE);
  const { id } = await params;

  const [usuario, roles, graduaciones] = await Promise.all([
    getUsuarioById(id),
    getRoles(true),
    getGraduaciones(true),
  ]);

  if (!usuario) notFound();

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
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>
                {usuario.nombre} {usuario.apellidos}
              </CardTitle>
              <CardDescription className="mt-1">
                @{usuario.username} · Alta: {formatDateShort(usuario.fechaAlta)}
              </CardDescription>
            </div>
            <Badge variant={usuario.activo ? "success" : "destructive"}>
              {usuario.activo ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <UsuarioForm
            roles={roles}
            graduaciones={graduaciones}
            mode="edit"
            defaultValues={{
              id: usuario.id,
              nombre: usuario.nombre,
              apellidos: usuario.apellidos,
              username: usuario.username,
              email: usuario.email,
              activo: usuario.activo,
              graduacionId: usuario.graduacionId ?? null,
              roleIds: usuario.userRoles.map((ur) => ur.role.id),
              observaciones: usuario.observaciones,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
