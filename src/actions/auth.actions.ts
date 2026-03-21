"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(
  _prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Usuario o contraseña incorrectos" };
        default:
          return { error: "Error de autenticación. Inténtalo de nuevo." };
      }
    }
    // El redirect de Next.js lanza un error que hay que relanzar
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
