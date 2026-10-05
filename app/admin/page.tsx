"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  UsersIcon,
  BookOpenIcon,
  TrendingUpIcon,
  AwardIcon,
  RefreshCwIcon,
  StarIcon,
  ArrowRightIcon,
  FileCheckIcon,
  PieChartIcon,
  BarChart2Icon,
  CheckCircle2Icon,
} from "lucide-react";
import {
  DonutChart,
  BarChart,
  PerformanceBarList,
  type PieChartItem,
  type BarChartItem,
  type PerformanceBarItem,
} from "./components/dashboard-charts";
import {
  getReportSummary,
  getCoursesReport,
  getExamsReport,
  getCertificatesReport,
} from "./reportes/services/reports.service";
import type {
  ReportSummary,
  CourseReportItem,
  ExamReportItem,
  CertificateReportItem,
} from "./reportes/interfaces/reports.interface";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [courses, setCourses] = useState<CourseReportItem[]>([]);
  const [exams, setExams] = useState<ExamReportItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateReportItem[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, coursesRes, examsRes, certsRes] = await Promise.all([
        getReportSummary(),
        getCoursesReport(),
        getExamsReport(),
        getCertificatesReport(),
      ]);
      setSummary(sumRes);
      setCourses(coursesRes);
      setExams(examsRes);
      setCertificates(certsRes);
    } catch (err) {
      console.error("Error al cargar datos del dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Datos para Gráfico de Barras: Inscritos vs Completados (Top 6 Cursos)
  const barChartData: BarChartItem[] = courses.slice(0, 6).map((c) => ({
    label: c.title.length > 15 ? c.title.slice(0, 14) + "..." : c.title,
    value: c.enrolled,
    secondaryValue: c.completed,
  }));

  // Datos para Gráfico Circular: Distribución por Categoría de Cursos
  const categoryCounts: Record<string, number> = {};
  courses.forEach((c) => {
    const cat = c.category || "General";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoryPalette = [
    "#6366f1", // Indigo
    "#3b82f6", // Blue
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ec4899", // Pink
    "#8b5cf6", // Purple
    "#06b6d4", // Cyan
  ];

  const pieChartData: PieChartItem[] = Object.entries(categoryCounts).map(
    ([label, value], i) => ({
      label,
      value,
      color: categoryPalette[i % categoryPalette.length],
    }),
  );

  // Datos para Gráfico Circular: Aprobados vs Reprobados en Exámenes
  const totalAttempts = summary?.totalAttempts ?? 0;
  const passedAttempts = summary?.passedAttempts ?? 0;
  const failedAttempts = Math.max(0, totalAttempts - passedAttempts);

  const examDonutData: PieChartItem[] = [
    { label: "Aprobados", value: passedAttempts, color: "#10b981" },
    { label: "Reprobados", value: failedAttempts, color: "#f43f5e" },
  ];

  // Datos para Lista de Rendimiento
  const performanceItems: PerformanceBarItem[] = courses
    .slice(0, 5)
    .map((c) => ({
      title: c.title,
      value: c.completed,
      total: c.enrolled,
      percent: c.completionRate,
      color:
        c.completionRate >= 70
          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
          : c.completionRate >= 40
            ? "bg-gradient-to-r from-blue-500 to-indigo-500"
            : "bg-gradient-to-r from-amber-500 to-orange-400",
    }));

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
          <p className="text-muted-foreground">
            Resumen global de actividad, métricas académicas y rendimiento de la academia.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCwIcon
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
          <Link href="/admin/reportes">
            <Button
              size="sm"
              className="gap-2 bg-sidebar hover:bg-sidebar-accent text-white shadow-sm"
            >
              Ver Reportes Completos
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 KPIS PRINCIPALES */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Estudiantes */}
        <Card className="border-border/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Estudiantes
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <UsersIcon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "..." : summary?.totalUsers ?? 0}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium"
              >
                {summary?.activeUsers ?? 0} activos
              </Badge>
              <span className="text-muted-foreground">en la plataforma</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Cursos Activos */}
        <Card className="border-border/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cursos Disponibles
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
              <BookOpenIcon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "..." : summary?.totalCourses ?? 0}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="font-medium text-foreground">
                {summary?.totalEnrollments ?? 0}
              </span>
              <span className="text-muted-foreground">inscripciones totales</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Tasa de Finalización */}
        <Card className="border-border/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tasa de Finalización
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <TrendingUpIcon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "..." : `${summary?.completionRate ?? 0}%`}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium"
              >
                {summary?.completedEnrollments ?? 0} graduados
              </Badge>
              <span className="text-muted-foreground">de cursos</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Certificados */}
        <Card className="border-border/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Certificados Emitidos
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <AwardIcon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "..." : summary?.totalCertificates ?? 0}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <Badge
                variant="outline"
                className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 font-medium"
              >
                {summary?.passRate ?? 0}% aprobación
              </Badge>
              <span className="text-muted-foreground">en exámenes</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN PRINCIPAL DE GRÁFICOS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        {/* GRÁFICO DE BARRAS: Inscritos vs Completados (ocupa 4 de 7 columnas) */}
        <Card className="border-border/60 shadow-sm lg:col-span-4 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart2Icon className="h-5 w-5 text-indigo-500" />
                  Inscripciones vs Completados por Curso
                </CardTitle>
                <CardDescription>
                  Comparativa de estudiantes matriculados vs cursos culminados.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {loading ? (
              <div className="flex h-[240px] items-center justify-center text-muted-foreground text-sm">
                Cargando gráfico...
              </div>
            ) : (
              <BarChart
                data={barChartData}
                primaryLabel="Inscritos"
                secondaryLabel="Completados"
                height={260}
              />
            )}
          </CardContent>
        </Card>

        {/* GRÁFICO CIRCULAR / PIE: Distribución por Categoría (ocupa 3 de 7 columnas) */}
        <Card className="border-border/60 shadow-sm lg:col-span-3 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-purple-500" />
              Cursos por Categoría
            </CardTitle>
            <CardDescription>
              Distribución de la oferta académica por área de conocimiento.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center pb-6">
            {loading ? (
              <div className="flex h-[240px] items-center justify-center text-muted-foreground text-sm">
                Cargando gráfico...
              </div>
            ) : (
              <DonutChart
                data={pieChartData}
                centerLabel="Cursos"
                centerValue={courses.length}
                size={210}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN SECUNDARIA: Exámenes, Rendimiento y Certificados Recientes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Gráfico Donut de Evaluaciones */}
        <Card className="border-border/60 shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileCheckIcon className="h-4 w-4 text-emerald-500" />
              Efectividad de Evaluaciones
            </CardTitle>
            <CardDescription>
              Tasa global de aprobación en exámenes finales ({totalAttempts} intentos).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center pb-6">
            {loading ? (
              <div className="py-12 text-sm text-muted-foreground">Cargando...</div>
            ) : totalAttempts === 0 ? (
              <div className="py-12 text-sm text-muted-foreground text-center">
                Sin intentos de examen registrados
              </div>
            ) : (
              <DonutChart
                data={examDonutData}
                centerLabel="Aprobación"
                centerValue={`${summary?.passRate ?? 0}%`}
                size={180}
              />
            )}
          </CardContent>
        </Card>

        {/* Barras de Rendimiento de Cursos */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUpIcon className="h-4 w-4 text-blue-500" />
              Tasa de Culminación por Curso
            </CardTitle>
            <CardDescription>
              Porcentaje de avance y retención por curso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-sm text-muted-foreground text-center">
                Cargando progreso...
              </div>
            ) : (
              <PerformanceBarList items={performanceItems} />
            )}
          </CardContent>
        </Card>

        {/* Últimos Certificados Emitidos */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <AwardIcon className="h-4 w-4 text-amber-500" />
                Graduados Recientes
              </CardTitle>
              <CardDescription>Últimos certificados oficiales emitidos.</CardDescription>
            </div>
            <Link
              href="/admin/reportes"
              className="text-xs text-primary hover:underline font-medium"
            >
              Ver todos
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-sm text-muted-foreground text-center">
                Cargando...
              </div>
            ) : certificates.length === 0 ? (
              <div className="py-12 text-sm text-muted-foreground text-center">
                Aún no se han emitido certificados
              </div>
            ) : (
              <div className="space-y-3.5">
                {certificates.slice(0, 4).map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between gap-3 text-xs border-b border-border/40 pb-2.5 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Avatar className="h-7 w-7 text-xs">
                        <AvatarFallback className="bg-sidebar/10 text-sidebar font-semibold">
                          {cert.studentName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="truncate">
                        <p className="font-semibold text-foreground truncate">
                          {cert.studentName}
                        </p>
                        <p className="text-muted-foreground truncate text-[11px]">
                          {cert.courseTitle}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-700 font-bold shrink-0">
                      {cert.score} pts
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
