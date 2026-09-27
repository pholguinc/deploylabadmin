import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
  /** Fallback si el nombre no existe en lucide-react */
  fallback?: React.ReactNode;
}

/**
 * Renderiza un ícono de lucide-react por su nombre (string).
 * Ej: <DynamicIcon name="Container" className="h-5 w-5" />
 */
export function DynamicIcon({
  name,
  fallback = null,
  ...props
}: DynamicIconProps) {
  // Los nombres en lucide-react son PascalCase + "Icon" opcionalmente
  // Intentamos con el nombre tal cual, luego con "Icon" sufijo
  const Icon =
    (
      LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>
    )[name] ??
    (
      LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>
    )[`${name}Icon`];

  if (!Icon) return <>{fallback}</>;
  return <Icon {...props} />;
}
