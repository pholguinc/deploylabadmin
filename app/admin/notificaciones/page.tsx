"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  BellIcon,
  CheckCheckIcon,
  FilterIcon,
  GraduationCapIcon,
  SearchIcon,
  SparklesIcon,
  RefreshCwIcon,
  ChevronRightIcon,
  RadioTowerIcon,
  CheckCircle2Icon,
  PlusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  triggerTestCourseCompletedWebhook,
  NotificationItem,
} from "@/services/notifications.service";

export default function NotificacionesPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "courses">("all");
  const [simulating, setSimulating] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotifications({ limit: 50 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  const handleSimulateWebhook = async () => {
    setSimulating(true);
    try {
      await triggerTestCourseCompletedWebhook();
      await fetchNotifs();
    } catch (e) {
      console.error("Error al simular webhook:", e);
    } finally {
      setSimulating(false);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingAll(false);
    }
  };

  const filtered = notifications.filter((item) => {
    if (activeFilter === "unread" && item.read) return false;
    if (activeFilter === "courses" && item.type !== "COURSE_COMPLETED") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchMessage = item.message?.toLowerCase().includes(q);
      const matchStudent = item.data?.studentName?.toLowerCase().includes(q);
      const matchCourse = item.data?.courseTitle?.toLowerCase().includes(q);
      return matchTitle || matchMessage || matchStudent || matchCourse;
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Centro de Notificaciones
            </h1>
            {unreadCount > 0 && (
              <Badge className="bg-rose-600 text-white hover:bg-rose-700">
                {unreadCount} sin leer
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Registro en tiempo real de eventos generados por Webhooks cuando los alumnos finalizan cursos en la app móvil.
          </p>
        </div>

        {/* Acciones de cabecera */}
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleSimulateWebhook}
            disabled={simulating}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            {simulating ? (
              <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RadioTowerIcon className="h-4 w-4 mr-2" />
            )}
            Simular Webhook Móvil
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markingAll}
            >
              <CheckCheckIcon className="h-4 w-4 mr-1.5" />
              Marcar todas
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={fetchNotifs}
            disabled={loading}
            className="h-9 w-9"
            title="Refrescar notificaciones"
          >
            <RefreshCwIcon
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por estudiante, curso o mensaje..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card border-border/80"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeFilter === "all"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Todas ({notifications.length})
          </button>
          <button
            onClick={() => setActiveFilter("unread")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeFilter === "unread"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            No leídas ({unreadCount})
          </button>
          <button
            onClick={() => setActiveFilter("courses")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeFilter === "courses"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Cursos completados
          </button>
        </div>
      </div>

      {/* Lista de Notificaciones */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCwIcon className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Cargando eventos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-border/60 py-16 text-center">
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground">
              <CheckCircle2Icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-base mb-1">
              No hay notificaciones para mostrar
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mb-4">
              Puedes hacer clic en el botón &quot;Simular Webhook Móvil&quot; para enviar un evento de prueba simulando la culminación de un curso en React Native.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSimulateWebhook}
              disabled={simulating}
            >
              <RadioTowerIcon className="h-4 w-4 mr-2 text-emerald-600" />
              Disparar Webhook de Prueba
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isCourse = item.type === "COURSE_COMPLETED";
            const data = item.data || {};
            const student = data.studentName;
            const courseTitle = data.courseTitle;
            const score = data.score;

            return (
              <Card
                key={item.id}
                className={`transition-all hover:border-primary/40 hover:shadow-md cursor-pointer ${
                  !item.read
                    ? "bg-primary/[0.03] border-primary/30"
                    : "border-border/60 bg-card"
                }`}
              >
                <CardContent className="p-4 sm:p-5">
                  <Link
                    href={`/admin/notificaciones/${item.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          isCourse
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-primary/10 text-primary border border-primary/20"
                        }`}
                      >
                        {isCourse ? (
                          <GraduationCapIcon className="h-5 w-5" />
                        ) : (
                          <SparklesIcon className="h-5 w-5" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground">
                            {item.title}
                          </span>
                          {!item.read && (
                            <Badge
                              variant="default"
                              className="bg-emerald-600 text-[10px] px-1.5 py-0 text-white"
                            >
                              Nuevo
                            </Badge>
                          )}
                          <span className="text-[11px] text-muted-foreground">
                            •{" "}
                            {new Date(item.createdAt).toLocaleString("es-ES", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {student && courseTitle ? (
                            <>
                              El alumno{" "}
                              <strong className="text-foreground font-medium">
                                {student}
                              </strong>{" "}
                              completó el curso{" "}
                              <span className="italic font-medium text-foreground">
                                &quot;{courseTitle}&quot;
                              </span>
                              .
                            </>
                          ) : (
                            item.message
                          )}
                        </p>

                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          {score !== undefined && (
                            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900">
                              Calificación: {score} / 20
                            </span>
                          )}
                          {data.certificateId && (
                            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900">
                              Certificado Generado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-primary hover:text-primary flex items-center gap-1"
                      >
                        <span>Ver detalle</span>
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
