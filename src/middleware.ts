import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Usamos SOLO la config Edge-safe (sin bcryptjs ni Prisma)
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
