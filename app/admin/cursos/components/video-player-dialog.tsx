"use client";

import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PlyrPlayer = dynamic<{ videoUrl: string }>(
  () => import("./plyr-player"),
  { ssr: false },
);

interface VideoPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  videoUrl: string | null | undefined;
}

export function VideoPlayerDialog({
  open,
  onOpenChange,
  title,
  videoUrl,
}: VideoPlayerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg">{title}</DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-4">
          {open && videoUrl ? (
            <PlyrPlayer videoUrl={videoUrl} />
          ) : (
            <div className="flex items-center justify-center rounded-xl bg-muted/50 aspect-video text-muted-foreground text-sm">
              Esta lección no tiene un video asociado.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

