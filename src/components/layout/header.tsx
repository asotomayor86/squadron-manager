"use client";

import { LogOut, User, ChevronDown } from "lucide-react";
import { logoutAction } from "@/actions/auth.actions";
import { getInitials } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  userName: string;
  userEmail: string;
  userRoles: string[];
}

export function Header({ userName, userEmail, userRoles }: HeaderProps) {
  const [nombre = "", apellidos = ""] = userName.split(" ");
  const initials = getInitials(nombre, apellidos || nombre);

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6">
      <div />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-3 h-auto py-2">
            {/* Avatar */}
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{initials}</span>
            </div>

            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium leading-none">{userName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {userRoles.join(", ")}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
            <User className="mr-2 h-4 w-4" />
            {userRoles.join(", ")}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
