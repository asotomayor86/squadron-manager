import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <ShieldX className="h-16 w-16 text-destructive mx-auto" />
        <h1 className="text-3xl font-bold text-foreground">Acceso denegado</h1>
        <p className="text-muted-foreground">
          No tienes permisos para acceder a esta sección.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
