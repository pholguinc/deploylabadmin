const fs = require('fs');

const content = `"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCourseById } from "../services/courses.service";
import {
  deleteResource,
  deleteQuiz,
  deleteQuestion,
} from "../services/lessons.service";
import type { Course, Question, CourseModule, Lesson, Quiz, Resource } from "../interfaces/course.interface";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeftIcon,
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
} from "lucide-react";
import { ModuleDialog } from "../components/module-dialog";
import { LessonDialog } from "../components/lesson-dialog";
import { ResourceDialog } from "../components/resource-dialog";
import { QuizDialog } from "../components/quiz-dialog";
import { QuestionDialog } from "../components/question-dialog";
import { EditQuestionDialog } from "../components/edit-question-dialog";
import { VideoPlayerDialog } from "../components/video-player-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const renderIconForLessonType = (type: string) => {
  switch (type.toUpperCase()) {
    case "VIDEO":
      return <VideoIcon className="h-4 w-4 text-violet-500" />;
    case "PDF":
      return <FileTextIcon className="h-4 w-4 text-rose-500" />;
    case "QUIZ":
      return <HelpCircleIcon className="h-4 w-4 text-amber-500" />;
    default:
      return <PlayCircleIcon className="h-4 w-4 text-indigo-500" />;
  }
};

const QuestionItem = ({ q, qIndex, setSelectedQuestion, setIsEditQuestionDialogOpen, load }: any) => (
  <div className="group/question">
    <div className="flex items-start justify-between text-xs text-muted-foreground hover:text-foreground transition-colors py-0.5 rounded px-1 hover:bg-muted/30">
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">
          {qIndex + 1}. {q.text}
        </span>
        <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
          {q.options.find((o: any) => o.isCorrect)?.text}
          <CheckCircleIcon className="h-3 w-3 text-emerald-500" />
        </span>
      </div>
      <div className="flex items-center opacity-0 group-hover/question:opacity-100 transition-opacity shrink-0 ml-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-muted-foreground hover:text-violet-600"
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

const QuizItem = ({ quiz, setSelectedQuizId, setIsQuestionDialogOpen, load, setSelectedQuestion, setIsEditQuestionDialogOpen }: any) => (
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
          className="h-6 w-6 text-muted-foreground hover:text-violet-600 shrink-0"
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
        {quiz.questions.map((q: any, qIndex: number) => (
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

const ResourceItem = ({ res, load }: any) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground pl-1 py-0.5 rounded hover:bg-muted/30 transition-colors group/res">
    <PaperclipIcon className="h-3.5 w-3.5 text-blue-500 shrink-0" />
    <a
      href={res.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-blue-600 hover:underline transition-colors truncate"
    >
      {res.name}
    </a>
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
      onClick={async () => {
        if (confirm("¿Eliminar este recurso?")) {
          try {
            await deleteResource(res.id);
            load();
          } catch {}
        }
      }}
    >
      <Trash2Icon className="h-3.5 w-3.5" />
    </Button>
  </div>
);

const LessonItem = ({ lesson, lIndex, setVideoLesson, setIsVideoDialogOpen, setSelectedLessonId, setIsResourceDialogOpen, setIsQuizDialogOpen, setSelectedQuizId, setIsQuestionDialogOpen, setSelectedQuestion, setIsEditQuestionDialogOpen, load }: any) => (
  <div className="flex flex-col p-4 px-6 transition-colors hover:bg-muted/10">
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30 transition-transform group-hover:scale-110">
          {renderIconForLessonType(lesson.type)}
        </div>
        <div>
          <button
            type="button"
            className="font-medium text-foreground transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400 cursor-pointer hover:underline text-left"
            onClick={() => {
              setVideoLesson({
                title: lesson.title,
                videoUrl: lesson.videoUrl,
              });
              setIsVideoDialogOpen(true);
            }}
          >
            {lesson.order || lIndex + 1}. {lesson.title}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
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
                setSelectedLessonId(lesson.id);
                setIsQuizDialogOpen(true);
              }}
            >
              <HelpCircleIcon className="mr-2 h-4 w-4" />
              Agregar Examen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div className="ml-12 mt-3 space-y-3 border-l-2 border-border/50 pl-4">
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
          <PaperclipIcon className="h-3 w-3" />
          Recursos
          <span className="ml-1 text-[10px] font-normal">
            ({lesson.resources?.length || 0})
          </span>
        </p>
        {lesson.resources && lesson.resources.length > 0 ? (
          lesson.resources.map((res: any) => (
            <ResourceItem key={res.id} res={res} load={load} />
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
          lesson.quizzes.map((quiz: any) => (
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
  </div>
);

const ModuleItem = ({ module, mIndex, setSelectedModuleId, setIsLessonDialogOpen, ...lessonProps }: any) => (
  <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between border-b border-border/50 bg-muted/40 p-5 backdrop-blur-sm">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold tracking-wider text-violet-600 dark:text-violet-400 uppercase">
          Módulo {module.order || mIndex + 1}
        </span>
        <h4 className="text-lg font-semibold text-foreground">
          {module.title}
        </h4>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="bg-background/50">
          {module.lessons?.length || 0} lecciones
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-xs text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400"
          onClick={() => {
            setSelectedModuleId(module.id);
            setIsLessonDialogOpen(true);
          }}
        >
          <PlusCircleIcon className="h-3.5 w-3.5" />
          Lección
        </Button>
      </div>
    </div>
    <div className="divide-y divide-border/50 bg-card">
      {module.lessons && module.lessons.length > 0 ? (
        module.lessons.map((lesson: any, lIndex: number) => (
          <LessonItem key={lesson.id} lesson={lesson} lIndex={lIndex} {...lessonProps} />
        ))
      ) : (
        <div className="p-6 text-center text-sm text-muted-foreground">
          No hay lecciones en este módulo.
        </div>
      )}
    </div>
  </div>
);

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isEditQuestionDialogOpen, setIsEditQuestionDialogOpen] =
    useState(false);

  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null,
  );

  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [videoLesson, setVideoLesson] = useState<{
    title: string;
    videoUrl: string | null | undefined;
  } | null>(null);

  const load = async () => {
    try {
      const data = await getCourseById(courseId);
      setCourse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el curso");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      load();
    }
  }, [courseId]);

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
    setIsResourceDialogOpen,
    setIsQuizDialogOpen,
    setSelectedQuizId,
    setIsQuestionDialogOpen,
    setSelectedQuestion,
    setIsEditQuestionDialogOpen,
    load
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="h-10 w-10 shrink-0 rounded-full transition-colors hover:bg-violet-500/10 hover:text-violet-600"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Detalle del curso
          </h1>
          <p className="text-sm text-muted-foreground">
            Visualiza la información y el contenido del curso
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card shadow-sm">
        <div className="absolute inset-0 z-0 opacity-10 blur-3xl">
          <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-violet-500" />
          <div className="absolute -bottom-10 right-10 h-64 w-64 rounded-full bg-indigo-500" />
        </div>

        <div className="relative z-10 grid gap-8 p-8 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_400px]">
          {/* Info */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              {course.category && (
                <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 font-medium text-white shadow-sm border-none">
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
                  {course.lessonsCount}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <StarIcon className="h-3 w-3" /> Calificación
                </p>
                <p className="font-semibold text-foreground">
                  {course.rating.toFixed(1)} / 5
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon className="h-3 w-3" /> Instructor
                </p>
                <p className="font-semibold text-foreground truncate">
                  {course.instructor || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-xl shadow-black/5 ring-1 ring-black/5 dark:ring-white/5 md:aspect-auto md:h-full">
            {course.imageUrl ? (
              <img
                src={course.imageUrl}
                alt={course.title}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-violet-50 dark:bg-violet-950/30">
                <BookOpenIcon className="mb-2 h-16 w-16 text-violet-300 dark:text-violet-700" />
                <span className="text-sm font-medium text-violet-400 dark:text-violet-600">
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
              <ListIcon className="h-6 w-6 text-violet-500" />
              Contenido del Curso
            </h3>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {course.modules?.length || 0} módulos
            </Badge>
          </div>
          <Button
            size="sm"
            className="gap-2 bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-900/50"
            onClick={() => setIsModuleDialogOpen(true)}
          >
            <PlusIcon className="h-4 w-4" />
            Agregar Módulo
          </Button>
        </div>

        {course.modules && course.modules.length > 0 ? (
          <div className="space-y-4">
            {course.modules.map((module, mIndex) => (
              <ModuleItem 
                key={module.id} 
                module={module} 
                mIndex={mIndex} 
                setSelectedModuleId={setSelectedModuleId}
                setIsLessonDialogOpen={setIsLessonDialogOpen}
                {...lessonProps}
              />
            ))}
          </div>
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
      </div>

      <ModuleDialog
        courseId={course.id}
        open={isModuleDialogOpen}
        onOpenChange={setIsModuleDialogOpen}
        onSuccess={load}
      />

      <LessonDialog
        moduleId={selectedModuleId}
        open={isLessonDialogOpen}
        onOpenChange={setIsLessonDialogOpen}
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
    </div>
  );
}
`;

fs.writeFileSync('app/admin/cursos/[id]/page.tsx', content);
