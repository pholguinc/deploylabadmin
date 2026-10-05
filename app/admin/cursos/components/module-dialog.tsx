import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createModule } from "../services/courses.service";

interface ModuleDialogProps {
  readonly courseId: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function ModuleDialog({
  courseId,
  open,
  onOpenChange,
  onSuccess,
}: ModuleDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
  });

  const handleChange = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title) {
      setError("El título es obligatorio");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await createModule(courseId, {
        title: formData.title,
      });
      onSuccess();
      onOpenChange(false);
      setFormData({ title: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar el módulo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Módulo</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del módulo *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ej. Introducción"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="bg-sidebar hover:bg-sidebar-accent text-white">
            {isLoading ? "Guardando..." : "Guardar Módulo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
