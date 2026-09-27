"use client";

import React, { useState, useEffect, useCallback } from "react";
import { UsuarioDialog } from "./components/usuario-dialog";
import type { Usuario } from "./interfaces/usuario.interface";
import { getUsers, updateUserStatus } from "./services/usuarios.service";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SearchIcon,
  MoreHorizontalIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  RefreshCwIcon,
} from "lucide-react";

const LIMIT = 10;

export default function UsersPage() {
  const [data, setData] = useState<Usuario[]>([]);
  const [meta, setMeta] = useState({
    firstPage: 1,
    lastPage: 1,
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  const load = useCallback(async (p: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getUsers(p, LIMIT);
      setData(Array.isArray(res.data) ? res.data : []);
      setMeta(res.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar usuarios");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchPage = async () => {
      await Promise.resolve();
      load(page);
    };
    fetchPage();
  }, [page, load]);

  const openCreate = () => {
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const openEdit = (user: Usuario) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleToggleStatus = async (user: Usuario) => {
    try {
      await updateUserStatus(user.id, !user.isActive);
      load(page);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitSuccess = () => {
    load(page);
  };

  const filtered = search
    ? data.filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      )
    : data;

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const totalPages = meta?.totalPages ?? 1;

  const renderTableContent = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={`skeleton-${i}`}>
          <TableCell>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-3 w-48 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-8 w-8 animate-pulse rounded bg-muted" />
          </TableCell>
        </TableRow>
      ));
    }

    if (error) {
      return (
        <TableRow>
          <TableCell
            colSpan={5}
            className="h-32 text-center text-destructive"
          >
            {error}
          </TableCell>
        </TableRow>
      );
    }

    if (filtered.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-32 text-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <UserIcon className="h-8 w-8" />
              <p>No se encontraron usuarios</p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return filtered.map((user) => (
      <TableRow
        key={user.id}
        className="transition-colors hover:bg-accent/50"
      >
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-gradient-to-br from-violet-500/20 to-indigo-500/20 text-xs font-medium text-violet-600 dark:text-violet-300">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium leading-none">
                {user.name || "Sin nombre"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {user.roles && user.roles.length > 0 ? (
              user.roles.map((r) => (
                <Badge
                  key={r.id}
                  variant="secondary"
                  className="text-xs"
                >
                  {r.name}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">
                Sin rol
              </span>
            )}
          </div>
        </TableCell>
        <TableCell>
          {user.isActive ? (
            <Badge
              variant="outline"
              className="bg-emerald-500/15 text-emerald-600 border-emerald-500/25"
            >
              Activo
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-zinc-500/15 text-zinc-600 border-zinc-500/25"
            >
              Inactivo
            </Badge>
          )}
        </TableCell>
        <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
          {new Date(user.createdAt).toLocaleDateString()}
        </TableCell>
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
                onClick={() => openEdit(user)}
              >
                <PencilIcon className="h-3.5 w-3.5" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onClick={() => handleToggleStatus(user)}
              >
                <RefreshCwIcon className="h-3.5 w-3.5" />
                {user.isActive ? "Desactivar" : "Activar"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">
            Gestiona los usuarios y sus accesos al sistema.
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          <Button
            onClick={openCreate}
            className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500"
          >
            <PlusIcon className="h-4 w-4" />
            Agregar usuario
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar en esta página..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[300px]">Usuario</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden md:table-cell">Registrado</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderTableContent()}
          </TableBody>
        </Table>

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
              usuarios
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
      </div>

      <UsuarioDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        usuario={selectedUser}
        onSuccess={handleSubmitSuccess}
      />
    </div>
  );
}
