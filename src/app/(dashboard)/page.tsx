import { requireAuth } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShieldCheck, GraduationCap, UserCheck } from "lucide-react";

export default async function DashboardPage() {
  const session = await requireAuth();

  // Estadísticas en paralelo
  const [totalUsuarios, usuariosActivos, totalRoles, totalGraduaciones] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { activo: true } }),
      prisma.role.count({ where: { activo: true } }),
      prisma.graduacion.count({ where: { activo: true } }),
    ]);

  const stats = [
    {
      title: "Total usuarios",
      value: totalUsuarios,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Usuarios activos",
      value: usuariosActivos,
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Roles configurados",
      value: totalRoles,
      icon: ShieldCheck,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Graduaciones",
      value: totalGraduaciones,
      icon: GraduationCap,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Últimos usuarios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Altas recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentUsers />
        </CardContent>
      </Card>
    </div>
  );
}

async function RecentUsers() {
  const usuarios = await prisma.user.findMany({
    take: 5,
    orderBy: { fechaAlta: "desc" },
    include: {
      graduacion: { select: { nombre: true } },
      userRoles: { include: { role: { select: { nombre: true } } } },
    },
  });

  if (usuarios.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay usuarios registrados.</p>;
  }

  return (
    <div className="space-y-3">
      {usuarios.map((u) => (
        <div key={u.id} className="flex items-center justify-between py-2 border-b last:border-0">
          <div>
            <p className="text-sm font-medium">
              {u.nombre} {u.apellidos}
            </p>
            <p className="text-xs text-muted-foreground">@{u.username}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {u.graduacion?.nombre ?? "Sin graduación"}
            </p>
            <p className="text-xs text-muted-foreground">
              {u.userRoles.map((ur) => ur.role.nombre).join(", ")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
