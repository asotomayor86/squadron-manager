import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthPage = nextUrl.pathname.startsWith("/login");
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isPublicAsset =
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname.startsWith("/favicon");

  // Activos estáticos y rutas API siempre pasan
  if (isPublicAsset || isApiRoute) return NextResponse.next();

  // Si ya está autenticado e intenta ir al login → redirigir al dashboard
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Si no está autenticado y va a una ruta protegida → al login
  if (!isAuthPage && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
