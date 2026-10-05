import { useState, useRef } from "react";
import Image from "next/image";
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
  DialogDescription,
} from "@/components/ui/dialog";

import { UploadCloudIcon, XIcon, PlusIcon, SearchIcon, BookIcon } from "lucide-react";
import {
  createCourse,
  uploadCourseImage,
  updateCourse,
} from "../services/courses.service";
import type { Course, CreateCourseDto } from "../interfaces/course.interface";
import { InstructorModal } from "./instructor-modal";

interface CourseDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
  readonly course?: Course | null;
}

export function CourseDialog({
  open,
  onOpenChange,
  onSuccess,
  course,
}: CourseDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
  const [instructorName, setInstructorName] = useState("");

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
    features: { id: string; value: string }[];
    isActive: boolean;
  }>({
    title: "",
    description: "",
    category: "",
    level: "",
    duration: "",
    instructor: "",
    features: [{ id: crypto.randomUUID(), value: "" }],
    isActive: true,
  });

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = { ...newFeatures[index], value };
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, { id: crypto.randomUUID(), value: "" }] }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    if (newFeatures.length === 0) newFeatures.push({ id: crypto.randomUUID(), value: "" });
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const handleChange = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevCourse, setPrevCourse] = useState(course);

  const resetForm = (courseData?: Course | null) => {
    if (courseData) {
      setFormData({
        title: courseData.title || "",
        description: courseData.description || "",
        category: courseData.category || "",
        level: courseData.level || "",
        duration: courseData.duration || "",
        instructor: courseData.instructor?.id || "",
        features: courseData.features?.length ? courseData.features.map(f => ({ id: crypto.randomUUID(), value: f })) : [{ id: crypto.randomUUID(), value: "" }],
        isActive: courseData.isActive ?? true,
      });
      setImagePreview(courseData.imageUrl || null);
      setImageFile(null);
      setInstructorName(courseData.instructor ? `${courseData.instructor.name || ''} ${courseData.instructor.lastname || ''}`.trim() : "");
    } else {
      setFormData({
        title: "",
        description: "",
        category: "",
        level: "",
        duration: "",
        instructor: "",
        features: [{ id: crypto.randomUUID(), value: "" }],
        isActive: true,
      });
      setImagePreview(null);
      setImageFile(null);
      setInstructorName("");
    }
    setError(null);
  };

  if (open !== prevOpen || course !== prevCourse) {
    setPrevOpen(open);
    setPrevCourse(course);
    if (open) {
      resetForm(course);
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
      const payload: CreateCourseDto = {
        title: formData.title,
        description: formData.description || null,
        category: formData.category || null,
        level: formData.level || null,
        duration: formData.duration || null,
        instructor: formData.instructor || undefined,
        isActive: formData.isActive,
        features: formData.features
          .map((f) => f.value.trim())
          .filter((f) => f !== ""),
      };

      let savedCourse: Course;
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
        features: [{ id: crypto.randomUUID(), value: "" }],
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
      <DialogContent className="sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
              <BookIcon className="h-4 w-4 text-white" />
            </div>
            {course ? "Editar Curso" : "Registrar Nuevo Curso"}
          </DialogTitle>
          <DialogDescription>
            {course
              ? `Modifica los datos del curso ${course.title}.`
              : "Completa los campos para registrar un nuevo curso."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
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
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  tabIndex={-1}
                  value={instructorName || formData.instructor || ""}
                  placeholder="Ninguno seleccionado"
                  className="bg-muted focus-visible:ring-0 focus-visible:ring-offset-0 cursor-default"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInstructorModalOpen(true)}
                >
                  <SearchIcon className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Características principales</Label>
            {formData.features.map((featureObj, index) => (
              <div key={featureObj.id} className="flex items-center gap-2">
                <Input
                  value={featureObj.value}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  placeholder="Ej. Certificado al finalizar"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeFeature(index)}
                  disabled={formData.features.length === 1 && !featureObj.value}
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
                  ? "border-sidebar bg-sidebar/10"
                  : "border-border hover:border-sidebar/50 hover:bg-muted/50"
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
                <div className="relative h-32 w-full overflow-hidden rounded-lg">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
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
                <button
                  type="button"
                  className="flex cursor-pointer flex-col items-center text-center w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="mb-2 rounded-full bg-sidebar/10 p-3 text-sidebar">
                    <UploadCloudIcon className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Haz clic o arrastra tu imagen aquí
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG o WEBP (máx. 5MB)
                  </p>
                </button>
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
            className="bg-sidebar hover:bg-sidebar-accent text-white"
          >
            {isLoading ? "Guardando..." : "Guardar Curso"}
          </Button>
        </DialogFooter>
      </DialogContent>

      <InstructorModal
        open={isInstructorModalOpen}
        onOpenChange={setIsInstructorModalOpen}
        selectedInstructorId={formData.instructor}
        onSelect={(id, name) => {
          handleChange("instructor", id);
          setInstructorName(name);
        }}
      />
    </Dialog>
  );
}
