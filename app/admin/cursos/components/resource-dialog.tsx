import { useState, useRef } from "react";
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
import { UploadCloudIcon, XIcon, FileIcon, LinkIcon } from "lucide-react";
import { createResource } from "../services/lessons.service";
import { toast } from "sonner";

interface ResourceDialogProps {
  readonly lessonId: string | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function ResourceDialog({
  lessonId,
  open,
  onOpenChange,
  onSuccess,
}: ResourceDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadMethod, setUploadMethod] = useState<"FILE" | "URL">("FILE");
  const [url, setUrl] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "PDF",
  });

  const handleChange = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    if (!formData.name) {
      handleChange("name", selectedFile.name.split(".")[0]);
    }
    setError(null);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!lessonId) return;
    if (!formData.name) {
      setError("El nombre del recurso es obligatorio");
      return;
    }
    if (uploadMethod === "FILE" && !file) {
      setError("Debes subir un archivo");
      return;
    }
    if (uploadMethod === "URL" && !url.trim()) {
      setError("Debes ingresar una URL válida");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await createResource(lessonId, {
        name: formData.name,
        type: uploadMethod === "URL" ? "VIDEO" : formData.type, // Default type for URL could be VIDEO or let user choose
        size: file ? formatSize(file.size) : undefined,
        file: file || undefined,
        url: uploadMethod === "URL" ? url.trim() : undefined,
      });
      toast.success("Recurso subido correctamente");
      onSuccess();
      onOpenChange(false);
      setFormData({ name: "", type: "PDF" });
      removeFile();
      setUrl("");
      setUploadMethod("FILE");
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Error al guardar el recurso";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Subir Material / Recurso</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del recurso *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ej. Presentación Clase 1"
            />
          </div>

          <div className="space-y-2">
            <Label>Método de subida</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={uploadMethod === "FILE" ? "default" : "outline"}
                className={uploadMethod === "FILE" ? "bg-sidebar hover:bg-sidebar-accent text-white flex-1" : "flex-1"}
                onClick={() => setUploadMethod("FILE")}
              >
                <FileIcon className="w-4 h-4 mr-2" />
                Archivo Local
              </Button>
              <Button
                type="button"
                variant={uploadMethod === "URL" ? "default" : "outline"}
                className={uploadMethod === "URL" ? "bg-sidebar hover:bg-sidebar-accent text-white flex-1" : "flex-1"}
                onClick={() => setUploadMethod("URL")}
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Enlace (URL)
              </Button>
            </div>
          </div>

          {uploadMethod === "URL" && (
            <div className="space-y-2">
              <Label htmlFor="url">URL del recurso *</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}

          {uploadMethod === "FILE" && (
            <div className="space-y-2">
              <Label>Archivo</Label>
              <div
                className={`relative flex w-full overflow-hidden min-h-[140px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition-colors ${
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
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
                  onChange={handleFileChange}
                />

                {file ? (
                  <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-border bg-background p-3 shadow-sm">
                    <div className="rounded-full bg-sidebar/10 p-2 text-sidebar">
                      <FileIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 overflow-hidden">
                      <p className="truncate text-sm font-medium text-foreground">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(file.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="flex cursor-pointer flex-col items-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar rounded-lg p-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="mb-2 rounded-full bg-sidebar/10 p-3 text-sidebar">
                      <UploadCloudIcon className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      Haz clic o arrastra tu archivo aquí
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PDF, DOC, PPT o ZIP (máx. 10MB)
                    </p>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !lessonId} className="bg-sidebar hover:bg-sidebar-accent text-white">
            {isLoading ? "Subiendo..." : "Subir Recurso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
