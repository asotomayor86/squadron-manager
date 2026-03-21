"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createGraduacionAction, updateGraduacionAction } from "@/actions/graduaciones.actions";

interface GraduacionFormProps {
  defaultValues?: {
    id?: string;
    nombre?: string;
    descripcion?: string | null;
    nivel?: number;
    activo?: boolean;
  };
  mode: "create" | "edit";
}

export function GraduacionForm({ defaultValues, mode }: GraduacionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [activo, setActivo] = useState(defaultValues?.activo ?? true);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("activo", String(activo));

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createGraduacionAction(formData)
          : await updateGraduacionAction(defaultValues!.id!, formData);

      if (result?.error) setError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="nombre">Nombre de la graduación *</Label>
          <Input
            id="nombre"
            name="nombre"
            defaultValue={defaultValues?.nombre}
            placeholder="Ej: Sargento, Teniente..."
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nivel">
            Nivel de ordenación
            <span className="ml-1 text-xs text-muted-foreground font-normal">(1 = más bajo)</span>
          </Label>
          <Input
            id="nivel"
            name="nivel"
            type="number"
            min="0"
            max="999"
            defaultValue={defaultValues?.nivel ?? 0}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          defaultValue={defaultValues?.descripcion ?? ""}
          placeholder="Describe esta graduación o estado..."
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Estado</Label>
        <div className="flex items-center gap-3 h-10">
          <Switch checked={activo} onCheckedChange={setActivo} id="activo-grad" />
          <Label htmlFor="activo-grad" className="font-normal cursor-pointer">
            {activo ? "Graduación activa" : "Graduación inactiva"}
          </Label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          {mode === "create" ? "Crear graduación" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
