"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { createRolAction, updateRolAction } from "@/actions/roles.actions";

interface Permission {
  id: string;
  nombre: string;
  modulo: string;
  accion: string;
  descripcion?: string | null;
}

interface RolFormProps {
  permissions: Permission[];
  defaultValues?: {
    id?: string;
    nombre?: string;
    descripcion?: string | null;
    activo?: boolean;
    permissionIds?: string[];
  };
  mode: "create" | "edit";
}

// Agrupamos los permisos por módulo para mostrarlos organizados
function groupByModule(permissions: Permission[]) {
  return permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.modulo]) acc[p.modulo] = [];
    acc[p.modulo].push(p);
    return acc;
  }, {});
}

export function RolForm({ permissions, defaultValues, mode }: RolFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [activo, setActivo] = useState(defaultValues?.activo ?? true);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    defaultValues?.permissionIds ?? []
  );

  const grouped = groupByModule(permissions);

  const togglePermission = (id: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleModule = (modulePerms: Permission[]) => {
    const allSelected = modulePerms.every((p) => selectedPermissions.includes(p.id));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((id) => !modulePerms.some((p) => p.id === id)));
    } else {
      setSelectedPermissions((prev) => [
        ...prev,
        ...modulePerms.filter((p) => !prev.includes(p.id)).map((p) => p.id),
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("activo", String(activo));
    formData.delete("permissionIds");
    selectedPermissions.forEach((id) => formData.append("permissionIds", id));

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createRolAction(formData)
          : await updateRolAction(defaultValues!.id!, formData);

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
          <Label htmlFor="nombre">Nombre del rol *</Label>
          <Input
            id="nombre"
            name="nombre"
            defaultValue={defaultValues?.nombre}
            placeholder="GESTOR_OPERACIONES"
            required
          />
          <p className="text-xs text-muted-foreground">Se guardará en mayúsculas</p>
        </div>

        <div className="space-y-1.5">
          <Label>Estado</Label>
          <div className="flex items-center gap-3 h-10">
            <Switch checked={activo} onCheckedChange={setActivo} id="activo-rol" />
            <Label htmlFor="activo-rol" className="font-normal cursor-pointer">
              {activo ? "Rol activo" : "Rol inactivo"}
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          defaultValue={defaultValues?.descripcion ?? ""}
          placeholder="Describe las responsabilidades de este rol..."
          rows={2}
        />
      </div>

      {/* Permisos por módulo */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Permisos asignados</Label>
          <span className="text-xs text-muted-foreground">
            {selectedPermissions.length} de {permissions.length} seleccionados
          </span>
        </div>

        <div className="space-y-4 border rounded-lg p-4">
          {Object.entries(grouped).map(([modulo, perms]) => {
            const allSelected = perms.every((p) => selectedPermissions.includes(p.id));
            const someSelected = perms.some((p) => selectedPermissions.includes(p.id));

            return (
              <div key={modulo}>
                <div className="flex items-center gap-3 mb-2">
                  <button
                    type="button"
                    onClick={() => toggleModule(perms)}
                    className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded transition-colors ${
                      allSelected
                        ? "bg-primary text-primary-foreground"
                        : someSelected
                        ? "bg-primary/30 text-primary"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {modulo}
                  </button>
                  <span className="text-xs text-muted-foreground">
                    (clic para seleccionar todos)
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 ml-2">
                  {perms.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePermission(p.id)}
                      title={p.descripcion ?? p.nombre}
                      className="focus:outline-none"
                    >
                      <Badge
                        variant={selectedPermissions.includes(p.id) ? "default" : "outline"}
                        className="cursor-pointer hover:opacity-80 transition-opacity text-xs"
                      >
                        {p.accion}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          {mode === "create" ? "Crear rol" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
