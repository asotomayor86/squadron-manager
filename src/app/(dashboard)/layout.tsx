import { requireAuth } from "@/lib/permissions";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const name = session.user.name ?? "";
  const email = session.user.email ?? "";
  const roles = session.user.roles ?? [];
  const permissions = session.user.permissions ?? [];

  return (
    <div className="flex min-h-screen">
      <Sidebar userPermissions={permissions} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header userName={name} userEmail={email} userRoles={roles} />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
