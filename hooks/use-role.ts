import { useAuth } from "../contexts/auth.context";

export enum UserRole {
  SUPERADMIN = "SUPERADMIN",
  ADMIN = "ADMIN",
  DOCENTE = "DOCENTE",
  USER = "USER",
}

export function useRole() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const role = user?.role as UserRole | undefined;

  const isAdministrador =
    role === UserRole.ADMIN || role === UserRole.SUPERADMIN;
  const isDocente = role === UserRole.DOCENTE;

  return {
    role,
    isAdministrador,
    isDocente,
    isAuthenticated,
    isLoading,
    user,
  };
}
