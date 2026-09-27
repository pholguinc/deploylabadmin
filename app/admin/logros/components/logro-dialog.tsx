"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircleIcon, TrophyIcon, PaletteIcon } from "lucide-react";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import {
  createAchievement,
  updateAchievement,
} from "../services/achievements.service";
import type {
  Achievement,
  AchievementFormData,
} from "../interfaces/achievement.interface";

interface LogroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logro?: Achievement | null;
  onSuccess: () => void;
}

// Nombres de íconos Lucide — los mismos que guarda el seeder del backend
const ICON_PRESETS = [
  "Container",
  "Cloud",
  "Boxes",
  "GitMerge",
  "Rocket",
  "ShieldCheck",
  "Network",
  "GitBranch",
  "Workflow",
  "Trophy",
  "Star",
  "Zap",
  "Flame",
  "Server",
  "Globe",
  "Lock",
  "Key",
  "Medal",
];

// Paleta de colores predefinidos — coinciden con los del seeder
const COLOR_PRESETS = [
  { hex: "#0db7ed", label: "Docker Azul" },
  { hex: "#38bdf8", label: "Sky" },
  { hex: "#a855f7", label: "Violeta" },
  { hex: "#10B981", label: "Esmeralda" },
  { hex: "#f97316", label: "Naranja" },
  { hex: "#22c55e", label: "Verde" },
  { hex: "#6366f1", label: "Indigo" },
  { hex: "#ec4899", label: "Rosa" },
  { hex: "#f59e0b", label: "Ámbar" },
  { hex: "#eab308", label: "Amarillo" },
  { hex: "#ef4444", label: "Rojo" },
  { hex: "#64748b", label: "Gris" },
];

const DEFAULT_COLOR = "#6366f1";

export function LogroDialog({
  open,
  onOpenChange,
  logro,
  onSuccess,
}: Readonly<LogroDialogProps>) {
  const isEdit = !!logro;

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevLogro, setPrevLogro] = useState(logro);

  const [form, setForm] = useState<AchievementFormData>({
    name: logro?.name ?? "",
    icon: logro?.icon ?? "Rocket",
    color: logro?.color ?? DEFAULT_COLOR,
    estado: logro?.estado ?? true,
    orden: logro?.orden ?? 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof AchievementFormData, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // Sync state during render to avoid useEffect cascading renders
  if (open !== prevOpen || logro !== prevLogro) {
    setPrevOpen(open);
    setPrevLogro(logro);
    if (open) {
      if (logro) {
        setForm({
          name: logro.name,
          icon: logro.icon ?? "Rocket",
          color: logro.color ?? DEFAULT_COLOR,
          estado: logro.estado,
          orden: logro.orden,
        });
      } else {
        setForm({ name: "", icon: "Rocket", color: DEFAULT_COLOR, estado: true, orden: 1 });
      }
      setErrors({});
      setApiError(null);
    }
  }

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "El nombre es requerido";
    if (!form.orden || form.orden < 1) e.orden = "El orden debe ser mayor a 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = <K extends keyof AchievementFormData>(
    key: K,
    value: AchievementFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setApiError(null);
    try {
      if (isEdit && logro) {
        await updateAchievement(logro.id, form);
      } else {
        await createAchievement(form);
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const currentColor = form.color ?? DEFAULT_COLOR;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {/* Preview del ícono con el color seleccionado */}
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200"
              style={{ backgroundColor: currentColor }}
            >
              <DynamicIcon
                name={form.icon ?? "Trophy"}
                className="h-4 w-4 text-white"
                fallback={<TrophyIcon className="h-4 w-4 text-white" />}
              />
            </div>
            {isEdit ? "Editar logro" : "Nuevo logro"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Modifica los datos del logro "${logro?.name}".`
              : "Configura el nuevo logro."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* API Error */}
          {apiError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {apiError}
            </div>
          )}

          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="logro-name">Nombre</Label>
            <Input
              id="logro-name"
              placeholder="Ej. Primer Deploy"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Ícono + Color en dos columnas */}
          <div className="grid grid-cols-2 gap-4">
            {/* Ícono */}
            <div className="space-y-2">
              <Label>Ícono</Label>
              <div className="grid grid-cols-6 gap-1">
                {ICON_PRESETS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    title={icon}
                    onClick={() => set("icon", icon)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-150 hover:border-primary/50 hover:bg-accent ${
                      form.icon === icon
                        ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                        : "border-border"
                    }`}
                  >
                    <DynamicIcon
                      name={icon}
                      className="h-3.5 w-3.5 text-foreground"
                      fallback={<span className="text-xs">{icon[0]}</span>}
                    />
                  </button>
                ))}
              </div>
              {/* Input manual */}
              <Input
                placeholder="Nombre Lucide (ej. Rocket)"
                value={form.icon}
                onChange={(e) => set("icon", e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <PaletteIcon className="h-3.5 w-3.5" />
                Color
              </Label>
              <div className="grid grid-cols-6 gap-1">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.label}
                    onClick={() => set("color", c.hex)}
                    className={`h-8 w-8 rounded-lg border-2 transition-all duration-150 hover:scale-110 ${
                      currentColor === c.hex
                        ? "border-foreground scale-110 ring-2 ring-foreground/20"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
              {/* Color picker nativo */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => set("color", e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent p-0.5"
                  title="Color personalizado"
                />
                <Input
                  value={currentColor}
                  onChange={(e) => set("color", e.target.value)}
                  placeholder="#6366f1"
                  className="flex-1 font-mono text-xs"
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md"
              style={{ backgroundColor: currentColor }}
            >
              <DynamicIcon
                name={form.icon ?? "Trophy"}
                className="h-5 w-5 text-white"
                fallback={<TrophyIcon className="h-5 w-5 text-white" />}
              />
            </div>
            <div>
              <p className="font-semibold leading-none">
                {form.name || "Nombre del logro"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {form.icon} · {currentColor}
              </p>
            </div>
          </div>

          {/* Orden + Estado en fila */}
          <div className="grid grid-cols-2 gap-4">
            {/* Orden */}
            <div className="space-y-1.5">
              <Label htmlFor="logro-orden">Orden</Label>
              <Input
                id="logro-orden"
                type="number"
                min={1}
                value={form.orden}
                onChange={(e) => set("orden", Number(e.target.value))}
                className={errors.orden ? "border-destructive" : ""}
              />
              {errors.orden && (
                <p className="text-xs text-destructive">{errors.orden}</p>
              )}
            </div>

            {/* Estado */}
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <div className="flex gap-2">
                {[
                  { value: true, label: "Activo", cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 ring-emerald-500/20" },
                  { value: false, label: "Inactivo", cls: "border-zinc-400/30 bg-zinc-400/10 text-zinc-600 ring-zinc-400/20" },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => set("estado", opt.value)}
                    className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-all duration-150 ${
                      form.estado === opt.value
                        ? `${opt.cls} ring-1`
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500"
            >
              {isLoading && <LoaderCircleIcon className="h-4 w-4 animate-spin" />}
              {isEdit ? "Guardar cambios" : "Crear logro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
