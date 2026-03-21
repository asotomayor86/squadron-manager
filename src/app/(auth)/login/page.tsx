"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth.actions";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

const initialState: { error?: string } = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="bg-primary/10 p-3 rounded-full">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Squadron Manager</h1>
        <p className="text-sm text-muted-foreground">
          Accede con tus credenciales de escuadrón
        </p>
      </div>

      {/* Error alert */}
      {state?.error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg">
          {state.error}
        </div>
      )}

      {/* Form */}
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="username" className="text-sm font-medium text-foreground">
            Usuario
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            placeholder="tu.usuario"
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm
                       focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                       disabled:opacity-50"
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm
                         focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                         disabled:opacity-50"
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium
                     hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Accediendo..." : "Iniciar sesión"}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Sistema de uso interno. Acceso restringido.
      </p>
    </div>
  );
}
