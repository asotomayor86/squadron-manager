import Link from "next/link";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { auth } from "@/auth";
import { getUsuarios } from "@/lib/services/usuarios.service";
import { getRoles } from "@/lib/services/roles.service";
import { getGraduaciones } from "@/lib/services/graduaciones.service";
import { UsuarioTable } from "@/components/usuarios/usuario-table";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export const metadata = { title: "Usuarios" };

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    activo?: string;
    roleId?: string;
    graduacionId?: string;
  }>;
}

export default async function UsuariosPage({ searchParams }: PageProps) {
  await requirePermission(PERMISSIONS.USERS_READ);
  const session = await auth();
  const params = await searchParams;

  const page = parseInt(params.page ?? "1");
  const search = params.search ?? "";
  const activo = params.activo === "true" ? true : params.activo === "false" ? false : undefined;
  const roleId = params.roleId;
  const graduacionId = params.graduacionId;

  const [{ usuarios, total, pages }, roles, graduaciones] = await Promise.all([
    getUsuarios({ page, search, activo, roleId, graduacionId }),
    getRoles(true),
    getGraduaciones(true),
  ]);

  const userPermissions = session?.user.permissions ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            {total} usuario{total !== 1 ? "s" : ""} registrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        {userPermissions.includes(PERMISSIONS.USERS_CREATE) && (
          <Button asChild>
            <Link href="/admin/usuarios/nuevo">
              <UserPlus className="h-4 w-4" />
              Nuevo usuario
            </Link>
          </Button>
        )}
      </div>

      {/* Filtros */}
      <FiltrosUsuarios
        roles={roles}
        graduaciones={graduaciones}
        currentSearch={search}
        currentActivo={params.activo}
        currentRoleId={roleId}
        currentGraduacionId={graduacionId}
      />

      {/* Tabla */}
      <UsuarioTable usuarios={usuarios} userPermissions={userPermissions} />

      {/* Paginación */}
      {pages > 1 && (
        <Pagination currentPage={page} totalPages={pages} />
      )}
    </div>
  );
}

// ── Filtros ────────────────────────────────────────────────────────────────

function FiltrosUsuarios({
  roles,
  graduaciones,
  currentSearch,
  currentActivo,
  currentRoleId,
  currentGraduacionId,
}: {
  roles: { id: string; nombre: string }[];
  graduaciones: { id: string; nombre: string }[];
  currentSearch: string;
  currentActivo?: string;
  currentRoleId?: string;
  currentGraduacionId?: string;
}) {
  return (
    <form method="GET" className="flex flex-wrap gap-3">
      <input
        name="search"
        type="text"
        defaultValue={currentSearch}
        placeholder="Buscar por nombre, usuario o email..."
        className="h-10 px-3 rounded-md border border-input bg-background text-sm flex-1 min-w-[200px]
                   focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <select
        name="activo"
        defaultValue={currentActivo ?? ""}
        className="h-10 px-3 rounded-md border border-input bg-background text-sm
                   focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Todos los estados</option>
        <option value="true">Activos</option>
        <option value="false">Inactivos</option>
      </select>
      <select
        name="roleId"
        defaultValue={currentRoleId ?? ""}
        className="h-10 px-3 rounded-md border border-input bg-background text-sm
                   focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Todos los roles</option>
        {roles.map((r) => (
          <option key={r.id} value={r.id}>{r.nombre}</option>
        ))}
      </select>
      <select
        name="graduacionId"
        defaultValue={currentGraduacionId ?? ""}
        className="h-10 px-3 rounded-md border border-input bg-background text-sm
                   focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Todas las graduaciones</option>
        {graduaciones.map((g) => (
          <option key={g.id} value={g.id}>{g.nombre}</option>
        ))}
      </select>
      <button
        type="submit"
        className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
      >
        Filtrar
      </button>
      <a
        href="/admin/usuarios"
        className="h-10 px-4 rounded-md border border-input bg-background text-sm font-medium flex items-center hover:bg-accent"
      >
        Limpiar
      </a>
    </form>
  );
}

// ── Paginación ─────────────────────────────────────────────────────────────

function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-1">
      {pages.map((p) => (
        <a
          key={p}
          href={`?page=${p}`}
          className={`h-9 w-9 flex items-center justify-center rounded-md text-sm transition-colors ${
            p === currentPage
              ? "bg-primary text-primary-foreground"
              : "border hover:bg-accent"
          }`}
        >
          {p}
        </a>
      ))}
    </div>
  );
}
