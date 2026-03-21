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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createUsuarioAction, updateUsuarioAction } from "@/actions/usuarios.actions";

interface Role { id: string; nombre: string }
interface Graduacion { id: string; nombre: string; nivel: number }

interface UsuarioFormProps {
  roles: Role[];
  graduaciones: Graduacion[];
  defaultValues?: {
    id?: string;
    nombre?: string;
    apellidos?: string;
    username?: string;
    email?: string;
    activo?: boolean;
    graduacionId?: string | null;
    roleIds?: string[];
    observaciones?: string | null;
  };
  mode: "create" | "edit";
}

export function UsuarioForm({ roles, graduaciones, defaultValues, mode }: UsuarioFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [activo, setActivo] = useState(defaultValues?.activo ?? true);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(defaultValues?.roleIds ?? []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set("activo", String(activo));

    // Eliminar roleIds del formData y re-añadirlos desde el estado
    formData.delete("roleIds");
    selectedRoles.forEach((id) => formData.append("roleIds", id));

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createUsuarioAction(formData)
          : await updateUsuarioAction(defaultValues!.id!, formData);

      if (result?.error) {
        setError(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      }
    });
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Datos personales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input id="nombre" name="nombre" defaultValue={defaultValues?.nombre} required />
          {fieldErrors.nombre && <p className="text-xs text-destructive">{fieldErrors.nombre[0]}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="apellidos">Apellidos *</Label>
          <Input id="apellidos" name="apellidos" defaultValue={defaultValues?.apellidos} required />
          {fieldErrors.apellidos && <p className="text-xs text-destructive">{fieldErrors.apellidos[0]}</p>}
        </div>
      </div>

      {/* Credenciales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="username">Nombre de usuario *</Label>
          <Input id="username" name="username" defaultValue={defaultValues?.username} required />
          {fieldErrors.username && <p className="text-xs text-destructive">{fieldErrors.username[0]}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" defaultValue={defaultValues?.email} required />
          {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email[0]}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">
          {mode === "create" ? "Contraseña *" : "Nueva contraseña (dejar vacío para no cambiar)"}
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required={mode === "create"}
          placeholder={mode === "edit" ? "••••••••" : ""}
        />
        {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password[0]}</p>}
        <p className="text-xs text-muted-foreground">Mínimo 8 caracteres, una mayúscula y un número</p>
      </div>

      {/* Graduación y estado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Graduación / Estado</Label>
          <Select name="graduacionId" defaultValue={defaultValues?.graduacionId ?? "none"}>
            <SelectTrigger>
              <SelectValue placeholder="Sin graduación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin graduación</SelectItem>
              {graduaciones.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Estado de la cuenta</Label>
          <div className="flex items-center gap-3 h-10">
            <Switch
              checked={activo}
              onCheckedChange={setActivo}
              id="activo-switch"
            />
            <Label htmlFor="activo-switch" className="font-normal cursor-pointer">
              {activo ? "Cuenta activa" : "Cuenta inactiva"}
            </Label>
          </div>
        </div>
      </div>

      {/* Roles (multi-selección) */}
      <div className="space-y-2">
        <Label>Roles asignados *</Label>
        <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[44px]">
          {roles.map((rol) => {
            const selected = selectedRoles.includes(rol.id);
            return (
              <button
                key={rol.id}
                type="button"
                onClick={() => toggleRole(rol.id)}
                className="focus:outline-none"
              >
                <Badge
                  variant={selected ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80 transition-opacity select-none"
                >
                  {rol.nombre}
                </Badge>
              </button>
            );
          })}
        </div>
        {fieldErrors.roleIds && (
          <p className="text-xs text-destructive">{fieldErrors.roleIds[0]}</p>
        )}
        {selectedRoles.length === 0 && (
          <p className="text-xs text-muted-foreground">Selecciona al menos un rol</p>
        )}
      </div>

      {/* Observaciones */}
      <div className="space-y-1.5">
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea
          id="observaciones"
          name="observaciones"
          defaultValue={defaultValues?.observaciones ?? ""}
          placeholder="Notas adicionales sobre el usuario..."
          rows={3}
        />
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          {mode === "create" ? "Crear usuario" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
