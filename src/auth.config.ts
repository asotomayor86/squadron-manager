import type { NextAuthConfig } from "next-auth";

/**
 * Configuración Edge-compatible de Auth.js.
 * NO puede importar bcryptjs, Prisma ni nada de Node.js.
 * Solo se usa en el middleware.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith("/login");
      const isApiAuth = nextUrl.pathname.startsWith("/api/auth");

      // Las rutas de Auth.js siempre pasan
      if (isApiAuth) return true;

      // Si está en login y ya autenticado → redirigir al dashboard
      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      // Si no está autenticado → redirigir al login con callbackUrl
      if (!isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return Response.redirect(loginUrl);
      }

      return true;
    },
  },
  providers: [], // Los providers reales van en auth.ts (Node.js)
};
