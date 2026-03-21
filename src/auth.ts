import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/hash";
import { loginSchema } from "@/lib/validations/usuario.schema";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { username, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { username },
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: { permission: true },
                    },
                  },
                },
              },
            },
          },
        });

        if (!user || !user.activo) return null;

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) return null;

        const roles = user.userRoles.map((ur) => ur.role.nombre);
        const permissions = [
          ...new Set(
            user.userRoles
              .flatMap((ur) => ur.role.rolePermissions)
              .map((rp) => rp.permission.nombre)
          ),
        ];

        return {
          id: user.id,
          name: `${user.nombre} ${user.apellidos}`,
          email: user.email,
          roles,
          permissions,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.permissions = user.permissions;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.roles = (token.roles as string[]) ?? [];
      session.user.permissions = (token.permissions as string[]) ?? [];
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
});
