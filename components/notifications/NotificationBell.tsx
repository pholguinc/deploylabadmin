"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BellIcon,
  CheckCheckIcon,
  GraduationCapIcon,
  SparklesIcon,
  ChevronRightIcon,
  CheckCircle2Icon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NotificationItem,
} from "@/services/notifications.service";

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return "Hace un momento";
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} d`;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = useCallback(async () => {
    try {
      const data = await getNotifications({ limit: 10 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      // Silencioso en caso de conexión temporalmente inaccesible
    }
  }, []);

  // Polling automático cada 12 segundos para recibir eventos webhook en tiempo real
  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 12000);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoading(true);
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNotification = async (item: NotificationItem) => {
    if (!item.read) {
      markNotificationAsRead(item.id).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setIsOpen(false);
    router.push(`/admin/notificaciones/${item.id}`);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Notificaciones"
        >
          <BellIcon className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex items-center justify-center rounded-full h-4 min-w-4 px-1 bg-rose-600 text-[10px] font-bold text-white shadow-sm">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 p-0 shadow-2xl border-border/80 rounded-xl overflow-hidden backdrop-blur-md bg-card/95"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Notificaciones</span>
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary hover:bg-primary/20 text-xs px-2 py-0.5"
              >
                {unreadCount} nuevas
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={loading}
              className="h-7 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <CheckCheckIcon className="h-3.5 w-3.5" />
              <span>Marcar todo</span>
            </Button>
          )}
        </div>

        {/* Lista de notificaciones */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2 text-muted-foreground">
                <CheckCircle2Icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">Sin notificaciones pendientes</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
                Cuando un estudiante complete un curso en la app móvil, aparecerá aquí al instante.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const isCourse = item.type === "COURSE_COMPLETED";
              const student = item.data?.studentName;
              const courseTitle = item.data?.courseTitle;
              const score = item.data?.score;

              return (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => handleSelectNotification(item)}
                  className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors focus:bg-accent/60 ${
                    !item.read
                      ? "bg-primary/5 hover:bg-primary/10"
                      : "hover:bg-muted/60"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isCourse
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-primary/10 text-primary border border-primary/20"
                    }`}
                  >
                    {isCourse ? (
                      <GraduationCapIcon className="h-4 w-4" />
                    ) : (
                      <SparklesIcon className="h-4 w-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {student && courseTitle ? (
                        <>
                          <strong className="font-medium text-foreground">
                            {student}
                          </strong>{" "}
                          finalizó{" "}
                          <span className="italic text-foreground/90">
                            &quot;{courseTitle}&quot;
                          </span>
                        </>
                      ) : (
                        item.message
                      )}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5">
                      {score !== undefined && (
                        <span className="inline-flex items-center text-[10px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                          Nota: {score}/20
                        </span>
                      )}
                      {!item.read && (
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>

                  <ChevronRightIcon className="h-4 w-4 text-muted-foreground/50 shrink-0 self-center" />
                </DropdownMenuItem>
              );
            })
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />

        {/* Pie de modal */}
        <div className="p-2 bg-muted/20 text-center">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="w-full text-xs font-medium text-primary hover:text-primary justify-center h-8"
          >
            <Link
              href="/admin/notificaciones"
              onClick={() => setIsOpen(false)}
            >
              Ver centro de notificaciones
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
