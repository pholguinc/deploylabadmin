"use client";

import { useRef, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon, ExternalLinkIcon, XIcon, UploadIcon, Loader2Icon, UploadCloudIcon, FileIcon } from "lucide-react";
import { replaceResourceFile } from "../services/lessons.service";

interface DocumentViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  url: string | null | undefined;
  resourceId?: string;
  onSuccess?: () => void;
}

export function DocumentViewerDialog({
  open,
  onOpenChange,
  title,
  url,
  resourceId,
  onSuccess,
}: Readonly<DocumentViewerDialogProps>) {
  const [isUploading, setIsUploading] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileToReplace, setFileToReplace] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileToReplace(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileToReplace(e.target.files[0]);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleConfirmReplace = async () => {
    if (!fileToReplace || !resourceId) return;

    try {
      setIsUploading(true);
      await replaceResourceFile(resourceId, fileToReplace);
      alert("Archivo reemplazado exitosamente");
      if (onSuccess) onSuccess();
      setIsReplacing(false);
      setFileToReplace(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error(error);
      alert("Error al reemplazar el archivo");
    } finally {
      setIsUploading(false);
    }
  };
  // Función para determinar si necesitamos usar un visor externo
  const getViewerUrl = (fileUrl: string) => {
    if (!fileUrl) return "";
    
    const lowerUrl = fileUrl.toLowerCase();
    let finalUrl = "";
    
    // Para PDFs, el iframe nativo del navegador funciona bien
    if (lowerUrl.includes(".pdf")) {
      finalUrl = fileUrl.includes("#") ? fileUrl : `${fileUrl}#navpanes=0`;
    }
    // Para archivos de Office usamos el visor de Microsoft que es más confiable para Word, Excel, etc.
    else if (lowerUrl.includes(".doc") || lowerUrl.includes(".xls") || lowerUrl.includes(".ppt")) {
      finalUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
    }
    else {
      finalUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    }

    // DEBUG para la consola
    console.log("🛠️ DEBUG VISOR DOCUMENTOS:");
    console.log("- URL Original que llega al componente:", fileUrl);
    console.log("- URL del Visor Generada que se pone en el iframe:", finalUrl);
    
    return finalUrl;
  };

  // Función para detectar si la URL es local/privada
  const isLocalUrl = (urlToCheck: string) => {
    try {
      const urlObj = new URL(urlToCheck);
      const hostname = urlObj.hostname;
      return (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
      );
    } catch (e) {
      return false;
    }
  };

  const isPdf = url ? url.toLowerCase().includes(".pdf") : false;
  const isLocal = url ? isLocalUrl(url) : false;
  const canUseIframe = url && (isPdf || !isLocal);

  const renderViewerContent = () => {
    if (isReplacing) {
      return (
        <div className="flex h-full flex-col p-6 items-center justify-center bg-background overflow-y-auto">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium">Reemplazar Archivo</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Sube el nuevo archivo para actualizar este recurso.
              </p>
            </div>
            
            <div
              className={`relative flex w-full overflow-hidden min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${
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
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4,.webm"
                onChange={handleFileInputChange}
              />

              {fileToReplace ? (
                <div className="flex w-full flex-col gap-4">
                  <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-background p-3 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="shrink-0 rounded-full bg-violet-100 p-2 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                        <FileIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {fileToReplace.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatSize(fileToReplace.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFileToReplace(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={handleConfirmReplace} 
                    disabled={isUploading} 
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {isUploading ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      "Confirmar y Subir Reemplazo"
                    )}
                  </Button>
                </div>
              ) : (
                <div
                  className="flex cursor-pointer flex-col items-center text-center w-full h-full justify-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="mb-4 rounded-full bg-violet-100 p-4 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                    <UploadCloudIcon className="h-8 w-8" />
                  </div>
                  <p className="text-base font-medium text-foreground">
                    Haz clic o arrastra tu archivo aquí
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Soporta PDF, Word, Excel, PowerPoint, imágenes y videos.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-center">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setIsReplacing(false);
                  setFileToReplace(null);
                }}
                disabled={isUploading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (!open || !url) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2">
          <AlertCircleIcon className="h-8 w-8 opacity-50" />
          <span>No hay un documento válido para mostrar.</span>
        </div>
      );
    }

    if (canUseIframe) {
      return (
        <iframe
          src={getViewerUrl(url)}
          className="w-full h-full border-0"
          title={title}
          allowFullScreen
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 p-8 text-center">
        <AlertCircleIcon className="h-12 w-12 opacity-50 text-yellow-500" />
        <h3 className="text-lg font-medium text-foreground">Vista previa no disponible en desarrollo</h3>
        <p className="max-w-md">
          El visor de Office necesita que el documento sea accesible públicamente en internet. 
          Actualmente estás usando una IP local (<b>{new URL(url).hostname}</b>).
        </p>
        <Button asChild variant="default" className="mt-4">
          <a href={url} target="_blank" rel="noopener noreferrer">
            Descargar o abrir documento local
          </a>
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-[800px] h-[85vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-lg flex items-center justify-between">
            <span className="truncate pr-4">{title}</span>
            <div className="flex items-center gap-2">
              {resourceId && (
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-8 gap-1.5 shrink-0 ${isReplacing ? 'bg-muted' : ''}`}
                  onClick={() => {
                    setIsReplacing(!isReplacing);
                    setFileToReplace(null);
                  }}
                  disabled={isUploading}
                >
                  <UploadIcon className="h-3.5 w-3.5" />
                  {isReplacing ? "Cancelar Reemplazo" : "Reemplazar"}
                </Button>
              )}
              {url && (
                <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 shrink-0" disabled={isUploading}>
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                    Abrir en nueva pestaña
                  </a>
                </Button>
              )}
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted shrink-0">
                  <XIcon className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </DialogClose>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 w-full bg-muted/20 relative">
          {renderViewerContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
