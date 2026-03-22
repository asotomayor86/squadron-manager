import { config } from "dotenv";
config();

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // ── 1. PERMISOS ────────────────────────────────────────────────────────────
  const permisosData = [
    // Usuarios
    { nombre: "users:read",          descripcion: "Ver listado y detalle de usuarios",  modulo: "users",        accion: "read"   },
    { nombre: "users:create",        descripcion: "Crear nuevos usuarios",               modulo: "users",        accion: "create" },
    { nombre: "users:update",        descripcion: "Editar usuarios existentes",          modulo: "users",        accion: "update" },
    { nombre: "users:delete",        descripcion: "Eliminar usuarios",                   modulo: "users",        accion: "delete" },
    // Roles
    { nombre: "roles:read",          descripcion: "Ver listado y detalle de roles",      modulo: "roles",        accion: "read"   },
    { nombre: "roles:create",        descripcion: "Crear nuevos roles",                  modulo: "roles",        accion: "create" },
    { nombre: "roles:update",        descripcion: "Editar roles existentes",             modulo: "roles",        accion: "update" },
    { nombre: "roles:delete",        descripcion: "Eliminar roles",                      modulo: "roles",        accion: "delete" },
    // Graduaciones
    { nombre: "graduaciones:read",   descripcion: "Ver graduaciones/estados",            modulo: "graduaciones", accion: "read"   },
    { nombre: "graduaciones:create", descripcion: "Crear nuevas graduaciones",           modulo: "graduaciones", accion: "create" },
    { nombre: "graduaciones:update", descripcion: "Editar graduaciones existentes",      modulo: "graduaciones", accion: "update" },
    { nombre: "graduaciones:delete", descripcion: "Eliminar graduaciones",               modulo: "graduaciones", accion: "delete" },
    // Admin y auditoría
    { nombre: "admin:access",        descripcion: "Acceso al panel de administración",   modulo: "admin",        accion: "access" },
    { nombre: "audit:read",          descripcion: "Ver registros de auditoría",          modulo: "audit",        accion: "read"   },
  ];

  const permisos: Record<string, { id: string }> = {};
  for (const p of permisosData) {
    const permiso = await prisma.permission.upsert({
      where: { nombre: p.nombre },
      update: { descripcion: p.descripcion },
      create: p,
    });
    permisos[p.nombre] = permiso;
    console.log(`  ✓ Permiso: ${p.nombre}`);
  }

  // ── 2. ROLES ───────────────────────────────────────────────────────────────
  const todoLosPermisos = Object.values(permisos).map((p) => ({
    permissionId: p.id,
  }));

  const rolAdmin = await prisma.role.upsert({
    where: { nombre: "ADMINISTRADOR" },
    update: {},
    create: {
      nombre: "ADMINISTRADOR",
      descripcion: "Acceso total al sistema",
      rolePermissions: { create: todoLosPermisos },
    },
  });
  console.log(`  ✓ Rol: ADMINISTRADOR`);

  const rolGestor = await prisma.role.upsert({
    where: { nombre: "GESTOR" },
    update: {},
    create: {
      nombre: "GESTOR",
      descripcion: "Gestión de usuarios y consulta de roles/graduaciones",
      rolePermissions: {
        create: [
          "admin:access",
          "users:read", "users:create", "users:update",
          "roles:read",
          "graduaciones:read",
        ].map((nombre) => ({ permissionId: permisos[nombre].id })),
      },
    },
  });
  console.log(`  ✓ Rol: GESTOR`);

  await prisma.role.upsert({
    where: { nombre: "OPERADOR" },
    update: {},
    create: {
      nombre: "OPERADOR",
      descripcion: "Solo lectura del sistema",
      rolePermissions: {
        create: ["users:read", "roles:read", "graduaciones:read"].map(
          (nombre) => ({ permissionId: permisos[nombre].id })
        ),
      },
    },
  });
  console.log(`  ✓ Rol: OPERADOR`);

  // ── 3. GRADUACIONES ────────────────────────────────────────────────────────
  const graduacionesData = [
    { nombre: "Recluta",    descripcion: "Personal en período de instrucción",  nivel: 1 },
    { nombre: "Soldado",    descripcion: "Personal de tropa básico",            nivel: 2 },
    { nombre: "Cabo",       descripcion: "Mando de equipo básico",              nivel: 3 },
    { nombre: "Sargento",   descripcion: "Suboficial de primera línea",         nivel: 4 },
    { nombre: "Teniente",   descripcion: "Oficial subalterno",                  nivel: 5 },
    { nombre: "Capitán",    descripcion: "Mando de compañía",                   nivel: 6 },
    { nombre: "Mayor",      descripcion: "Oficial superior",                    nivel: 7 },
    { nombre: "Comandante", descripcion: "Mando de batallón",                   nivel: 8 },
  ];

  for (const g of graduacionesData) {
    await prisma.graduacion.upsert({
      where: { nombre: g.nombre },
      update: {},
      create: g,
    });
    console.log(`  ✓ Graduación: ${g.nombre}`);
  }

  // ── 4. USUARIO ADMINISTRADOR ───────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin1234!", 12);

  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      nombre: "Admin",
      apellidos: "Sistema",
      username: "admin",
      email: "admin@squadron.local",
      password: adminPassword,
      activo: true,
      observaciones: "Usuario administrador creado en el seed inicial",
    },
  });

  // Asignar rol ADMINISTRADOR
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: rolAdmin.id } },
    update: {},
    create: { userId: adminUser.id, roleId: rolAdmin.id },
  });
  console.log(`  ✓ Usuario admin creado (username: admin / password: Admin1234!)`);

  // Usuario de prueba — Gestor
  const gestorPassword = await bcrypt.hash("Gestor1234!", 12);
  const gestorUser = await prisma.user.upsert({
    where: { username: "gestor01" },
    update: {},
    create: {
      nombre: "Juan",
      apellidos: "García López",
      username: "gestor01",
      email: "gestor@squadron.local",
      password: gestorPassword,
      activo: true,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: gestorUser.id, roleId: rolGestor.id } },
    update: {},
    create: { userId: gestorUser.id, roleId: rolGestor.id },
  });
  console.log(`  ✓ Usuario gestor01 creado (password: Gestor1234!)`);

  console.log("\n✅ Seed completado correctamente.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
