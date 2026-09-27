"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
  RefreshCwIcon,
  AlertCircleIcon,
  BookOpenIcon,
  ClockIcon,
  StarIcon,
  EyeIcon,
} from "lucide-react";
import {
  getCourses,
  deleteCourse,
} from "./services/courses.service";
import type {
  Course,
  PaginationMeta,
} from "./interfaces/course.interface";
import { CourseDialog } from "./components/course-dialog";

const LIMIT = 8;

export default function CursosPage() {
  const [data, setData] = useState<Course[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const load = useCallback(async (p: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getCourses(p, LIMIT);
      setData(Array.isArray(res.data) ? res.data : []);
      setMeta(res.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar cursos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    queueMicrotask(() => {
      if (mounted) {
        load(page);
      }
    });
    return () => {
      mounted = false;
    };
  }, [page, load]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este curso?")) return;
    try {
      await deleteCourse(id);
      load(page);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al eliminar");
    }
  };

  const filtered = search
    ? data.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
    : data;

  const totalPages = meta?.totalPages ?? 1;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm"
            >
              <div className="h-40 w-full animate-pulse bg-muted" />
              <div className="p-4 space-y-4">
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="flex gap-2">
                  <div className="h-4 w-16 animate-pulse rounded-full bg-muted" />
                  <div className="h-4 w-16 animate-pulse rounded-full bg-muted" />
                </div>
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircleIcon className="h-4 w-4 shrink-0" />
          {error}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 text-destructive hover:text-destructive"
            onClick={() => load(page)}
          >
            Reintentar
          </Button>
        </div>
      );
    }

    if (filtered.length === 0) {
      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-border/50 bg-card p-8 text-center text-muted-foreground shadow-sm">
          <BookOpenIcon className="mb-4 h-12 w-12 opacity-20" />
          <h3 className="text-lg font-medium text-foreground">
            No se encontraron cursos
          </h3>
          <p className="mt-1">
            Intenta con otra búsqueda o agrega un nuevo curso.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((course) => (
          <div
            key={course.id}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="absolute right-3 top-3 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-black/40 text-white backdrop-blur hover:bg-black/60"
                  >
                    <MoreHorizontalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2" asChild>
                    <Link href={`/admin/cursos/${course.id}`}>
                      <EyeIcon className="h-3.5 w-3.5" />
                      Ver detalle
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <PencilIcon className="h-3.5 w-3.5" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 text-destructive"
                    onClick={() => handleDelete(course.id)}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              {course.imageUrl ? (
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-violet-100 dark:bg-violet-900/20">
                  <BookOpenIcon className="h-10 w-10 text-violet-500/50" />
                </div>
              )}
              {!course.isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <Badge variant="outline" className="text-white border-white/20">Inactivo</Badge>
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col p-5">
              <div className="mb-3 flex flex-wrap gap-2">
                {course.category && (
                  <Badge variant="secondary" className="bg-violet-500/10 text-violet-600 hover:bg-violet-500/20">
                    {course.category}
                  </Badge>
                )}
                {course.level && (
                  <Badge variant="outline" className="text-muted-foreground">
                    {course.level}
                  </Badge>
                )}
              </div>

              <Link href={`/admin/cursos/${course.id}`}>
                <h3 className="mb-2 font-semibold leading-tight text-foreground line-clamp-2 hover:text-violet-500 transition-colors">
                  {course.title}
                </h3>
              </Link>
              
              <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                {course.description || "Sin descripción"}
              </p>

              <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-4">
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="h-3.5 w-3.5" />
                  <span>{course.duration || "N/A"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpenIcon className="h-3.5 w-3.5" />
                  <span>{course.lessonsCount} lecc.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <StarIcon className="h-3.5 w-3.5 text-amber-500" />
                  <span>{course.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Cursos</h1>
          <p className="text-muted-foreground">
            Gestiona los cursos y su contenido.
          </p>
        </div>
        <Button 
          className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500"
          onClick={() => setIsDialogOpen(true)}
        >
          <PlusIcon className="h-4 w-4" />
          Nuevo curso
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar curso..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => load(page)}
          disabled={isLoading}
        >
          <RefreshCwIcon
            className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/50 pt-4">
          <p className="text-sm text-muted-foreground">
            Página{" "}
            <span className="font-medium text-foreground">
              {meta.currentPage}
            </span>{" "}
            de{" "}
            <span className="font-medium text-foreground">
              {meta.totalPages}
            </span>{" "}
            —{" "}
            <span className="font-medium text-foreground">
              {meta.totalItems}
            </span>{" "}
            cursos
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
              )
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-1 text-muted-foreground">…</span>
                  )}
                  <Button
                    variant={page === p ? "default" : "outline"}
                    size="icon"
                    className={`h-8 w-8 ${
                      page === p
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                        : ""
                    }`}
                    disabled={isLoading}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                </React.Fragment>
              ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <CourseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => load(page)}
      />
    </div>
  );
}
