import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { getAuditLogs } from "@/lib/services/audit.service";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ScrollText } from "lucide-react";

export const metadata = { title: "Auditoría" };

const ACCION_VARIANTS: Record<string, "default" | "success" | "destructive" | "warning" | "secondary"> = {
  CREATE: "success",
  UPDATE: "default",
  DELETE: "destructive",
  TOGGLE: "warning",
  LOGIN: "secondary",
  LOGOUT: "secondary",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    entidad?: string;
  }>;
}

export default async function AuditoriaPage({ searchParams }: PageProps) {
  await requirePermission(PERMISSIONS.AUDIT_READ);
  const params = await searchParams;

  const page = parseInt(params.page ?? "1");
  const entidad = params.entidad;

  const { logs, total, pages } = await getAuditLogs({ page, entidad, limit: 25 });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ScrollText className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold">Registro de auditoría</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {total} evento{total !== 1 ? "s" : ""} registrado{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <form method="GET" className="flex gap-3">
        <select
          name="entidad"
          defaultValue={entidad ?? ""}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todas las entidades</option>
          <option value="User">Usuarios</option>
          <option value="Role">Roles</option>
          <option value="Graduacion">Graduaciones</option>
        </select>
        <button
          type="submit"
          className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
        >
          Filtrar
        </button>
        <a
          href="/admin/auditoria"
          className="h-10 px-4 rounded-md border border-input bg-background text-sm font-medium flex items-center hover:bg-accent"
        >
          Limpiar
        </a>
      </form>

      {/* Tabla */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fecha</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actor</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Acción</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Entidad</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(log.createdAt)}
                </td>
                <td className="px-4 py-3">
                  {log.actor ? (
                    <div>
                      <p className="font-medium">
                        {log.actor.nombre} {log.actor.apellidos}
                      </p>
                      <p className="text-xs text-muted-foreground">@{log.actor.username}</p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">Sistema</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={ACCION_VARIANTS[log.accion] ?? "secondary"}>
                    {log.accion}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <span className="font-medium">{log.entidad}</span>
                    {log.entidadId && (
                      <p className="text-xs text-muted-foreground font-mono">{log.entidadId.slice(0, 8)}…</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground font-mono">
                  {log.ip ?? "—"}
                </td>
              </tr>
            ))}

            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground">
                  No hay registros de auditoría.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?page=${p}${entidad ? `&entidad=${entidad}` : ""}`}
              className={`h-9 w-9 flex items-center justify-center rounded-md text-sm transition-colors ${
                p === page
                  ? "bg-primary text-primary-foreground"
                  : "border hover:bg-accent"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
