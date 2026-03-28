import { requireAuth } from "@/lib/permissions";

export const metadata = { title: "Bienvenida" };

export default async function BienvenidaPage() {
  const session = await requireAuth();
  const nombre = session.user.name?.split(" ")[0] ?? "";

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <p className="font-black text-8xl leading-none tracking-wide">MADDOG</p>
      <p className="font-black text-4xl leading-none tracking-widest text-muted-foreground mt-2">
        ESCUADRON
      </p>

      <img
        src="https://www.escuadronmaddog.com/assets/images/logo.svg"
        alt="Escuadron Maddog"
        className="my-10 w-1/2 max-w-xs"
      />

      <p className="text-2xl font-semibold">
        Bienvenido, {nombre}
      </p>
    </div>
  );
}
