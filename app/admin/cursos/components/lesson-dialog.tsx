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

import { createLesson, updateLesson } from "../services/lessons.service";
import type { Lesson } from "../interfaces/course.interface";

interface LessonDialogProps {
  moduleId?: string | null;
  lesson?: Lesson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function LessonDialog({
  moduleId,
  lesson,
  open,
  onOpenChange,
  onSuccess,
}: LessonDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    duration: "",
    type: "VIDEO",
  });

  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      if (lesson) {
        setFormData({
          title: lesson.title || "",
          duration: lesson.duration || "",
          type: lesson.type || "VIDEO",
        });
      } else {
        setFormData({ title: "", duration: "", type: "VIDEO" });
      }
      setError(null);
    }
  }



  const handleChange = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!lesson && !moduleId) return;
    if (!formData.title) {
      setError("El título es obligatorio");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (lesson) {
        await updateLesson(lesson.id, {
          title: formData.title,
          type: formData.type,
          duration: formData.duration || undefined,
        });
      } else if (moduleId) {
        await createLesson({
          title: formData.title,
          moduleId,
          type: formData.type,
          duration: formData.duration || undefined,
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar la lección");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{lesson ? "Editar Lección" : "Agregar Nueva Lección"}</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="space-y-2">
            <Label htmlFor="title">Título de la lección *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ej. ¿Qué es Docker?"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Contenido</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="VIDEO">Video</option>
              <option value="PDF">Documento (PDF)</option>
              <option value="QUIZ">Quiz / Evaluación</option>
              <option value="TEXT">Texto</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duración</Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) => handleChange("duration", e.target.value)}
              placeholder="Ej. 10:30 min"
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
          <Button onClick={handleSave} disabled={isLoading} className="bg-violet-600 hover:bg-violet-700 text-white">
            {isLoading ? "Guardando..." : "Guardar Lección"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
