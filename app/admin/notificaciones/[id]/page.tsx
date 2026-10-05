"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  ClockIcon,
  GraduationCapIcon,
  UserIcon,
  MailIcon,
  AwardIcon,
  ExternalLinkIcon,
  CodeIcon,
  AlertCircleIcon,
  BookOpenIcon,
  RefreshCwIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  getNotificationById,
  markNotificationAsRead,
  NotificationItem,
} from "@/services/notifications.service";

export default function NotificacionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [notification, setNotification] = useState<NotificationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getNotificationById(resolvedParams.id)
      .then((data) => {
        if (isMounted) {
          setNotification(data);
          // Si no está leída, marcarla automáticamente al entrar
          if (!data.read) {
            markNotificationAsRead(data.id).catch(() => {});
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Error al cargar el detalle");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [resolvedParams.id]);

  const handleToggleRead = async () => {
    if (!notification) return;
    setMarking(true);
    try {
      const updated = await markNotificationAsRead(notification.id);
      setNotification(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCwIcon className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando detalle de la notificación...</p>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <AlertCircleIcon className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">No se encontró la notificación</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {error || "La notificación solicitada no existe o fue eliminada."}
        </p>
        <Button asChild variant="outline">
          <Link href="/admin/notificaciones">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver a notificaciones
          </Link>
        </Button>
      </div>
    );
  }

  const data = notification.data || {};
  const studentName = data.studentName || "Estudiante";
  const studentEmail = data.studentEmail || "No especificado";
  const courseTitle = data.courseTitle || "Curso de DeployLab";
  const score = data.score;
  const completedAt = data.completedAt || notification.createdAt;
  const isCourseCompleted = notification.type === "COURSE_COMPLETED";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Botón de regreso y encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="h-9 w-9 rounded-lg"
          >
            <Link href="/admin/notificaciones">
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">
                {notification.title}
              </h1>
              <Badge
                variant={notification.read ? "secondary" : "default"}
                className={
                  notification.read
                    ? "bg-muted text-muted-foreground"
                    : "bg-emerald-600 text-white"
                }
              >
                {notification.read ? "Leída" : "Nueva"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <ClockIcon className="h-3.5 w-3.5" />
              Recibida el{" "}
              {new Date(notification.createdAt).toLocaleString("es-ES", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleRead}
            disabled={marking}
          >
            <CheckCircle2Icon className="h-4 w-4 mr-1.5 text-emerald-600" />
            {notification.read ? "Leída" : "Marcar como leída"}
          </Button>
        </div>
      </div>

      {/* Banner Principal de Notificación */}
      <Card className="border-border/60 bg-gradient-to-br from-card via-card to-emerald-500/5 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
              <GraduationCapIcon className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Evento de Finalización
              </span>
              <p className="text-base text-foreground font-medium">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground">
                Este evento fue reportado a través del Webhook de la aplicación móvil de DeployLab.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Información Detallada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta del Curso */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BookOpenIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Detalle del Curso</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Información del curso completado por el estudiante
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="text-xs text-muted-foreground block mb-1">
                Título del Curso
              </span>
              <p className="font-semibold text-foreground text-base">
                {courseTitle}
              </p>
            </div>

            {data.courseId && (
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  ID del Curso
                </span>
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-muted-foreground">
                  {data.courseId}
                </code>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="rounded-lg border bg-muted/40 p-3">
                <span className="text-[11px] text-muted-foreground block">
                  Calificación Examen
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {score !== undefined ? score : "100%"}
                  </span>
                  <span className="text-xs text-muted-foreground">/ 20</span>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/40 p-3">
                <span className="text-[11px] text-muted-foreground block">
                  Certificado
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <AwardIcon className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-semibold text-foreground">
                    {data.certificateId ? "Emitido" : "Aprobado"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/admin/cursos">
                  <ExternalLinkIcon className="h-3.5 w-3.5 mr-1.5" />
                  Ver catálogo de cursos en Admin
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tarjeta del Estudiante */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Información del Alumno</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Datos de la cuenta que culminó el curso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 rounded-xl">
                <AvatarFallback className="rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white font-semibold">
                  {studentName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{studentName}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MailIcon className="h-3 w-3" />
                  {studentEmail}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <span className="text-xs text-muted-foreground block mb-1">
                ID de Usuario
              </span>
              <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-muted-foreground">
                {data.userId || "N/A"}
              </code>
            </div>

            <div>
              <span className="text-xs text-muted-foreground block mb-1">
                Fecha y Hora de Culminación
              </span>
              <p className="text-xs font-medium text-foreground">
                {new Date(completedAt).toLocaleString("es-ES", {
                  dateStyle: "full",
                  timeStyle: "medium",
                })}
              </p>
            </div>

            <div className="pt-2">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/admin/usuarios">
                  <ExternalLinkIcon className="h-3.5 w-3.5 mr-1.5" />
                  Ver expediente del estudiante
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tarjeta Técnica: Payload del Webhook */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CodeIcon className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold">
                Payload del Webhook (Auditoría Técnica)
              </CardTitle>
            </div>
            <Badge variant="outline" className="font-mono text-[10px]">
              event: course.completed
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Copia íntegra de los parámetros transmitidos desde React Native hacia la API de Next.js
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="rounded-lg bg-muted/60 p-4 text-xs font-mono overflow-x-auto text-foreground/90 border border-border/40">
            {JSON.stringify(
              {
                notificationId: notification.id,
                type: notification.type,
                createdAt: notification.createdAt,
                payload: data,
              },
              null,
              2,
            )}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
