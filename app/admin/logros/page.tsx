"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  TrophyIcon,
  RefreshCwIcon,
  AlertCircleIcon,
  Loader2Icon,
  CheckCircle2Icon,
  XCircleIcon,
} from "lucide-react";
import {
  getAchievements,
  deleteAchievement,
} from "./services/achievements.service";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import type {
  Achievement,
  AchievementFormData,
  PaginationMeta,
} from "./interfaces/achievement.interface";
import { LogroDialog } from "./components/logro-dialog";

const LIMIT = 10;

export default function LogrosPage() {
  const [data, setData] = useState<Achievement[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLogro, setSelectedLogro] = useState<Achievement | null>(null);

  const load = useCallback(async (p: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAchievements(p, LIMIT);
      setData(Array.isArray(res.data) ? res.data : []);
      setMeta(res.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar logros");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetch = async () => {
      await load(page);
    };
    fetch();
  }, [page, load]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este logro?")) return;
    try {
      await deleteAchievement(id);
      load(page);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al eliminar");
    }
  };

  const openCreate = () => {
    setSelectedLogro(null);
    setDialogOpen(true);
  };

  const openEdit = (logro: Achievement) => {
    setSelectedLogro(logro);
    setDialogOpen(true);
  };

  const handleSubmitSuccess = () => {
    load(page);
  };

  // Client-side search filter (sobre los datos ya cargados)
  const filtered = search
    ? data.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()))
    : data;

  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Logros</h1>
          <p className="text-muted-foreground">
            Gestiona los logros y su configuración.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-2 bg-sidebar hover:bg-sidebar-accent text-white shadow-sm"
        >
          <PlusIcon className="h-4 w-4" />
          Nuevo logro
        </Button>
      </div>

      {/* Stats */}
      {meta && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              label: "Total logros",
              value: meta.totalItems,
              color: "from-violet-500 to-indigo-500",
            },
            {
              label: "Activos",
              value: data.filter((l) => l.estado).length,
              color: "from-emerald-500 to-teal-500",
            },
            {
              label: "Inactivos",
              value: data.filter((l) => !l.estado).length,
              color: "from-zinc-400 to-zinc-500",
            },
            {
              label: "Esta página",
              value: data.length,
              color: "from-blue-500 to-cyan-500",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="admin-card-enter rounded-xl border border-border/50 bg-card p-4"
            >
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-2xl font-bold">{s.value}</p>
              <div
                className={`mt-2 h-1 w-12 rounded-full bg-gradient-to-r ${s.color}`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar logro..."
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

      {/* Table */}
      <div className="rounded-xl border border-border/50 bg-card">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-t-xl border-b border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
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
        )}

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 text-center">Orden</TableHead>
              <TableHead className="w-12 text-center">Ícono</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden md:table-cell">Creado</TableHead>
              <TableHead className="hidden lg:table-cell">
                Actualizado
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton rows
              Array.from({ length: LIMIT }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                  <TableCell />
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <TrophyIcon className="h-8 w-8" />
                    <p>No se encontraron logros</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((logro) => (
                <TableRow
                  key={logro.id}
                  className="transition-colors hover:bg-accent/50"
                >
                  {/* Orden */}
                  <TableCell className="text-center">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
                      {logro.orden}
                    </span>
                  </TableCell>

                  {/* Ícono */}
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl shadow-sm"
                        style={{ backgroundColor: logro.color ?? "#6366f1" }}
                      >
                        <DynamicIcon
                          name={logro.icon ?? ""}
                          className="h-4 w-4 text-white"
                          fallback={
                            <span className="text-base text-white">{logro.icon ?? "🏅"}</span>
                          }
                        />
                      </div>
                    </div>
                  </TableCell>

                  {/* Nombre */}
                  <TableCell>
                    <span className="font-medium">{logro.name}</span>
                  </TableCell>

                  {/* Estado */}
                  <TableCell>
                    {logro.estado ? (
                      <Badge
                        variant="outline"
                        className="gap-1 border-emerald-500/25 bg-emerald-500/10 text-emerald-600"
                      >
                        <CheckCircle2Icon className="h-3 w-3" />
                        Activo
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="gap-1 border-zinc-400/25 bg-zinc-400/10 text-zinc-500"
                      >
                        <XCircleIcon className="h-3 w-3" />
                        Inactivo
                      </Badge>
                    )}
                  </TableCell>

                  {/* Creado */}
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {new Date(logro.createdAt).toLocaleDateString("es-MX")}
                  </TableCell>

                  {/* Actualizado */}
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {new Date(logro.updatedAt).toLocaleDateString("es-MX")}
                  </TableCell>

                  {/* Acciones */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => openEdit(logro)}
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-2 text-destructive"
                          onClick={() => handleDelete(logro.id)}
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {meta && (
          <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
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
              logros
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
                          ? "bg-sidebar hover:bg-sidebar-accent text-white"
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
      </div>

      {/* Dialog */}
      <LogroDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        logro={selectedLogro}
        onSuccess={handleSubmitSuccess}
      />
    </div>
  );
}
