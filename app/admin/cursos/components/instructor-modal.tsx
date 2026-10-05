import { useState, useEffect, Fragment } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getUsers } from "../../usuarios/services/usuarios.service";
import type { Usuario } from "../../usuarios/interfaces/usuario.interface";
import { Loader2, UserIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface InstructorModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSelect: (userId: string, userName: string) => void;
  readonly selectedInstructorId: string;
}

export function InstructorModal({
  open,
  onOpenChange,
  onSelect,
  selectedInstructorId,
}: InstructorModalProps) {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tempSelected, setTempSelected] = useState<{id: string, name: string} | null>(null);

  const fetchUsers = async (pageNumber: number) => {
    setIsLoading(true);
    try {
      const data = await getUsers(pageNumber, 10, "DOCENTE");
      setUsers(data.data);
      setTotalPages(data.meta.totalPages);
      setPage(pageNumber);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      const timeoutId = setTimeout(() => {
        void fetchUsers(1);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [open]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTempSelected(null);
    }
    onOpenChange(isOpen);
  };

  const handleConfirm = () => {
    if (tempSelected) {
      onSelect(tempSelected.id, tempSelected.name);
    }
    handleOpenChange(false);
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={2} className="p-8 text-center">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </td>
        </tr>
      );
    }

    if (users.length === 0) {
      return (
        <tr>
          <td colSpan={2} className="p-8 text-center text-muted-foreground">
            No se encontraron usuarios con rol DOCENTE.
          </td>
        </tr>
      );
    }

    return users.map((user) => {
      const isChecked = tempSelected?.id === user.id || (!tempSelected && selectedInstructorId === user.id);
      return (
        <tr key={user.id} className="border-b hover:bg-muted/30 transition-colors">
          <td className="p-4">
            <Checkbox 
              checked={isChecked}
              onCheckedChange={(checked) => {
                if (checked) {
                  setTempSelected({ id: user.id, name: `${user.name} ${user.lastname || ''}`.trim() });
                } else {
                  setTempSelected(null);
                }
              }}
            />
          </td>
          <td className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sidebar/10 text-sidebar font-semibold">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{user.name} {user.lastname}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
              <UserIcon className="h-4 w-4 text-white" />
            </div>
            Seleccionar Instructor
          </DialogTitle>
          <DialogDescription>
            Busca y selecciona al instructor para asignar a este curso.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
            <div className="rounded-md border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left w-12"></th>
                    <th className="p-4 text-left font-medium text-muted-foreground">Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {renderTableContent()}
                </tbody>
              </table>

              <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Página{" "}
                  <span className="font-medium text-foreground">
                    {page}
                  </span>{" "}
                  de{" "}
                  <span className="font-medium text-foreground">
                    {totalPages || 1}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => fetchUsers(page - 1)}
                    disabled={page <= 1 || isLoading}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                    )
                    .map((p, idx, arr) => (
                      <Fragment key={p}>
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
                          onClick={() => fetchUsers(p)}
                        >
                          {p}
                        </Button>
                      </Fragment>
                    ))}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => fetchUsers(page + 1)}
                    disabled={page >= totalPages || isLoading}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!tempSelected && !selectedInstructorId}>
            Confirmar Selección
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
