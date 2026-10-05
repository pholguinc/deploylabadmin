"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  GlobeIcon,
  GraduationCapIcon,
  UserIcon,
  ShieldCheckIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  SaveIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircle2Icon,
  BuildingIcon,
  AwardIcon,
  BellIcon,
  SlidersHorizontalIcon,
  Loader2Icon,
} from "lucide-react";
import { useAuth } from "@/contexts/auth.context";
import { updateUser } from "../usuarios/services/usuarios.service";
import { getSetting, saveSetting } from "./services/settings.service";
import { toast } from "sonner";

type SettingsTab =
  | "general"
  | "academico"
  | "perfil"
  | "seguridad"
  | "notificaciones";

interface PlatformSettings {
  platformName: string;
  platformDescription: string;
  supportEmail: string;
  publicUrl: string;
  certificatePrefix: string;
  timezone: string;
  language: string;
  minPassingScore: number;
  maxExamAttempts: number;
  minAttendancePercent: number;
  autoIssueCertificates: boolean;
  sequentialLessons: boolean;
  allowStudentComments: boolean;
  allowPublicRegistration: boolean;
  requireEmailVerification: boolean;
  sessionTimeoutHours: number;
  notifyOnStudentPass: boolean;
  notifyOnNewRegistration: boolean;
  notifyOnCertificateIssued: boolean;
}

const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  platformName: "DeployLab Academy",
  platformDescription:
    "Plataforma de formación práctica en DevOps, Cloud Architecture y Desarrollo de Software.",
  supportEmail: "soporte@deploylab.io",
  publicUrl: "https://deploylab.io",
  certificatePrefix: "DPLB-CERT",
  timezone: "America/Bogota (UTC-5)",
  language: "Español (Latinoamérica)",
  minPassingScore: 14,
  maxExamAttempts: 3,
  minAttendancePercent: 80,
  autoIssueCertificates: true,
  sequentialLessons: true,
  allowStudentComments: true,
  allowPublicRegistration: true,
  requireEmailVerification: false,
  sessionTimeoutHours: 24,
  notifyOnStudentPass: true,
  notifyOnNewRegistration: true,
  notifyOnCertificateIssued: true,
};

export default function ConfiguracionPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingPlatform, setSavingPlatform] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Estados de configuración de plataforma
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(
    DEFAULT_PLATFORM_SETTINGS,
  );

  // Cargar configuraciones desde la API
  useEffect(() => {
    let isMounted = true;
    getSetting<PlatformSettings>("platform_settings")
      .then((saved) => {
        if (isMounted && saved) {
          setPlatformSettings((prev) => ({ ...prev, ...saved }));
        }
      })
      .catch((err) => {
        console.error("Error al cargar configuraciones:", err);
      })
      .finally(() => {
        if (isMounted) {
          setLoadingSettings(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Estados de perfil de usuario
  const [userName, setUserName] = useState(user?.name || "");
  const [userLastname, setUserLastname] = useState(user?.lastname || "");
  const [userPhone, setUserPhone] = useState(user?.phone || "");
  const userEmail = user?.email || "";
  const [prevUserId, setPrevUserId] = useState(user?.id);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Sincronizar campos cuando el usuario cargue o cambie
  if (user && user.id !== prevUserId) {
    setPrevUserId(user.id);
    setUserName(user.name || "");
    setUserLastname(user.lastname || "");
    setUserPhone(user.phone || "");
  }

  const handlePlatformChange = (
    field: keyof PlatformSettings,
    value: unknown,
  ) => {
    setPlatformSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSavePlatform = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingPlatform(true);
    try {
      await Promise.all([
        saveSetting(
          "platform_settings",
          platformSettings,
          "Configuración general de la plataforma DeployLab",
        ),
        saveSetting(
          "general_settings",
          {
            platformName: platformSettings.platformName,
            platformDescription: platformSettings.platformDescription,
            supportEmail: platformSettings.supportEmail,
            publicUrl: platformSettings.publicUrl,
            certificatePrefix: platformSettings.certificatePrefix,
            timezone: platformSettings.timezone,
            language: platformSettings.language,
          },
          "Parámetros institucionales visibles en certificados, portal y correos",
        ),
        saveSetting(
          "academic_settings",
          {
            minPassingScore: platformSettings.minPassingScore,
            maxExamAttempts: platformSettings.maxExamAttempts,
            minAttendancePercent: platformSettings.minAttendancePercent,
            autoIssueCertificates: platformSettings.autoIssueCertificates,
            sequentialLessons: platformSettings.sequentialLessons,
            allowStudentComments: platformSettings.allowStudentComments,
          },
          "Criterios de evaluación, reglas de cursado y emisión de certificados",
        ),
        saveSetting(
          "security_settings",
          {
            allowPublicRegistration: platformSettings.allowPublicRegistration,
            requireEmailVerification: platformSettings.requireEmailVerification,
            sessionTimeoutHours: platformSettings.sessionTimeoutHours,
          },
          "Políticas de acceso, registro público y expiración de sesiones",
        ),
        saveSetting(
          "notification_settings",
          {
            notifyOnNewRegistration: platformSettings.notifyOnNewRegistration,
            notifyOnStudentPass: platformSettings.notifyOnStudentPass,
            notifyOnCertificateIssued:
              platformSettings.notifyOnCertificateIssued,
          },
          "Eventos del sistema que disparan notificaciones automáticas",
        ),
      ]);

      localStorage.setItem(
        "deploylab_platform_settings",
        JSON.stringify(platformSettings),
      );
      toast.success("Configuración actualizada correctamente en el sistema");
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Error al guardar la configuración",
      );
    } finally {
      setSavingPlatform(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("No se pudo identificar la sesión del usuario actual");
      return;
    }

    if (!userName.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    if (newPassword && newPassword.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setSavingProfile(true);
    try {
      const payload: {
        name: string;
        lastname?: string;
        phone?: string;
        password?: string;
      } = {
        name: userName.trim(),
        ...(userLastname.trim() ? { lastname: userLastname.trim() } : {}),
        ...(userPhone.trim() ? { phone: userPhone.trim() } : {}),
      };

      if (newPassword) {
        payload.password = newPassword;
      }

      await updateUser(user.id, payload);

      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const newUser = {
            ...parsed,
            name: payload.name,
            ...(payload.lastname ? { lastname: payload.lastname } : {}),
            ...(payload.phone ? { phone: payload.phone } : {}),
          };
          localStorage.setItem("user", JSON.stringify(newUser));
        } catch {
          // ignore
        }
      }

      toast.success("Perfil actualizado correctamente");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al actualizar perfil",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
            <Badge
              variant="outline"
              className="border-sidebar/30 text-sidebar font-semibold"
            >
              {loadingSettings ? (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2Icon className="h-3 w-3 animate-spin text-sidebar" />
                  Cargando desde API...
                </span>
              ) : (
                "Sistema v1.2"
              )}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Administra los parámetros de la academia, criterios de evaluación,
            seguridad y tu perfil de acceso.
          </p>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "general"
              ? "bg-sidebar text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <GlobeIcon className="h-4 w-4" />
          General
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("academico")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "academico"
              ? "bg-sidebar text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <GraduationCapIcon className="h-4 w-4" />
          Académico y Evaluaciones
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("perfil")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "perfil"
              ? "bg-sidebar text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <UserIcon className="h-4 w-4" />
          Mi Perfil
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("seguridad")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "seguridad"
              ? "bg-sidebar text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <ShieldCheckIcon className="h-4 w-4" />
          Seguridad y Accesos
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("notificaciones")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "notificaciones"
              ? "bg-sidebar text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <BellIcon className="h-4 w-4" />
          Notificaciones
        </button>
      </div>

      {/* TAB 1: GENERAL */}
      {activeTab === "general" && (
        <form onSubmit={handleSavePlatform} className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BuildingIcon className="h-5 w-5 text-indigo-500" />
                Información de la Plataforma
              </CardTitle>
              <CardDescription>
                Parámetros institucionales visibles en certificados, correos de
                bienvenida y portal del estudiante.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cfg-name">Nombre de la Academia</Label>
                  <Input
                    id="cfg-name"
                    value={platformSettings.platformName}
                    onChange={(e) =>
                      handlePlatformChange("platformName", e.target.value)
                    }
                    placeholder="Ej. DeployLab Academy"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cfg-cert-prefix">
                    Prefijo de Folio de Certificados
                  </Label>
                  <Input
                    id="cfg-cert-prefix"
                    value={platformSettings.certificatePrefix}
                    onChange={(e) =>
                      handlePlatformChange("certificatePrefix", e.target.value)
                    }
                    placeholder="DPLB-CERT"
                  />
                  <p className="text-xs text-muted-foreground">
                    Código inicial para folios oficiales (ej.{" "}
                    {platformSettings.certificatePrefix}-2026-0042)
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cfg-desc">Descripción o Eslogan</Label>
                <Input
                  id="cfg-desc"
                  value={platformSettings.platformDescription}
                  onChange={(e) =>
                    handlePlatformChange("platformDescription", e.target.value)
                  }
                  placeholder="Descripción corta para encabezados y metas"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cfg-email">
                    Correo Institucional de Soporte
                  </Label>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cfg-email"
                      type="email"
                      className="pl-9"
                      value={platformSettings.supportEmail}
                      onChange={(e) =>
                        handlePlatformChange("supportEmail", e.target.value)
                      }
                      placeholder="soporte@deploylab.io"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cfg-url">URL del Portal de Estudiantes</Label>
                  <div className="relative">
                    <GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cfg-url"
                      className="pl-9"
                      value={platformSettings.publicUrl}
                      onChange={(e) =>
                        handlePlatformChange("publicUrl", e.target.value)
                      }
                      placeholder="https://deploylab.io"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t">
                <div className="space-y-1.5">
                  <Label htmlFor="cfg-tz">Zona Horaria Predeterminada</Label>
                  <Input
                    id="cfg-tz"
                    value={platformSettings.timezone}
                    onChange={(e) =>
                      handlePlatformChange("timezone", e.target.value)
                    }
                    placeholder="America/Bogota (UTC-5)"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cfg-lang">Idioma del Sistema</Label>
                  <Input
                    id="cfg-lang"
                    value={platformSettings.language}
                    onChange={(e) =>
                      handlePlatformChange("language", e.target.value)
                    }
                    placeholder="Español (Latinoamérica)"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button
                type="submit"
                disabled={savingPlatform || loadingSettings}
                className="gap-2 bg-sidebar hover:bg-sidebar-accent text-white"
              >
                {savingPlatform ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <SaveIcon className="h-4 w-4" />
                )}
                {savingPlatform ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* TAB 2: ACADÉMICO Y EVALUACIONES */}
      {activeTab === "academico" && (
        <form onSubmit={handleSavePlatform} className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AwardIcon className="h-5 w-5 text-emerald-500" />
                Criterios de Evaluación y Certificación
              </CardTitle>
              <CardDescription>
                Reglas y umbrales aplicados para la aprobación de exámenes
                finales y emisión de diplomas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="space-y-2 p-4 rounded-xl border bg-muted/20">
                  <Label
                    htmlFor="cfg-minscore"
                    className="font-semibold text-sm"
                  >
                    Nota Mínima Aprobatoria
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="cfg-minscore"
                      type="number"
                      min={1}
                      max={20}
                      className="font-bold text-lg text-emerald-600"
                      value={platformSettings.minPassingScore}
                      onChange={(e) =>
                        handlePlatformChange(
                          "minPassingScore",
                          Number(e.target.value),
                        )
                      }
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      / 20
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Puntaje mínimo para aprobar cualquier examen final de curso.
                  </p>
                </div>

                <div className="space-y-2 p-4 rounded-xl border bg-muted/20">
                  <Label
                    htmlFor="cfg-maxattempts"
                    className="font-semibold text-sm"
                  >
                    Máximo de Intentos por Examen
                  </Label>
                  <Input
                    id="cfg-maxattempts"
                    type="number"
                    min={1}
                    max={10}
                    className="font-bold text-lg"
                    value={platformSettings.maxExamAttempts}
                    onChange={(e) =>
                      handlePlatformChange(
                        "maxExamAttempts",
                        Number(e.target.value),
                      )
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Intentos antes de requerir desbloqueo manual del docente.
                  </p>
                </div>

                <div className="space-y-2 p-4 rounded-xl border bg-muted/20">
                  <Label
                    htmlFor="cfg-attendance"
                    className="font-semibold text-sm"
                  >
                    Progreso Mínimo Requerido
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="cfg-attendance"
                      type="number"
                      min={0}
                      max={100}
                      className="font-bold text-lg text-blue-600"
                      value={platformSettings.minAttendancePercent}
                      onChange={(e) =>
                        handlePlatformChange(
                          "minAttendancePercent",
                          Number(e.target.value),
                        )
                      }
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      %
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Porcentaje de lecciones vistas antes de habilitar el examen
                    final.
                  </p>
                </div>
              </div>

              {/* Switches de reglas académicas */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <SlidersHorizontalIcon className="h-4 w-4 text-sidebar" />
                  Reglas de Cursado y Emisión
                </h4>

                <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/10 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">
                        Emisión Automática de Certificados
                      </p>
                      <Badge
                        variant="outline"
                        className="text-xs text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20"
                      >
                        Recomendado
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Generar folio digital y certificado en PDF al instante en
                      que el alumno aprueba el examen final.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-sidebar focus:ring-sidebar cursor-pointer"
                    checked={platformSettings.autoIssueCertificates}
                    onChange={(e) =>
                      handlePlatformChange(
                        "autoIssueCertificates",
                        e.target.checked,
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/10 transition-colors">
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">
                      Avance Secuencial de Lecciones
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Los alumnos deben completar una lección antes de poder
                      desbloquear la siguiente.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-sidebar focus:ring-sidebar cursor-pointer"
                    checked={platformSettings.sequentialLessons}
                    onChange={(e) =>
                      handlePlatformChange(
                        "sequentialLessons",
                        e.target.checked,
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/10 transition-colors">
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">
                      Foro de Dudas y Discusión en Lecciones
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Permitir que los estudiantes formulen consultas técnicas
                      debajo de cada video de curso.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-sidebar focus:ring-sidebar cursor-pointer"
                    checked={platformSettings.allowStudentComments}
                    onChange={(e) =>
                      handlePlatformChange(
                        "allowStudentComments",
                        e.target.checked,
                      )
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button
                type="submit"
                disabled={savingPlatform || loadingSettings}
                className="gap-2 bg-sidebar hover:bg-sidebar-accent text-white"
              >
                {savingPlatform ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <SaveIcon className="h-4 w-4" />
                )}
                {savingPlatform ? "Guardando..." : "Guardar Criterios"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* TAB 3: MI PERFIL */}
      {activeTab === "perfil" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-blue-500" />
                Mi Cuenta de Administrador
              </CardTitle>
              <CardDescription>
                Actualiza tus datos de contacto y credenciales de acceso a la
                consola.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Card visual de usuario */}
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border">
                <div className="h-12 w-12 rounded-full bg-sidebar text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {userName.slice(0, 1).toUpperCase()}
                  {userLastname.slice(0, 1).toUpperCase() || "A"}
                </div>
                <div>
                  <p className="font-semibold text-base">
                    {userName} {userLastname}
                  </p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
                <Badge
                  variant="secondary"
                  className="ml-auto text-xs font-semibold px-2.5 py-1"
                >
                  {user?.role || "ADMIN"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="prf-name">Nombre *</Label>
                  <Input
                    id="prf-name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    placeholder="Tu nombre"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prf-lastname">Apellido(s) *</Label>
                  <Input
                    id="prf-lastname"
                    value={userLastname}
                    onChange={(e) => setUserLastname(e.target.value)}
                    required
                    placeholder="Tus apellidos"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="prf-phone">Teléfono / WhatsApp</Label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="prf-phone"
                      className="pl-9"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      placeholder="+51 999 888 777"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prf-email">Correo Electrónico (Login)</Label>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="prf-email"
                      type="email"
                      className="pl-9 bg-muted/40 cursor-not-allowed text-muted-foreground"
                      value={userEmail}
                      disabled
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    El correo principal solo puede ser modificado con permisos
                    de Super Admin.
                  </p>
                </div>
              </div>

              {/* Cambio de Contraseña con Eye Toggle */}
              <div className="pt-4 border-t space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <LockIcon className="h-4 w-4 text-sidebar" />
                    Cambiar Contraseña
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    Opcional (déjalo vacío si no deseas cambiarla)
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="prf-pass">Nueva Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="prf-pass"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                        tabIndex={-1}
                        title={
                          showPassword ? "Ocultar contraseña" : "Ver contraseña"
                        }
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="prf-confirm">Confirmar Contraseña</Label>
                    <Input
                      id="prf-confirm"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button
                type="submit"
                disabled={savingProfile}
                className="gap-2 bg-sidebar hover:bg-sidebar-accent text-white"
              >
                <SaveIcon className="h-4 w-4" />
                {savingProfile ? "Guardando..." : "Actualizar Perfil"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* TAB 4: SEGURIDAD Y ACCESOS */}
      {activeTab === "seguridad" && (
        <form onSubmit={handleSavePlatform} className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-rose-500" />
                Seguridad y Políticas de Acceso
              </CardTitle>
              <CardDescription>
                Configura los controles de registro, sesiones concurrentes y
                autenticación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/10 transition-colors">
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">
                    Registro Público de Estudiantes
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Si está activo, cualquier usuario puede crear su cuenta
                    desde la web pública sin necesidad de ficha previa.
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 text-sidebar focus:ring-sidebar cursor-pointer"
                  checked={platformSettings.allowPublicRegistration}
                  onChange={(e) =>
                    handlePlatformChange(
                      "allowPublicRegistration",
                      e.target.checked,
                    )
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/10 transition-colors">
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">
                    Verificación de Correo Electrónico
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Exigir validar el enlace en bandeja de entrada antes de
                    acceder al contenido de los cursos.
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 text-sidebar focus:ring-sidebar cursor-pointer"
                  checked={platformSettings.requireEmailVerification}
                  onChange={(e) =>
                    handlePlatformChange(
                      "requireEmailVerification",
                      e.target.checked,
                    )
                  }
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <Label htmlFor="cfg-timeout">
                  Tiempo de Expiración de Sesión (Horas)
                </Label>
                <div className="w-full sm:w-1/3">
                  <Input
                    id="cfg-timeout"
                    type="number"
                    min={1}
                    max={168}
                    value={platformSettings.sessionTimeoutHours}
                    onChange={(e) =>
                      handlePlatformChange(
                        "sessionTimeoutHours",
                        Number(e.target.value),
                      )
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Tiempo tras el cual los tokens de acceso requerirán
                  reautenticación completa.
                </p>
              </div>

              {/* Informative Security Box */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/10 p-4 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2Icon className="h-4 w-4 text-emerald-600" />
                  Infraestructura Criptográfica Activa
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>
                    Contraseñas cifradas con algoritmo Bcrypt (Salt rounds = 10)
                  </li>
                  <li>
                    Sesiones protegidas con JSON Web Tokens (JWT) y cookies
                    HttpOnly
                  </li>
                  <li>
                    Auditoría de roles: ADMINISTRADOR, DOCENTE, ALUMNO con
                    Guards de NestJS
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button
                type="submit"
                disabled={savingPlatform || loadingSettings}
                className="gap-2 bg-sidebar hover:bg-sidebar-accent text-white"
              >
                {savingPlatform ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <SaveIcon className="h-4 w-4" />
                )}
                {savingPlatform ? "Guardando..." : "Guardar Políticas"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* TAB 5: NOTIFICACIONES */}
      {activeTab === "notificaciones" && (
        <form onSubmit={handleSavePlatform} className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BellIcon className="h-5 w-5 text-amber-500" />
                Eventos y Notificaciones del Sistema
              </CardTitle>
              <CardDescription>
                Define qué sucesos académicos disparan avisos por correo
                electrónico a administradores y alumnos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/10 transition-colors">
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">Nuevo Alumno Registrado</p>
                  <p className="text-xs text-muted-foreground">
                    Enviar un resumen diario con los nuevos alumnos matriculados
                    en la plataforma.
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 text-sidebar focus:ring-sidebar cursor-pointer"
                  checked={platformSettings.notifyOnNewRegistration}
                  onChange={(e) =>
                    handlePlatformChange(
                      "notifyOnNewRegistration",
                      e.target.checked,
                    )
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/10 transition-colors">
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">
                    Aprobación de Examen Final
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Avisar al docente a cargo cada vez que un estudiante apruebe
                    la evaluación final de su curso.
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 text-sidebar focus:ring-sidebar cursor-pointer"
                  checked={platformSettings.notifyOnStudentPass}
                  onChange={(e) =>
                    handlePlatformChange(
                      "notifyOnStudentPass",
                      e.target.checked,
                    )
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/10 transition-colors">
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">
                    Emisión de Certificado Oficial
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enviar al correo del estudiante su diploma digital y enlace
                    de validación pública.
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 text-sidebar focus:ring-sidebar cursor-pointer"
                  checked={platformSettings.notifyOnCertificateIssued}
                  onChange={(e) =>
                    handlePlatformChange(
                      "notifyOnCertificateIssued",
                      e.target.checked,
                    )
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button
                type="submit"
                disabled={savingPlatform || loadingSettings}
                className="gap-2 bg-sidebar hover:bg-sidebar-accent text-white"
              >
                {savingPlatform ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <SaveIcon className="h-4 w-4" />
                )}
                {savingPlatform ? "Guardando..." : "Guardar Preferencias"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}
