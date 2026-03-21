import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/hash";
import { loginSchema } from "@/lib/validations/usuario.schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
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

        // Cargamos usuario con roles y permisos en una sola query
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
            graduacion: true,
          },
        });

        if (!user || !user.activo) return null;

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) return null;

        // Extraemos nombres de roles y permisos únicos
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
    // Inyectamos roles y permisos en el JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.permissions = user.permissions;
      }
      return token;
    },

    // Exponemos roles y permisos en la sesión del cliente
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.roles = (token.roles as string[]) ?? [];
      session.user.permissions = (token.permissions as string[]) ?? [];
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 horas
  },
});
