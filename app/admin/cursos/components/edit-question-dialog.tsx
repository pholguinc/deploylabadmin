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
import { HelpCircleIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { updateQuestion, updateOption } from "../services/lessons.service";
import type { Question, Option } from "../interfaces/course.interface";

interface EditQuestionDialogProps {
  question: Question | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditQuestionDialog({
  question,
  open,
  onOpenChange,
  onSuccess,
}: Readonly<EditQuestionDialogProps>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [text, setText] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [prevQuestionId, setPrevQuestionId] = useState<string | undefined>(
    undefined,
  );

  if (question?.id !== prevQuestionId) {
    setPrevQuestionId(question?.id);
    if (question) {
      setText(question.text);
      setOptions(question.options.map((o) => ({ ...o })));
    } else {
      setText("");
      setOptions([]);
    }
  }

  const updateOptionText = (index: number, newText: string) => {
    setOptions((prev) =>
      prev.map((o, i) => (i === index ? { ...o, text: newText } : o)),
    );
  };

  const toggleOptionCorrect = (index: number) => {
    setOptions((prev) =>
      prev.map((o, i) => (i === index ? { ...o, isCorrect: !o.isCorrect } : o)),
    );
  };

  const handleSave = async () => {
    if (!question) return;
    if (!text.trim()) {
      setError("El texto de la pregunta es obligatorio");
      return;
    }

    const hasCorrect = options.some((o) => o.isCorrect);
    if (!hasCorrect) {
      setError("Debe haber al menos una opción correcta");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // 1. Update question text if it changed
      if (text.trim() !== question.text) {
        await updateQuestion(question.id, { text: text.trim() });
      }

      // 2. Update options that changed
      for (const option of options) {
        const original = question.options.find((o) => o.id === option.id);
        if (
          original &&
          (original.text !== option.text ||
            original.isCorrect !== option.isCorrect)
        ) {
          await updateOption(option.id, {
            text: option.text.trim(),
            isCorrect: option.isCorrect,
          });
        }
      }

      onSuccess();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar la pregunta");
    } finally {
      setIsLoading(false);
    }
  };

  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircleIcon className="h-5 w-5 text-amber-500" />
            Editar Pregunta
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="question-text">Pregunta *</Label>
            <Input
              id="question-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ej. ¿Qué es Kubernetes?"
            />
          </div>

          <div className="space-y-3">
            <Label>Opciones de respuesta</Label>
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleOptionCorrect(index)}
                  className={`shrink-0 rounded-full p-0.5 transition-colors ${
                    option.isCorrect
                      ? "text-emerald-500"
                      : "text-muted-foreground/40 hover:text-muted-foreground"
                  }`}
                  title={option.isCorrect ? "Correcta" : "Marcar como correcta"}
                >
                  {option.isCorrect ? (
                    <CheckCircle2Icon className="h-5 w-5" />
                  ) : (
                    <XCircleIcon className="h-5 w-5" />
                  )}
                </button>
                <Input
                  value={option.text}
                  onChange={(e) => updateOptionText(index, e.target.value)}
                  placeholder={`Opción ${index + 1}`}
                  className="h-8 text-sm"
                />
              </div>
            ))}
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
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
