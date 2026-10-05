import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { uploadLessonVideo } from "../services/lessons.service";
import { toast } from "sonner";
import { UploadCloudIcon, XIcon, VideoIcon } from "lucide-react";
import dynamic from "next/dynamic";

const PlyrPlayer = dynamic<{ videoUrl: string }>(
  () => import("./plyr-player"),
  { ssr: false },
);

interface UpdateVideoDialogProps {
  lessonId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  currentVideoUrl?: string | null;
}

export function UpdateVideoDialog({
  lessonId,
  open,
  onOpenChange,
  onSuccess,
  currentVideoUrl,
}: Readonly<UpdateVideoDialogProps>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File state
  const [isDragging, setIsDragging] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setVideoFile(null);
      setPreviewUrl(currentVideoUrl || null);
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
    if (!file.type.startsWith("video/")) {
      setError("El archivo debe ser un video");
      return;
    }
    setVideoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const removeVideo = () => {
    setVideoFile(null);
    setPreviewUrl(currentVideoUrl || null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!lessonId) return;
    if (!videoFile && !currentVideoUrl) {
      setError("Debes subir un archivo de video");
      return;
    }

    // If there is no new file, we can just close
    if (!videoFile) {
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);
    try {
      await uploadLessonVideo(lessonId, videoFile, (p) => setProgress(p));
      toast.success("Video de la lección actualizado correctamente");
      onSuccess();
      onOpenChange(false);
      setProgress(0);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Error al actualizar el video";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subir Video de la Lección</DialogTitle>
          <DialogDescription>
            Sube el archivo de video físico para procesarlo y asociarlo a esta
            lección.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-4 py-4">
          <div className="space-y-2 w-full min-w-0">
            <Label>Archivo de Video</Label>
            <div
              className={`relative flex w-full min-w-0 overflow-hidden min-h-[140px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition-colors ${
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
                accept="video/*"
                onChange={handleFileChange}
              />

              {videoFile ? (
                <div className="flex w-full min-w-0 items-center justify-between rounded-lg bg-muted p-3">
                  <div className="flex flex-1 min-w-0 items-center gap-3 overflow-hidden">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sidebar/10 text-sidebar">
                      <VideoIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">
                        {videoFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeVideo();
                    }}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  className="flex cursor-pointer flex-col items-center justify-center text-center w-full h-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="mb-2 rounded-full bg-sidebar/10 p-3 text-sidebar">
                    <UploadCloudIcon className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Haz clic o arrastra tu video aquí
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    MP4, WEBM o OGG (máx. 500MB)
                  </p>
                </button>
              )}
              {isLoading && progress > 0 && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
                  <div className="w-3/4 max-w-sm flex flex-col items-center">
                    <p className="text-sm font-medium mb-2 text-foreground">
                      {progress === 100 ? "Procesando video..." : `Subiendo video: ${progress}%`}
                    </p>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sidebar transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {previewUrl && (
            <div className="space-y-2 mt-2 min-w-0 w-full">
              <Label>Previsualización</Label>
              <div className="w-full max-w-full aspect-video overflow-hidden rounded-xl border border-border bg-black">
                <PlyrPlayer videoUrl={previewUrl} />
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
          <Button
            onClick={handleSave}
            disabled={
              isLoading || !lessonId || (!videoFile && !currentVideoUrl)
            }
            className="bg-sidebar hover:bg-sidebar-accent text-white"
          >
            {isLoading ? "Subiendo..." : "Guardar Video"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
