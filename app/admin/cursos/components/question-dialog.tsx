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
import { PlusIcon, Trash2Icon, HelpCircleIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { addQuestion } from "../services/lessons.service";
import { toast } from "sonner";

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface QuestionDialogProps {
  quizId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function QuestionDialog({
  quizId,
  open,
  onOpenChange,
  onSuccess,
}: QuestionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [text, setText] = useState("");
  const [options, setOptions] = useState<QuizOption[]>([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  const addOption = () => {
    setOptions((prev) => [...prev, { text: "", isCorrect: false }]);
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateOptionText = (index: number, newText: string) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, text: newText } : o)));
  };

  const toggleOptionCorrect = (index: number) => {
    setOptions((prev) =>
      prev.map((o, i) => (i === index ? { ...o, isCorrect: !o.isCorrect } : o))
    );
  };

  const resetForm = () => {
    setText("");
    setOptions([
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]);
    setError(null);
  };

  const handleSave = async () => {
    if (!quizId) return;
    if (!text.trim()) {
      setError("El texto de la pregunta es obligatorio");
      return;
    }

    const validOptions = options.filter((o) => o.text.trim());
    if (validOptions.length < 2) {
      setError("La pregunta debe tener al menos 2 opciones");
      return;
    }

    const hasCorrect = validOptions.some((o) => o.isCorrect);
    if (!hasCorrect) {
      setError("Debe haber al menos una opción correcta");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await addQuestion(quizId, {
        text: text.trim(),
        options: validOptions.map(o => ({ text: o.text.trim(), isCorrect: o.isCorrect }))
      });
      toast.success("Pregunta guardada correctamente");
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Error al guardar la pregunta";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircleIcon className="h-5 w-5 text-amber-500" />
            Agregar Pregunta
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
              <div key={index} className="flex items-center gap-2">
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
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2Icon className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="gap-1.5 text-xs w-full mt-2"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Agregar otra opción
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => { resetForm(); onOpenChange(false); }}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !quizId}
            className="bg-sidebar hover:bg-sidebar-accent text-white"
          >
            {isLoading ? "Guardando..." : "Guardar Pregunta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
