import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  PlusCircleIcon,
  Trash2Icon,
  PlusIcon,
  HelpCircleIcon,
  CheckCircle2Icon,
  XCircleIcon,
} from "lucide-react";
import { createQuiz } from "../services/lessons.service";
import { toast } from "sonner";

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  text: string;
  options: QuizOption[];
}

interface QuizDialogProps {
  lessonId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function QuizDialog({
  lessonId,
  open,
  onOpenChange,
  onSuccess,
}: QuizDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { text: "", options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }] },
  ]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { text: "", options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }] },
    ]);
  };

  const removeQuestion = (qIndex: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== qIndex));
  };

  const updateQuestionText = (qIndex: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, text } : q))
    );
  };

  const addOption = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: [...q.options, { text: "", isCorrect: false }] }
          : q
      )
    );
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: q.options.filter((_, j) => j !== oIndex) }
          : q
      )
    );
  };

  const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((o, j) =>
                j === oIndex ? { ...o, text } : o
              ),
            }
          : q
      )
    );
  };

  const toggleOptionCorrect = (qIndex: number, oIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((o, j) =>
                j === oIndex ? { ...o, isCorrect: !o.isCorrect } : o
              ),
            }
          : q
      )
    );
  };

  const resetForm = () => {
    setTitle("");
    setQuestions([
      { text: "", options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }] },
    ]);
    setError(null);
  };

  const handleSave = async () => {
    if (!lessonId) return;
    if (!title.trim()) {
      setError("El título del examen es obligatorio");
      return;
    }

    // Validate questions
    const validQuestions = questions.filter((q) => q.text.trim());
    for (const q of validQuestions) {
      const validOptions = q.options.filter((o) => o.text.trim());
      if (validOptions.length < 2) {
        setError(`La pregunta "${q.text}" debe tener al menos 2 opciones`);
        return;
      }
      const hasCorrect = validOptions.some((o) => o.isCorrect);
      if (!hasCorrect) {
        setError(`La pregunta "${q.text}" debe tener al menos una respuesta correcta`);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    try {
      const payload: { title: string; questions?: { text: string; options: { text: string; isCorrect: boolean }[] }[] } = {
        title: title.trim(),
      };

      if (validQuestions.length > 0) {
        payload.questions = validQuestions.map((q) => ({
          text: q.text.trim(),
          options: q.options
            .filter((o) => o.text.trim())
            .map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect })),
        }));
      }

      await createQuiz(lessonId, payload);
      toast.success("Examen creado correctamente");
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Error al guardar el examen";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircleIcon className="h-5 w-5 text-amber-500" />
            Crear Examen
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-6 py-2">
          {/* Quiz Title */}
          <div className="space-y-2">
            <Label htmlFor="quiz-title">Título del examen *</Label>
            <Input
              id="quiz-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Evaluación: Módulo 1"
            />
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Preguntas</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addQuestion}
                className="gap-1.5 text-xs"
              >
                <PlusCircleIcon className="h-3.5 w-3.5" />
                Agregar Pregunta
              </Button>
            </div>

            {questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Pregunta {qIndex + 1}
                    </Label>
                    <Input
                      value={question.text}
                      onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                      placeholder="Escribe la pregunta..."
                      className="bg-background"
                    />
                  </div>
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(qIndex)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 mt-6"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Options */}
                <div className="ml-2 space-y-2">
                  <Label className="text-xs text-muted-foreground">Opciones de respuesta</Label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleOptionCorrect(qIndex, oIndex)}
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
                        onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                        placeholder={`Opción ${oIndex + 1}`}
                        className="bg-background h-8 text-sm"
                      />
                      {question.options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(qIndex, oIndex)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2Icon className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addOption(qIndex)}
                    className="gap-1 text-xs text-muted-foreground hover:text-violet-600"
                  >
                    <PlusIcon className="h-3 w-3" />
                    Agregar opción
                  </Button>
                </div>
              </div>
            ))}
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
            disabled={isLoading || !lessonId}
            className="bg-sidebar hover:bg-sidebar-accent text-white"
          >
            {isLoading ? "Creando..." : "Crear Examen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
