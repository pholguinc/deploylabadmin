"use client";

import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserIcon, MailIcon, LockIcon, LoaderCircleIcon } from "lucide-react";
import type { Usuario, UsuarioFormData } from "../interfaces/usuario.interface";
import { createUser, updateUser } from "../services/usuarios.service";

interface UsuarioDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly usuario?: Usuario | null;
  readonly onSuccess: () => void;
}

const getValidationSchema = (isEdit: boolean) =>
  Yup.object({
    name: Yup.string().trim().required("El nombre es requerido"),
    email: Yup.string()
      .trim()
      .email("Email inválido")
      .required("El email es requerido"),
    password: isEdit
      ? Yup.string().min(8, "Mínimo 8 caracteres").nullable()
      : Yup.string()
          .trim()
          .required("La contraseña es requerida")
          .min(8, "Mínimo 8 caracteres"),
    isActive: Yup.boolean().required(),
    roles: Yup.array().of(Yup.string()),
  });

export function UsuarioDialog({
  open,
  onOpenChange,
  usuario,
  onSuccess,
}: UsuarioDialogProps) {
  const isEdit = !!usuario;
  const [apiError, setApiError] = useState<string | null>(null);

  const formik = useFormik<UsuarioFormData>({
    initialValues: {
      name: "",
      email: "",
      roles: [],
      isActive: true,
      password: "",
    },
    validationSchema: getValidationSchema(isEdit),
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      setApiError(null);
      try {
        if (isEdit && usuario) {
          await updateUser(usuario.id, values);
        } else {
          await createUser(values);
        }
        onSuccess();
        onOpenChange(false);
      } catch (err) {
        setApiError(err instanceof Error ? err.message : "Error inesperado");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (open) {
      if (usuario) {
        formik.setValues({
          name: usuario.name || "",
          email: usuario.email,
          roles: usuario.roles?.map((r) => r.id) || [],
          isActive: usuario.isActive,
          password: "",
        });
      } else {
        formik.resetForm();
      }
      const t = setTimeout(() => setApiError(null), 0);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, usuario]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
              <UserIcon className="h-4 w-4 text-white" />
            </div>
            {isEdit ? "Editar usuario" : "Nuevo usuario"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Modifica los datos de ${usuario?.name}.`
              : "Completa los campos para crear un nuevo usuario."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-5 py-2">
          {apiError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {apiError}
            </div>
          )}

          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="dlg-name" className="text-sm font-medium">
              Nombre completo
            </Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="dlg-name"
                name="name"
                placeholder="Ej. Ana Rodríguez"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`pl-10 ${
                  formik.touched.name && formik.errors.name
                    ? "border-destructive ring-destructive/20"
                    : ""
                }`}
              />
            </div>
            {formik.touched.name && formik.errors.name && (
              <p className="text-xs text-destructive">{formik.errors.name as string}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="dlg-email" className="text-sm font-medium">
              Correo electrónico
            </Label>
            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="dlg-email"
                name="email"
                type="email"
                placeholder="usuario@deploylab.io"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`pl-10 ${
                  formik.touched.email && formik.errors.email
                    ? "border-destructive ring-destructive/20"
                    : ""
                }`}
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-destructive">{formik.errors.email as string}</p>
            )}
          </div>

          {/* Contraseña */}
          <div className="space-y-1.5">
            <Label htmlFor="dlg-password" className="text-sm font-medium">
              {isEdit ? "Nueva contraseña" : "Contraseña"}
              {isEdit && (
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  (dejar vacío para no cambiar)
                </span>
              )}
            </Label>
            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="dlg-password"
                name="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={formik.values.password || ""}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`pl-10 ${
                  formik.touched.password && formik.errors.password
                    ? "border-destructive ring-destructive/20"
                    : ""
                }`}
              />
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-xs text-destructive">{formik.errors.password as string}</p>
            )}
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Estado</Label>
            <div className="flex gap-2">
              {[
                {
                  value: true,
                  label: "Activo",
                  cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
                },
                {
                  value: false,
                  label: "Inactivo",
                  cls: "border-zinc-400/30 bg-zinc-400/10 text-zinc-600 ring-zinc-400/20",
                },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => formik.setFieldValue("isActive", opt.value)}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-all duration-150 ${
                    formik.values.isActive === opt.value
                      ? `${opt.cls} ring-1`
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={formik.isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={formik.isSubmitting}
              className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500"
            >
              {formik.isSubmitting && (
                <LoaderCircleIcon className="h-4 w-4 animate-spin" />
              )}
              {isEdit ? "Guardar cambios" : "Crear usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
