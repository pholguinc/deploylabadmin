"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  AwardIcon,
  Loader2Icon,
} from "lucide-react";
import {
  getFinalExam,
  saveFinalExam,
  deleteFinalExam,
  type FinalExamQuestionInput,
  type FinalExamOptionInput,
} from "../services/courses.service";
import { toast } from "sonner";

interface FinalExamDialogProps {
  courseId: string;
  courseTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function FinalExamDialog({
  courseId,
  courseTitle,
  open,
  onOpenChange,
  onSuccess,
}: FinalExamDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("Examen Final de Certificación");
  const [hasExistingExam, setHasExistingExam] = useState(false);

  const [questions, setQuestions] = useState<FinalExamQuestionInput[]>([
    {
      text: "",
      options: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
      ],
    },
  ]);

  useEffect(() => {
    if (open && courseId) {
      loadExam();
    }
  }, [open, courseId]);

  const loadExam = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const exam = await getFinalExam(courseId);
      if (exam && exam.questions && exam.questions.length > 0) {
        setTitle(exam.title || "Examen Final de Certificación");
        setQuestions(
          exam.questions.map((q) => ({
            id: q.id,
            text: q.text,
            options: q.options.map((o) => ({
              id: o.id,
              text: o.text,
              isCorrect: o.isCorrect,
            })),
          }))
        );
        setHasExistingExam(true);
      } else {
        setTitle("Examen Final de Certificación");
        setQuestions([
          {
            text: "",
            options: [
              { text: "", isCorrect: true },
              { text: "", isCorrect: false },
            ],
          },
        ]);
        setHasExistingExam(false);
      }
    } catch {
      // If error loading, provide fresh form
      setTitle("Examen Final de Certificación");
      setQuestions([
        {
          text: "",
          options: [
            { text: "", isCorrect: true },
            { text: "", isCorrect: false },
          ],
        },
      ]);
      setHasExistingExam(false);
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        text: "",
        options: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
        ],
      },
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
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        if (q.options.length <= 1) {
          toast.error("La pregunta debe tener al menos una opción");
          return q;
        }
        return {
          ...q,
          options: q.options.filter((_, j) => j !== oIndex),
        };
      })
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
    setTitle("Examen Final de Certificación");
    setQuestions([
      {
        text: "",
        options: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
        ],
      },
    ]);
    setError(null);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("El título del examen es obligatorio");
      return;
    }

    if (questions.length === 0) {
      setError("Debes agregar al menos una pregunta");
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setError(`La pregunta #${i + 1} no tiene texto`);
        return;
      }

      const validOptions = q.options.filter((o) => o.text.trim());
      if (validOptions.length < 1) {
        setError(
          `La pregunta #${i + 1} ("${q.text.trim()}") debe tener al menos una opción de respuesta con texto`
        );
        return;
      }

      const hasCorrect = validOptions.some((o) => o.isCorrect);
      if (!hasCorrect) {
        setError(
          `La pregunta #${i + 1} ("${q.text.trim()}") debe tener al menos una opción marcada como correcta (icono verde)`
        );
        return;
      }
    }

    setIsSaving(true);
    setError(null);
    try {
      const formattedQuestions = questions.map((q) => ({
        text: q.text.trim(),
        options: q.options
          .filter((o) => o.text.trim())
          .map((o) => ({
            text: o.text.trim(),
            isCorrect: o.isCorrect,
          })),
      }));

      await saveFinalExam(courseId, {
        title: title.trim(),
        questions: formattedQuestions,
      });

      toast.success("Examen final guardado correctamente");
      setHasExistingExam(true);
      onSuccess?.();
      onOpenChange(false);
    } catch (e: any) {
      const msg = e instanceof Error ? e.message : "Error al guardar el examen final";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "¿Estás seguro de eliminar el examen final de este curso? Los estudiantes ya no podrán rendirlo."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      await deleteFinalExam(courseId);
      toast.success("Examen final eliminado correctamente");
      setHasExistingExam(false);
      resetForm();
      onSuccess?.();
      onOpenChange(false);
    } catch (e: any) {
      const msg = e instanceof Error ? e.message : "Error al eliminar el examen final";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setError(null);
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <AwardIcon className="h-5 w-5 text-amber-500" />
              {hasExistingExam ? "Editar Examen Final" : "Configurar Examen Final"}
              {hasExistingExam && (
                <Badge
                  variant="outline"
                  className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium"
                >
                  Registrado
                </Badge>
              )}
            </DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Curso: <span className="font-semibold text-foreground">{courseTitle}</span>
          </p>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive font-medium border border-destructive/20">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2Icon className="h-8 w-8 animate-spin text-amber-500" />
            <p className="text-sm text-muted-foreground">Cargando examen final...</p>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            {/* Exam Title */}
            <div className="space-y-2">
              <Label htmlFor="exam-title">Título del examen *</Label>
              <Input
                id="exam-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Examen Final de Certificación"
              />
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Preguntas ({questions.length})
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addQuestion}
                  className="gap-1.5 text-xs text-sidebar hover:bg-sidebar/10 border-sidebar/30"
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
                        onChange={(e) =>
                          updateQuestionText(qIndex, e.target.value)
                        }
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
                        title="Eliminar pregunta"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Options */}
                  <div className="ml-2 space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Opciones de respuesta (haz clic en el icono para marcar como correcta)
                    </Label>
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
                          title={
                            option.isCorrect
                              ? "Opción correcta (clic para desmarcar)"
                              : "Marcar como opción correcta"
                          }
                        >
                          {option.isCorrect ? (
                            <CheckCircle2Icon className="h-5 w-5" />
                          ) : (
                            <XCircleIcon className="h-5 w-5" />
                          )}
                        </button>

                        <Input
                          value={option.text}
                          onChange={(e) =>
                            updateOptionText(qIndex, oIndex, e.target.value)
                          }
                          placeholder={`Escribe la opción ${oIndex + 1}...`}
                          className="bg-background h-8 text-sm flex-1"
                        />

                        {question.options.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(qIndex, oIndex)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                            title="Eliminar opción"
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
                      className="gap-1 text-xs text-muted-foreground hover:text-amber-600"
                    >
                      <PlusIcon className="h-3 w-3" />
                      Agregar opción
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-4 border-t">
          <div>
            {hasExistingExam && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting || isSaving}
                className="gap-1.5"
              >
                {isDeleting ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2Icon className="h-4 w-4" />
                )}
                Eliminar Examen
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setError(null);
                onOpenChange(false);
              }}
              disabled={isSaving || isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isDeleting || isLoading}
              className="bg-sidebar hover:bg-sidebar-accent text-white gap-2 shadow-sm"
            >
              {isSaving ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <AwardIcon className="h-4 w-4" />
                  {hasExistingExam ? "Actualizar Examen Final" : "Crear Examen Final"}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
