"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield, Users, ShieldCheck, GraduationCap,
  LayoutDashboard, ScrollText, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PERMISSIONS } from "@/lib/permissions";

function clientHasPermission(userPermissions: string[], required: string) {
  return userPermissions.includes(required);
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Usuarios",
    href: "/admin/usuarios",
    icon: Users,
    permission: PERMISSIONS.USERS_READ,
  },
  {
    label: "Roles",
    href: "/admin/roles",
    icon: ShieldCheck,
    permission: PERMISSIONS.ROLES_READ,
  },
  {
    label: "Graduaciones",
    href: "/admin/graduaciones",
    icon: GraduationCap,
    permission: PERMISSIONS.GRADUACIONES_READ,
  },
  {
    label: "Auditoría",
    href: "/admin/auditoria",
    icon: ScrollText,
    permission: PERMISSIONS.AUDIT_READ,
  },
];

interface SidebarProps {
  userPermissions: string[];
}

export function Sidebar({ userPermissions }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-900 text-slate-100">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="bg-primary/20 p-2 rounded-lg">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">Squadron</p>
          <p className="text-xs text-slate-400 leading-tight">Manager</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          // Ocultar items sin permiso
          if (item.permission && !clientHasPermission(userPermissions, item.permission)) {
            return null;
          }

          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                "hover:bg-slate-800 group",
                isActive
                  ? "bg-primary/20 text-primary"
                  : "text-slate-300 hover:text-slate-100"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "")} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="h-3 w-3 text-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">v1.0.0 — Uso interno</p>
      </div>
    </aside>
  );
}
