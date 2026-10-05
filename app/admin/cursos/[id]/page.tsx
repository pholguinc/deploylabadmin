"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  getCourseById,
  updateModule,
  deleteModule,
  getFinalExam,
  type FinalExamConfig,
} from "../services/courses.service";
import {
  deleteResource,
  deleteQuiz,
  deleteQuestion,
  updateLesson,
} from "../services/lessons.service";
import type {
  Course,
  Question,
  CourseModule,
  Lesson,
  Quiz,
  Resource,
} from "../interfaces/course.interface";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeftIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  BookOpenIcon,
  ClockIcon,
  StarIcon,
  UserIcon,
  VideoIcon,
  FileTextIcon,
  PlayCircleIcon,
  HelpCircleIcon,
  ListIcon,
  PlusIcon,
  PlusCircleIcon,
  MoreVerticalIcon,
  PaperclipIcon,
  Trash2Icon,
  PencilIcon,
  CheckCircleIcon,
  GripVerticalIcon,
  Loader2Icon,
  AwardIcon,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvided,
} from "@hello-pangea/dnd";
import { ModuleDialog } from "../components/module-dialog";
import { LessonDialog } from "../components/lesson-dialog";
import { CourseDialog } from "../components/course-dialog";
import { ResourceDialog } from "../components/resource-dialog";
import { QuizDialog } from "../components/quiz-dialog";
import { QuestionDialog } from "../components/question-dialog";
import { EditQuestionDialog } from "../components/edit-question-dialog";
import { VideoPlayerDialog } from "../components/video-player-dialog";
import { DocumentViewerDialog } from "../components/document-viewer-dialog";
import { UpdateVideoDialog } from "../components/update-video-dialog";
import { FinalExamDialog } from "../components/final-exam-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const renderIconForLessonType = (type: string) => {
  switch (type.toUpperCase()) {
    case "VIDEO":
      return <VideoIcon className="h-4 w-4 text-sidebar" />;
    case "PDF":
      return <FileTextIcon className="h-4 w-4 text-rose-500" />;
    case "QUIZ":
      return <HelpCircleIcon className="h-4 w-4 text-amber-500" />;
    default:
      return <PlayCircleIcon className="h-4 w-4 text-indigo-500" />;
  }
};

interface QuestionItemProps {
  q: Question;
  qIndex: number;
  setSelectedQuestion: (q: Question | null) => void;
  setIsEditQuestionDialogOpen: (open: boolean) => void;
  load: () => Promise<void>;
}

interface QuizItemProps {
  quiz: Quiz;
  setSelectedQuizId: (id: string | null) => void;
  setIsQuestionDialogOpen: (open: boolean) => void;
  setSelectedQuestion: (q: Question | null) => void;
  setIsEditQuestionDialogOpen: (open: boolean) => void;
  load: () => Promise<void>;
}

interface ResourceItemProps {
  res: Resource;
  load: () => Promise<void>;
  setDocument?: (
    doc: { id?: string; title: string; url: string | null | undefined } | null,
  ) => void;
  setIsDocumentDialogOpen?: (open: boolean) => void;
}

interface LessonItemProps
  extends Omit<QuizItemProps, "quiz">, Omit<ResourceItemProps, "res"> {
  lesson: Lesson;
  lIndex: number;
  setVideoLesson: (
    lesson: { title: string; videoUrl: string | null | undefined } | null,
  ) => void;
  setIsVideoDialogOpen: (open: boolean) => void;
  setSelectedLessonId: (id: string | null) => void;
  setSelectedLesson: (lesson: Lesson | null) => void;
  setIsLessonDialogOpen: (open: boolean) => void;
  setIsResourceDialogOpen: (open: boolean) => void;
  setIsQuizDialogOpen: (open: boolean) => void;
  setIsUpdateVideoDialogOpen: (open: boolean) => void;
  provided?: DraggableProvided;
}

interface ModuleItemProps extends Omit<LessonItemProps, "lesson" | "lIndex"> {
  module: CourseModule;
  mIndex: number;
  setSelectedModuleId: (id: string | null) => void;
  setIsLessonDialogOpen: (open: boolean) => void;
  handleDeleteModule: (moduleId: string) => Promise<void>;
  provided?: DraggableProvided;
}

const QuestionItem = ({
  q,
  qIndex,
  setSelectedQuestion,
  setIsEditQuestionDialogOpen,
  load,
}: QuestionItemProps) => (
  <div className="group/question">
    <div className="flex items-start justify-between text-xs text-muted-foreground hover:text-foreground transition-colors py-0.5 rounded px-1 hover:bg-muted/30">
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">
          {qIndex + 1}. {q.text}
        </span>
        <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
          {q.options.find((o) => o.isCorrect)?.text}
          <CheckCircleIcon className="h-3 w-3 text-emerald-500" />
        </span>
      </div>
      <div className="flex items-center opacity-0 group-hover/question:opacity-100 transition-opacity shrink-0 ml-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-muted-foreground hover:text-sidebar"
          onClick={() => {
            setSelectedQuestion(q);
            setIsEditQuestionDialogOpen(true);
          }}
        >
          <PencilIcon className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-muted-foreground hover:text-destructive"
          onClick={async () => {
            if (confirm("¿Eliminar esta pregunta?")) {
              try {
                await deleteQuestion(q.id);
                load();
              } catch {}
            }
          }}
        >
          <Trash2Icon className="h-3 w-3" />
        </Button>
      </div>
    </div>
  </div>
);

const QuizItem = ({
  quiz,
  setSelectedQuizId,
  setIsQuestionDialogOpen,
  load,
  setSelectedQuestion,
  setIsEditQuestionDialogOpen,
}: QuizItemProps) => (
  <div className="flex flex-col gap-2 group/quiz">
    <div className="flex items-center gap-2 text-sm text-muted-foreground pl-1 py-0.5 rounded hover:bg-muted/30 transition-colors">
      <HelpCircleIcon className="h-3.5 w-3.5 text-amber-500 shrink-0" />
      <span>{quiz.title}</span>
      <Badge
        variant="outline"
        className="text-[10px] h-4 shrink-0 border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400"
      >
        Examen
      </Badge>
      <span className="text-[10px] text-muted-foreground/50">
        ({quiz.questions?.length || 0} preguntas)
      </span>
      <div className="flex items-center gap-1 opacity-0 group-hover/quiz:opacity-100 transition-opacity ml-auto">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-sidebar shrink-0"
          title="Agregar pregunta"
          onClick={() => {
            setSelectedQuizId(quiz.id);
            setIsQuestionDialogOpen(true);
          }}
        >
          <PlusIcon className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
          title="Eliminar examen"
          onClick={async () => {
            if (confirm("¿Eliminar este examen y todas sus preguntas?")) {
              try {
                await deleteQuiz(quiz.id);
                load();
              } catch {}
            }
          }}
        >
          <Trash2Icon className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
    {quiz.questions && quiz.questions.length > 0 && (
      <div className="ml-4 space-y-1.5 border-l-2 border-amber-500/20 pl-4 py-1">
        {quiz.questions.map((q, qIndex: number) => (
          <QuestionItem
            key={q.id}
            q={q}
            qIndex={qIndex}
            setSelectedQuestion={setSelectedQuestion}
            setIsEditQuestionDialogOpen={setIsEditQuestionDialogOpen}
            load={load}
          />
        ))}
      </div>
    )}
  </div>
);

const ResourceItem = ({
  res,
  load,
  setDocument,
  setIsDocumentDialogOpen,
}: ResourceItemProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 text-sm text-muted-foreground pl-1 py-0.5 rounded hover:bg-muted/30 transition-colors group/res">
        <PaperclipIcon className="h-3.5 w-3.5 text-blue-500 shrink-0" />
        <button
          type="button"
          onClick={() => {
            if (setDocument && setIsDocumentDialogOpen) {
              setDocument({ id: res.id, title: res.name, url: res.url });
              setIsDocumentDialogOpen(true);
            } else {
              window.open(res.url, "_blank", "noopener,noreferrer");
            }
          }}
          className="hover:text-blue-600 hover:underline transition-colors truncate text-left cursor-pointer"
        >
          {res.name}
        </button>
        {res.type && (
          <Badge variant="outline" className="text-[10px] h-4 shrink-0">
            {res.type}
          </Badge>
        )}
        {res.size && (
          <span className="text-xs opacity-60 shrink-0">({res.size})</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover/res:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0 ml-auto"
          onClick={() => setShowConfirm(true)}
        >
          <Trash2Icon className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eliminar recurso</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este recurso? Esta acción no
              se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                setIsDeleting(true);
                try {
                  await deleteResource(res.id);
                  toast.success("Recurso eliminado correctamente");
                  setShowConfirm(false);
                  load();
                } catch (e) {
                  console.error("Failed to delete resource:", e);
                  toast.error("Error al eliminar el recurso");
                } finally {
                  setIsDeleting(false);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const LessonItem = ({
  lesson,
  lIndex,
  setVideoLesson,
  setIsVideoDialogOpen,
  setSelectedLessonId,
  setSelectedLesson,
  setIsLessonDialogOpen,
  setIsResourceDialogOpen,
  setIsQuizDialogOpen,
  setSelectedQuizId,
  setIsQuestionDialogOpen,
  setSelectedQuestion,
  setIsEditQuestionDialogOpen,
  setDocument,
  setIsDocumentDialogOpen,
  setIsUpdateVideoDialogOpen,
  load,
  provided,
}: LessonItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="flex flex-col transition-colors hover:bg-muted/10 bg-card border-b border-border/50 last:border-0"
      ref={provided?.innerRef}
      {...provided?.draggableProps}
    >
      <div 
        className="flex items-center justify-between group p-4 px-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div
            className="cursor-grab hover:text-sidebar text-muted-foreground/40 active:cursor-grabbing p-1"
            {...provided?.dragHandleProps}
            onClick={(e) => e.stopPropagation()}
          >
          <GripVerticalIcon className="h-4 w-4" />
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar/10 transition-transform group-hover:scale-110">
          {renderIconForLessonType(lesson.type)}
        </div>
        <div>
          <button
            type="button"
            className="font-medium text-foreground transition-colors group-hover:text-sidebar cursor-pointer hover:underline text-left"
            onClick={() => {
              setVideoLesson({
                title: lesson.title,
                videoUrl: lesson.videoUrl,
              });
              setIsVideoDialogOpen(true);
            }}
          >
            {(lesson.order ?? lIndex) + 1}. {lesson.title}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
        {lesson.duration && (
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <ClockIcon className="h-3 w-3" />
            {lesson.duration}
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
            >
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelectedLessonId(lesson.id);
                setIsResourceDialogOpen(true);
              }}
            >
              <PaperclipIcon className="mr-2 h-4 w-4" />
              Agregar Recurso (PDF, etc)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedLesson(lesson);
                setIsLessonDialogOpen(true);
              }}
            >
              <PencilIcon className="mr-2 h-4 w-4" />
              Editar Lección
            </DropdownMenuItem>
            {!lesson.videoUrl && (
              <DropdownMenuItem
                onClick={() => {
                  setSelectedLessonId(lesson.id);
                  setIsUpdateVideoDialogOpen(true);
                }}
              >
                <VideoIcon className="mr-2 h-4 w-4" />
                Agregar Video
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => {
                setSelectedLessonId(lesson.id);
                setIsQuizDialogOpen(true);
              }}
            >
              <HelpCircleIcon className="mr-2 h-4 w-4" />
              Agregar Examen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-sidebar"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>

    {isExpanded && (
      <div className="ml-12 mb-4 space-y-3 border-l-2 border-border/50 pl-4 pr-6">
      {lesson.videoUrl && (
        <div className="space-y-1.5 group/video">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
            <VideoIcon className="h-3 w-3" />
            Video Principal
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground pl-1 py-0.5 rounded hover:bg-muted/30 transition-colors">
            <PlayCircleIcon className="h-3.5 w-3.5 text-sidebar shrink-0" />
            <button
              type="button"
              className="hover:text-sidebar hover:underline transition-colors truncate text-left cursor-pointer"
              onClick={() => {
                setVideoLesson({
                  title: lesson.title,
                  videoUrl: lesson.videoUrl,
                });
                setIsVideoDialogOpen(true);
              }}
            >
              Reproducir video asociado
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover/video:opacity-100 transition-opacity text-muted-foreground hover:text-sidebar shrink-0 ml-auto"
              title="Actualizar video"
              onClick={() => {
                setSelectedLessonId(lesson.id);
                setIsUpdateVideoDialogOpen(true);
              }}
            >
              <PencilIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
          <PaperclipIcon className="h-3 w-3" />
          Recursos
          <span className="ml-1 text-[10px] font-normal">
            ({lesson.resources?.length || 0})
          </span>
        </p>
        {lesson.resources && lesson.resources.length > 0 ? (
          lesson.resources.map((res) => (
            <ResourceItem
              key={res.id}
              res={res}
              load={load}
              setDocument={setDocument}
              setIsDocumentDialogOpen={setIsDocumentDialogOpen}
            />
          ))
        ) : (
          <p className="text-xs text-muted-foreground/50 italic pl-1">
            Sin recursos adjuntos
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
          <HelpCircleIcon className="h-3 w-3" />
          Exámenes
          <span className="ml-1 text-[10px] font-normal">
            ({lesson.quizzes?.length || 0})
          </span>
        </p>
        {lesson.quizzes && lesson.quizzes.length > 0 ? (
          lesson.quizzes.map((quiz) => (
            <QuizItem
              key={quiz.id}
              quiz={quiz}
              setSelectedQuizId={setSelectedQuizId}
              setIsQuestionDialogOpen={setIsQuestionDialogOpen}
              load={load}
              setSelectedQuestion={setSelectedQuestion}
              setIsEditQuestionDialogOpen={setIsEditQuestionDialogOpen}
            />
          ))
        ) : (
          <p className="text-xs text-muted-foreground/50 italic pl-1">
            Sin exámenes asociados
          </p>
        )}
      </div>
      </div>
    )}
  </div>
  );
};

const ModuleItem = ({
  module,
  mIndex,
  setSelectedModuleId,
  setIsLessonDialogOpen,
  handleDeleteModule,
  provided,
  ...lessonProps
}: ModuleItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all hover:shadow-md"
      ref={provided?.innerRef}
      {...provided?.draggableProps}
    >
      <div 
        className="flex items-center justify-between border-b border-border/50 bg-muted/40 p-5 backdrop-blur-sm cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div
              className="cursor-grab hover:text-sidebar text-muted-foreground/40 active:cursor-grabbing p-1 -ml-2"
              {...provided?.dragHandleProps}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVerticalIcon className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold tracking-wider text-sidebar uppercase">
              Módulo {(module.order ?? mIndex) + 1}
            </span>
          </div>
          <h4 className="text-lg font-semibold text-foreground">
            {module.title}
          </h4>
        </div>
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <Badge variant="secondary" className="bg-background/50">
            {module.lessons?.length || 0} lecciones
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs text-muted-foreground hover:text-sidebar"
            onClick={() => {
              setSelectedModuleId(module.id);
              setIsLessonDialogOpen(true);
            }}
          >
            <PlusCircleIcon className="h-3.5 w-3.5" />
            Lección
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive dark:hover:text-destructive"
            onClick={async (e) => {
              e.stopPropagation();
              if (window.confirm("¿Estás seguro de que quieres eliminar este módulo?")) {
                await handleDeleteModule(module.id);
              }
            }}
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-sidebar"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      {isExpanded && (
        <Droppable droppableId={module.id} type="lesson">
          {(provided) => (
            <div
              className="divide-y divide-border/50 bg-card max-h-[400px] overflow-y-auto"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {module.lessons && module.lessons.length > 0 ? (
                module.lessons.map((lesson, lIndex: number) => (
                  <Draggable key={lesson.id} draggableId={lesson.id} index={lIndex}>
                    {(provided) => (
                      <LessonItem
                        lesson={lesson}
                        lIndex={lIndex}
                        setIsLessonDialogOpen={setIsLessonDialogOpen}
                        provided={provided}
                        {...lessonProps}
                      />
                    )}
                  </Draggable>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Aún no hay lecciones en este módulo
                </div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}
    </div>
  );
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isUpdateVideoDialogOpen, setIsUpdateVideoDialogOpen] = useState(false);
  const [isEditQuestionDialogOpen, setIsEditQuestionDialogOpen] =
    useState(false);

  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null,
  );

  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [videoLesson, setVideoLesson] = useState<{
    title: string;
    videoUrl: string | null | undefined;
  } | null>(null);

  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [isFinalExamDialogOpen, setIsFinalExamDialogOpen] = useState(false);
  const [finalExam, setFinalExam] = useState<FinalExamConfig | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<{
    id?: string;
    title: string;
    url: string | null | undefined;
  } | null>(null);

  const load = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [data, examData] = await Promise.all([
        getCourseById(courseId),
        getFinalExam(courseId).catch(() => null),
      ]);
      setCourse(data);
      setFinalExam(examData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el curso");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      const fetchCourse = async () => {
        await load();
      };
      fetchCourse();
    }
  }, [courseId, load]);

  const handleDeleteModule = async (moduleId: string) => {
    if (!course) return;
    try {
      await deleteModule(course.id, moduleId);
      toast.success("Módulo eliminado correctamente");
      load();
    } catch (error) {
      toast.error("Error al eliminar el módulo");
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;
    if (!course) return;

    const newModules = Array.from(course.modules || []);

    if (type === "module") {
      const [moved] = newModules.splice(source.index, 1);
      newModules.splice(destination.index, 0, moved);

      const updatedModules = newModules.map((m, i) => ({ ...m, order: i }));
      setCourse({ ...course, modules: updatedModules });

      try {
        const promises = updatedModules.map(async (m) => {
          const oldModule = course.modules?.find((old) => old.id === m.id);
          if (oldModule && oldModule.order !== m.order) {
            return updateModule(course.id, m.id, { order: m.order });
          }
        });
        await Promise.all(promises);
      } catch (error) {
        toast.error("Error al reordenar módulos");
        load();
      }
    } else if (type === "lesson") {
      const sourceModuleIndex = newModules.findIndex(
        (m) => m.id === source.droppableId,
      );
      const destModuleIndex = newModules.findIndex(
        (m) => m.id === destination.droppableId,
      );

      if (sourceModuleIndex === -1 || destModuleIndex === -1) return;

      if (source.droppableId === destination.droppableId) {
        const module = newModules[sourceModuleIndex];
        const newLessons = Array.from(module.lessons || []);
        const [moved] = newLessons.splice(source.index, 1);
        newLessons.splice(destination.index, 0, moved);

        const updatedLessons = newLessons.map((l, i) => ({ ...l, order: i }));
        newModules[sourceModuleIndex] = { ...module, lessons: updatedLessons };

        setCourse({ ...course, modules: newModules });

        try {
          const promises = updatedLessons.map(async (l) => {
            const oldLesson = course.modules?.[sourceModuleIndex].lessons?.find(
              (old) => old.id === l.id,
            );
            if (oldLesson && oldLesson.order !== l.order) {
              return updateLesson(l.id, { order: l.order });
            }
          });
          await Promise.all(promises);
        } catch (error) {
          toast.error("Error al reordenar lecciones");
          load();
        }
      } else {
        toast.error("No se puede mover lecciones entre módulos por ahora");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-1/3" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
          <HelpCircleIcon className="h-8 w-8" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-foreground">
          No se pudo cargar el curso
        </h2>
        <p className="mb-6 text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Volver atrás
        </Button>
      </div>
    );
  }

  const lessonProps = {
    setVideoLesson,
    setIsVideoDialogOpen,
    setSelectedLessonId,
    setSelectedLesson,
    setIsLessonDialogOpen,
    setIsResourceDialogOpen,
    setIsQuizDialogOpen,
    setSelectedQuizId,
    setIsQuestionDialogOpen,
    setSelectedQuestion,
    setIsEditQuestionDialogOpen,
    setDocument: setSelectedDocument,
    setIsDocumentDialogOpen,
    setIsUpdateVideoDialogOpen,
    load,
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="h-10 w-10 shrink-0 rounded-full transition-colors hover:bg-sidebar/10 hover:text-sidebar"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            Detalle del curso
            {isRefreshing && !isLoading && (
              <Loader2Icon className="h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            Visualiza la información y el contenido del curso
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsFinalExamDialogOpen(true)}
            className={`gap-2 ${
              finalExam
                ? "border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-600"
                : "border-sidebar/20 hover:bg-sidebar/10 text-sidebar"
            }`}
          >
            {finalExam ? (
              <>
                <PencilIcon className="h-4 w-4" /> Editar Examen Final
              </>
            ) : (
              <>
                <AwardIcon className="h-4 w-4" /> Configurar Examen Final
              </>
            )}
          </Button>
          <Button onClick={() => setIsCourseDialogOpen(true)}>
            <PencilIcon className="mr-2 h-4 w-4" /> Editar Curso
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card shadow-sm">
        <div className="absolute inset-0 z-0 opacity-10 blur-3xl">
          <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-sidebar" />
          <div className="absolute -bottom-10 right-10 h-64 w-64 rounded-full bg-sidebar" />
        </div>

        <div className="relative z-10 grid gap-8 p-8 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_400px]">
          {/* Info */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              {course.category && (
                <Badge className="bg-sidebar px-3 py-1 font-medium text-white shadow-sm border-none">
                  {course.category}
                </Badge>
              )}
              {course.level && (
                <Badge
                  variant="secondary"
                  className="px-3 py-1 bg-white/10 dark:bg-black/10 backdrop-blur-md border border-black/5 dark:border-white/5 font-medium"
                >
                  {course.level}
                </Badge>
              )}
              {!course.isActive && (
                <Badge variant="destructive" className="px-3 py-1 font-medium">
                  Inactivo
                </Badge>
              )}
            </div>

            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">
                {course.title}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {course.description ||
                  "Sin descripción proporcionada para este curso."}
              </p>

              {course.features && course.features.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Características principales
                  </h3>
                  <ul className="space-y-1.5">
                    {course.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircleIcon className="h-4 w-4 text-sidebar shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pt-4 border-t border-border/50">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ClockIcon className="h-3 w-3" /> Duración
                </p>
                <p className="font-semibold text-foreground">
                  {course.duration || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpenIcon className="h-3 w-3" /> Lecciones
                </p>
                <p className="font-semibold text-foreground">
                  {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <StarIcon className="h-3 w-3" /> Calificación
                </p>
                <p className="font-semibold text-foreground">
                  {course.rating?.toFixed(1) || "0.0"} / 5
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon className="h-3 w-3" /> Instructor
                </p>
                <p className="font-semibold text-foreground truncate">
                  {course.instructor ? `${course.instructor.name || ''} ${course.instructor.lastname || ''}`.trim() || course.instructor.email : "Sin asignar"}
                </p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-xl shadow-black/5 ring-1 ring-black/5 dark:ring-white/5 self-center">
            {course.imageUrl ? (
              <Image
                src={course.imageUrl}
                alt={course.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-sidebar/5">
                <BookOpenIcon className="mb-2 h-16 w-16 text-sidebar/40" />
                <span className="text-sm font-medium text-sidebar/70">
                  Sin imagen de portada
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modules & Lessons Section */}
      <div className="pt-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ListIcon className="h-6 w-6 text-sidebar" />
              Contenido del Curso
            </h3>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {course.modules?.length || 0} módulos
            </Badge>
          </div>
          <Button
            size="sm"
            className="gap-2 bg-sidebar text-white hover:bg-sidebar-accent shadow-sm"
            onClick={() => setIsModuleDialogOpen(true)}
          >
            <PlusIcon className="h-4 w-4" />
            Agregar Módulo
          </Button>
        </div>

        {course.modules && course.modules.length > 0 ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="modules-list" type="module">
              {(provided) => (
                <div
                  className="space-y-4"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {course.modules?.map((module, mIndex) => (
                    <Draggable
                      key={module.id}
                      draggableId={module.id}
                      index={mIndex}
                    >
                      {(provided) => (
                        <ModuleItem
                          module={module}
                          mIndex={mIndex}
                          setSelectedModuleId={setSelectedModuleId}
                          handleDeleteModule={handleDeleteModule}
                          provided={provided}
                          {...lessonProps}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/50 p-8 text-center text-muted-foreground">
            <BookOpenIcon className="mb-3 h-10 w-10 opacity-20" />
            <p className="mb-4">
              Este curso aún no tiene módulos ni contenido.
            </p>
            <Button
              variant="outline"
              onClick={() => setIsModuleDialogOpen(true)}
            >
              Agregar el primer módulo
            </Button>
          </div>
        )}

        {/* Final Exam Section Card */}
        <div
          className="mt-8 rounded-2xl border p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border-sidebar/20 bg-gradient-to-r from-sidebar/10 via-sidebar/5 to-transparent"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl text-white flex items-center justify-center shadow-md shrink-0 bg-sidebar shadow-sidebar/20">
              <AwardIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-foreground">
                  Examen Final de Certificación
                </h4>
                {finalExam ? (
                  <Badge
                    variant="outline"
                    className="text-xs bg-sidebar/10 text-sidebar border-sidebar/20 font-semibold"
                  >
                    Registrado ({finalExam.questions?.length || 0} preguntas)
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-xs bg-muted text-muted-foreground font-semibold"
                  >
                    Pendiente de Configurar
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="text-xs bg-muted text-muted-foreground"
                >
                  Aprobación: 15 / 20 pts
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {finalExam
                  ? `Examen registrado con ${finalExam.questions?.length || 0} preguntas. Haz clic en "Editar Examen Final" para modificar preguntas, alternativas o eliminarlo.`
                  : "Este curso aún no tiene examen final. Los estudiantes necesitan aprobarlo con mínimo 15/20 para obtener el certificado."}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsFinalExamDialogOpen(true)}
            className="shrink-0 gap-2 text-white bg-sidebar hover:bg-sidebar-accent shadow-sm"
          >
            {finalExam ? (
              <>
                <PencilIcon className="h-4 w-4" />
                Editar Examen Final
              </>
            ) : (
              <>
                <AwardIcon className="h-4 w-4" />
                Configurar Examen Final
              </>
            )}
          </Button>
        </div>
      </div>

      <CourseDialog
        course={course}
        open={isCourseDialogOpen}
        onOpenChange={setIsCourseDialogOpen}
        onSuccess={load}
      />
      <ModuleDialog
        courseId={course.id}
        open={isModuleDialogOpen}
        onOpenChange={setIsModuleDialogOpen}
        onSuccess={load}
      />

      <LessonDialog
        moduleId={selectedModuleId}
        lesson={selectedLesson}
        open={isLessonDialogOpen}
        onOpenChange={(open) => {
          setIsLessonDialogOpen(open);
          if (!open) {
            setSelectedLesson(null);
            setSelectedModuleId(null);
          }
        }}
        onSuccess={load}
      />

      <ResourceDialog
        lessonId={selectedLessonId}
        open={isResourceDialogOpen}
        onOpenChange={setIsResourceDialogOpen}
        onSuccess={load}
      />

      <QuizDialog
        lessonId={selectedLessonId}
        open={isQuizDialogOpen}
        onOpenChange={setIsQuizDialogOpen}
        onSuccess={load}
      />

      <QuestionDialog
        quizId={selectedQuizId}
        open={isQuestionDialogOpen}
        onOpenChange={setIsQuestionDialogOpen}
        onSuccess={load}
      />

      <EditQuestionDialog
        question={selectedQuestion}
        open={isEditQuestionDialogOpen}
        onOpenChange={setIsEditQuestionDialogOpen}
        onSuccess={load}
      />

      <VideoPlayerDialog
        open={isVideoDialogOpen}
        onOpenChange={setIsVideoDialogOpen}
        title={videoLesson?.title ?? ""}
        videoUrl={videoLesson?.videoUrl}
      />

      <UpdateVideoDialog
        lessonId={selectedLessonId}
        open={isUpdateVideoDialogOpen}
        onOpenChange={setIsUpdateVideoDialogOpen}
        onSuccess={load}
        currentVideoUrl={
          course?.modules
            ?.flatMap((m) => m.lessons)
            .find((l) => l.id === selectedLessonId)?.videoUrl
        }
      />

      <DocumentViewerDialog
        open={isDocumentDialogOpen}
        onOpenChange={setIsDocumentDialogOpen}
        title={selectedDocument?.title ?? "Documento"}
        url={selectedDocument?.url}
        resourceId={selectedDocument?.id}
        onSuccess={load}
      />

      {course && (
        <FinalExamDialog
          courseId={course.id}
          courseTitle={course.title}
          open={isFinalExamDialogOpen}
          onOpenChange={setIsFinalExamDialogOpen}
          onSuccess={load}
        />
      )}
    </div>
  );
}
