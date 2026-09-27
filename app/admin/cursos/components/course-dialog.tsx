import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { UploadCloudIcon, XIcon, PlusIcon } from "lucide-react";
import {
  createCourse,
  uploadCourseImage,
  updateCourse,
} from "../services/courses.service";
import type { Course } from "../interfaces/course.interface";

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  course?: Course | null;
}

export function CourseDialog({
  open,
  onOpenChange,
  onSuccess,
  course,
}: CourseDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: string;
    level: string;
    duration: string;
    instructor: string;
    features: string[];
    isActive: boolean;
  }>({
    title: "",
    description: "",
    category: "",
    level: "",
    duration: "",
    instructor: "",
    features: [""],
    isActive: true,
  });

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    if (newFeatures.length === 0) newFeatures.push("");
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const handleChange = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevCourse, setPrevCourse] = useState(course);

  if (open !== prevOpen || course !== prevCourse) {
    setPrevOpen(open);
    setPrevCourse(course);
    if (open) {
      if (course) {
        setFormData({
          title: course.title || "",
          description: course.description || "",
          category: course.category || "",
          level: course.level || "",
          duration: course.duration || "",
          instructor: course.instructor || "",
          features: course.features && course.features.length > 0 ? course.features : [""],
          isActive: course.isActive ?? true,
        });
        setImagePreview(course.imageUrl || null);
        setImageFile(null);
      } else {
        setFormData({
          title: "",
          description: "",
          category: "",
          level: "",
          duration: "",
          instructor: "",
          features: [""],
          isActive: true,
        });
        setImagePreview(null);
        setImageFile(null);
      }
      setError(null);
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      setError("El título es obligatorio");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        features: formData.features
          .map((f) => f.trim())
          .filter((f) => f !== ""),
      };

      let savedCourse;
      if (course) {
        savedCourse = await updateCourse(course.id, payload);
      } else {
        savedCourse = await createCourse(payload);
      }

      if (imageFile) {
        await uploadCourseImage(savedCourse.id, imageFile);
      }

      onSuccess();
      onOpenChange(false);

      setFormData({
        title: "",
        description: "",
        category: "",
        level: "",
        duration: "",
        instructor: "",
        instructor: "",
        features: [""],
        isActive: true,
      });
      removeImage();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {course ? "Editar Curso" : "Registrar Nuevo Curso"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="space-y-2">
            <Label htmlFor="title">Título del curso *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ej. Docker de cero a experto"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Breve descripción del curso"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                placeholder="Ej. DevOps"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Nivel</Label>
              <Input
                id="level"
                value={formData.level}
                onChange={(e) => handleChange("level", e.target.value)}
                placeholder="Ej. Principiante"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duración</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                placeholder="Ej. 14h 30m"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                value={formData.instructor}
                onChange={(e) => handleChange("instructor", e.target.value)}
                placeholder="Nombre del instructor"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Características principales</Label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  placeholder="Ej. Certificado al finalizar"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeFeature(index)}
                  disabled={formData.features.length === 1 && !feature}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 w-full text-xs border-dashed"
              onClick={addFeature}
            >
              <PlusIcon className="mr-1 h-3 w-3" /> Agregar característica
            </Button>
          </div>

          {/* Drag and Drop Zone */}
          <div className="space-y-2">
            <Label>Imagen del Curso</Label>
            <div
              className={`relative flex min-h-[140px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition-colors ${
                isDragging
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-border hover:border-violet-500/50 hover:bg-muted/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />

              {imagePreview ? (
                <div className="relative w-full overflow-hidden rounded-lg">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      className="gap-2"
                    >
                      <XIcon className="h-4 w-4" />
                      Remover imagen
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex cursor-pointer flex-col items-center text-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="mb-2 rounded-full bg-violet-100 p-3 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                    <UploadCloudIcon className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Haz clic o arrastra tu imagen aquí
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG o WEBP (máx. 5MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                handleChange("isActive", checked === true)
              }
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Curso Activo (visible para usuarios)
            </Label>
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
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {isLoading ? "Guardando..." : "Guardar Curso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
