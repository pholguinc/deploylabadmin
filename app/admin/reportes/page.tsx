"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  BarChart3Icon,
  BookOpenIcon,
  GraduationCapIcon,
  AwardIcon,
  FileCheckIcon,
  RefreshCwIcon,
  DownloadIcon,
  SearchIcon,
  CheckCircle2Icon,
  XCircleIcon,
  TrendingUpIcon,
  UsersIcon,
  StarIcon,
} from "lucide-react";
import {
  getReportSummary,
  getCoursesReport,
  getExamsReport,
  getCertificatesReport,
  getStudentsProgressReport,
} from "./services/reports.service";
import type {
  ReportSummary,
  CourseReportItem,
  ExamReportItem,
  CertificateReportItem,
  StudentProgressReportItem,
} from "./interfaces/reports.interface";

type TabType = "cursos" | "examenes" | "certificados" | "estudiantes";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("cursos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [courses, setCourses] = useState<CourseReportItem[]>([]);
  const [exams, setExams] = useState<ExamReportItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateReportItem[]>([]);
  const [students, setStudents] = useState<StudentProgressReportItem[]>([]);

  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, coursesRes, examsRes, certsRes, studentsRes] =
        await Promise.all([
          getReportSummary(),
          getCoursesReport(),
          getExamsReport(),
          getCertificatesReport(),
          getStudentsProgressReport(),
        ]);
      setSummary(sumRes);
      setCourses(coursesRes);
      setExams(examsRes);
      setCertificates(certsRes);
      setStudents(studentsRes);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar los reportes",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Exportar a CSV según la pestaña activa
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `reporte-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`;

    if (activeTab === "cursos") {
      headers = [
        "ID",
        "Título",
        "Categoría",
        "Nivel",
        "Instructor",
        "Inscritos",
        "Completados",
        "% Finalización",
        "Progreso Promedio",
        "Certificados Emitidos",
        "Calificación Promedio",
      ];
      rows = courses.map((c) => [
        c.id,
        `"${c.title.replace(/"/g, '""')}"`,
        c.category,
        c.level,
        `"${c.instructor.replace(/"/g, '""')}"`,
        c.enrolled,
        c.completed,
        `${c.completionRate}%`,
        `${c.avgProgress}%`,
        c.certificatesIssued,
        c.avgRating,
      ]);
    } else if (activeTab === "examenes") {
      headers = [
        "ID",
        "Curso",
        "Examen",
        "Total Intentos",
        "Aprobados",
        "Reprobados",
        "% Aprobación",
        "Nota Promedio",
      ];
      rows = exams.map((e) => [
        e.id,
        `"${e.courseTitle.replace(/"/g, '""')}"`,
        `"${e.title.replace(/"/g, '""')}"`,
        e.totalAttempts,
        e.passedAttempts,
        e.failedAttempts,
        `${e.passRate}%`,
        e.avgScore,
      ]);
    } else if (activeTab === "certificados") {
      headers = [
        "Código Certificado",
        "Estudiante",
        "Correo",
        "Curso",
        "Calificación",
        "Fecha de Emisión",
      ];
      rows = certificates.map((cert) => [
        cert.id,
        `"${cert.studentName.replace(/"/g, '""')}"`,
        cert.studentEmail,
        `"${cert.courseTitle.replace(/"/g, '""')}"`,
        cert.score,
        new Date(cert.issuedAt).toLocaleDateString(),
      ]);
    } else if (activeTab === "estudiantes") {
      headers = [
        "Estudiante",
        "Correo",
        "Curso",
        "Estado",
        "% Progreso",
        "Fecha Inscripción",
      ];
      rows = students.map((s) => [
        `"${s.studentName.replace(/"/g, '""')}"`,
        s.studentEmail,
        `"${s.courseTitle.replace(/"/g, '""')}"`,
        s.status,
        `${s.progress}%`,
        new Date(s.enrolledAt).toLocaleDateString(),
      ]);
    }

    const csvContent =
      "\uFEFF" +
      [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCourses = courses.filter((c) =>
    `${c.title} ${c.category} ${c.instructor}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const filteredExams = exams.filter((e) =>
    `${e.title} ${e.courseTitle}`.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredCertificates = certificates.filter((cert) =>
    `${cert.studentName} ${cert.studentEmail} ${cert.courseTitle} ${cert.id}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const filteredStudents = students.filter((s) =>
    `${s.studentName} ${s.studentEmail} ${s.courseTitle}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes y Estadísticas</h1>
          <p className="text-muted-foreground">
            Métricas de rendimiento académico, evaluaciones, certificaciones y retención.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={loadData}
            disabled={loading}
            title="Actualizar datos"
          >
            <RefreshCwIcon
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            onClick={handleExportCSV}
            className="gap-2 bg-sidebar hover:bg-sidebar-accent text-white shadow-sm"
          >
            <DownloadIcon className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Tarjetas KPI de Resumen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Estudiantes */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estudiantes
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <UsersIcon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : summary?.totalUsers ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-emerald-600 font-medium">
                {summary?.activeUsers ?? 0} activos
              </span>{" "}
              en la plataforma
            </p>
          </CardContent>
        </Card>

        {/* Cursos e Inscripciones */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inscripciones Totales
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
              <BookOpenIcon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : summary?.totalEnrollments ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              En {summary?.totalCourses ?? 0} cursos activos
            </p>
          </CardContent>
        </Card>

        {/* Tasa de Finalización */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tasa de Finalización
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <TrendingUpIcon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : `${summary?.completionRate ?? 0}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.completedEnrollments ?? 0} cursos culminados
            </p>
          </CardContent>
        </Card>

        {/* Certificados Emitidos */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Certificados Emitidos
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <AwardIcon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : summary?.totalCertificates ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tasa de aprobación:{" "}
              <span className="font-medium text-foreground">
                {summary?.passRate ?? 0}%
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs y Controles */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setActiveTab("cursos");
                setSearch("");
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "cursos"
                  ? "bg-sidebar text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <BookOpenIcon className="h-4 w-4" />
              Cursos ({courses.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("examenes");
                setSearch("");
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "examenes"
                  ? "bg-sidebar text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <FileCheckIcon className="h-4 w-4" />
              Exámenes ({exams.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("certificados");
                setSearch("");
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "certificados"
                  ? "bg-sidebar text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <AwardIcon className="h-4 w-4" />
              Padrón de Certificados ({certificates.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("estudiantes");
                setSearch("");
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "estudiantes"
                  ? "bg-sidebar text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <GraduationCapIcon className="h-4 w-4" />
              Progreso Alumnos ({students.length})
            </button>
          </div>

          {/* Buscador dinámico */}
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar en el reporte..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Tab 1: Cursos */}
        {activeTab === "cursos" && (
          <Card className="border-border/60">
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Rendimiento por Curso</CardTitle>
              <CardDescription>
                Inscripciones, tasa de finalización y satisfacción de estudiantes.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Curso</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead className="text-center">Inscritos</TableHead>
                    <TableHead className="text-center">Completados</TableHead>
                    <TableHead className="w-[180px]">Finalización</TableHead>
                    <TableHead className="text-center">Calificación</TableHead>
                    <TableHead className="text-center">Certificados</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        Cargando cursos...
                      </TableCell>
                    </TableRow>
                  ) : filteredCourses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        No se encontraron cursos
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{course.title}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {course.category}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {course.level}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {course.instructor}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {course.enrolled}
                        </TableCell>
                        <TableCell className="text-center font-medium text-emerald-600">
                          {course.completed}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                              <span>{course.completionRate}%</span>
                              <span className="text-muted-foreground">
                                {course.completed}/{course.enrolled}
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${Math.min(100, course.completionRate)}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-1 font-medium">
                            <StarIcon className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span>{course.avgRating}</span>
                            <span className="text-xs text-muted-foreground">
                              ({course.totalReviews})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-semibold text-indigo-600">
                          {course.certificatesIssued}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Tab 2: Exámenes */}
        {activeTab === "examenes" && (
          <Card className="border-border/60">
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Rendimiento de Evaluaciones Finales</CardTitle>
              <CardDescription>
                Tasa de aprobación, reprobación y notas promedio por evaluación.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px]">Curso</TableHead>
                    <TableHead>Examen</TableHead>
                    <TableHead className="text-center">Intentos</TableHead>
                    <TableHead className="text-center">Aprobados</TableHead>
                    <TableHead className="text-center">Reprobados</TableHead>
                    <TableHead className="w-[180px]">Tasa de Aprobación</TableHead>
                    <TableHead className="text-center">Nota Media</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        Cargando exámenes...
                      </TableCell>
                    </TableRow>
                  ) : filteredExams.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        No hay exámenes registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium text-foreground">
                          {exam.courseTitle}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {exam.title}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {exam.totalAttempts}
                        </TableCell>
                        <TableCell className="text-center font-medium text-emerald-600">
                          {exam.passedAttempts}
                        </TableCell>
                        <TableCell className="text-center font-medium text-rose-600">
                          {exam.failedAttempts}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                              <span>{exam.passRate}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full transition-all"
                                style={{ width: `${Math.min(100, exam.passRate)}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={
                              exam.avgScore >= 14
                                ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 font-bold"
                                : "bg-amber-500/10 text-amber-700 border-amber-500/30 font-bold"
                            }
                          >
                            {exam.avgScore} pts
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Tab 3: Certificados */}
        {activeTab === "certificados" && (
          <Card className="border-border/60">
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Padrón General de Certificados</CardTitle>
              <CardDescription>
                Certificaciones emitidas oficialmente a estudiantes graduados.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead className="text-center">Calificación</TableHead>
                    <TableHead>Código Certificado</TableHead>
                    <TableHead className="text-right">Fecha de Emisión</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        Cargando certificados...
                      </TableCell>
                    </TableRow>
                  ) : filteredCertificates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        No hay certificados emitidos aún
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCertificates.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{cert.studentName}</p>
                            <p className="text-xs text-muted-foreground">{cert.studentEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{cert.courseTitle}</p>
                          {cert.courseCategory && (
                            <Badge variant="outline" className="text-xs mt-0.5">
                              {cert.courseCategory}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-emerald-500/15 text-emerald-700 font-semibold border-emerald-500/30">
                            {cert.score} pts
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {cert.id.slice(0, 13)}...
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {new Date(cert.issuedAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Tab 4: Progreso de Estudiantes */}
        {activeTab === "estudiantes" && (
          <Card className="border-border/60">
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Progreso y Retención de Estudiantes</CardTitle>
              <CardDescription>
                Avance en porcentaje y estado de matrícula por estudiante.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Curso Matriculado</TableHead>
                    <TableHead className="w-[200px]">Progreso</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-right">Último Avance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        Cargando progreso de estudiantes...
                      </TableCell>
                    </TableRow>
                  ) : filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        No hay registros de inscripciones
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{item.studentName}</p>
                            <p className="text-xs text-muted-foreground">{item.studentEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.courseTitle}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                              <span>{item.progress}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  item.progress === 100
                                    ? "bg-emerald-500"
                                    : item.progress > 40
                                      ? "bg-blue-500"
                                      : "bg-amber-500"
                                }`}
                                style={{ width: `${Math.min(100, item.progress)}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.status === "COMPLETED" ? (
                            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                              Completado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              En progreso
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
