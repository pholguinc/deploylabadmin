"use client";

import React, { useState } from "react";

// --- DONUT / PIE CHART ---
export interface PieChartItem {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: PieChartItem[];
  centerLabel?: string;
  centerValue?: string | number;
  size?: number;
}

export function DonutChart({
  data,
  centerLabel = "Total",
  centerValue,
  size = 200,
}: DonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const strokeWidth = 24;
  const hoverExpand = 6;
  // Margen de seguridad para que la expansión en hover no se recorte jamás
  const padding = 16;
  const viewBoxSize = size + padding * 2;
  const center = viewBoxSize / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
        <p className="text-sm">Sin datos para graficar</p>
      </div>
    );
  }

  const activeItem = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="flex flex-col items-center gap-4 overflow-visible">
      <div className="relative overflow-visible" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="-rotate-90 transform overflow-visible"
        >
          {/* Fondo del anillo */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />

          {/* Segmentos del pastel (filtrar items con valor 0 para no dibujar puntos fantasma) */}
          {(() => {
            const activeItems = data.filter((item) => item.value > 0);
            return activeItems.map((item, index) => {
              const percent = item.value / total;
              const strokeDasharray = `${percent * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedPercent * circumference;
              accumulatedPercent += percent;

              const isHovered = hoveredIndex === index;

              return (
                <circle
                  key={item.label}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + hoverExpand : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap={activeItems.length === 1 ? "butt" : "round"}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            });
          })()}
        </svg>

        {/* Texto central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {activeItem ? activeItem.value : centerValue ?? total}
          </span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {activeItem ? activeItem.label : centerLabel}
          </span>
          {activeItem && (
            <span className="text-xs font-semibold text-primary mt-0.5">
              {Math.round((activeItem.value / total) * 100)}%
            </span>
          )}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
        {data.map((item, index) => {
          const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
          const isHovered = hoveredIndex === index;

          return (
            <button
              key={item.label}
              type="button"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center gap-1.5 transition-opacity ${
                hoveredIndex !== null && !isHovered ? "opacity-40" : "opacity-100"
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium text-foreground">{item.label}</span>
              <span className="text-muted-foreground font-mono">({percent}%)</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- BAR CHART (BARRAS COMPARATIVAS) ---
export interface BarChartItem {
  label: string;
  value: number;
  secondaryValue?: number;
  tooltipExtra?: string;
}

interface BarChartProps {
  data: BarChartItem[];
  primaryLabel?: string;
  secondaryLabel?: string;
  height?: number;
}

export function BarChart({
  data,
  primaryLabel = "Inscritos",
  secondaryLabel = "Completados",
  height = 240,
}: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-muted-foreground text-sm">
        Sin datos disponibles
      </div>
    );
  }

  const rawMax = Math.max(
    ...data.flatMap((d) => [d.value, d.secondaryValue ?? 0]),
    1,
  );
  // Dejar 45% de espacio superior libre para que los tooltips nunca se corten
  const maxValue = Math.ceil(rawMax * 1.45);

  return (
    <div className="w-full space-y-4 overflow-visible">
      {/* Leyenda de barras */}
      <div className="flex items-center justify-end gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-violet-600 to-indigo-500" />
          <span className="text-muted-foreground font-medium">{primaryLabel}</span>
        </div>
        {data.some((d) => d.secondaryValue !== undefined) && (
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-emerald-600 to-teal-400" />
            <span className="text-muted-foreground font-medium">{secondaryLabel}</span>
          </div>
        )}
      </div>

      {/* Contenedor del gráfico con espacio superior e inferior suficiente */}
      <div
        className="relative flex items-end gap-4 sm:gap-8 pt-4 pb-8 border-b border-border/50 overflow-visible"
        style={{ height }}
      >
        {/* Líneas de guía de fondo */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 pb-8">
          <div className="border-b border-muted-foreground w-full" />
          <div className="border-b border-muted-foreground w-full" />
          <div className="border-b border-muted-foreground w-full" />
          <div className="border-b border-muted-foreground w-full" />
        </div>

        {data.map((item, index) => {
          const primaryPercent = Math.round((item.value / maxValue) * 100);
          const secondaryPercent = item.secondaryValue
            ? Math.round((item.secondaryValue / maxValue) * 100)
            : 0;
          const maxBarPercent = Math.max(primaryPercent, secondaryPercent);

          const isHovered = hoveredIndex === index;

          return (
            <div
              key={item.label}
              className="flex-1 flex flex-col items-center h-full justify-end group min-w-[60px] relative overflow-visible"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip flotante seguro sobre la barra */}
              {isHovered && (
                <div
                  className="absolute z-30 whitespace-nowrap rounded-lg bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-lg border border-border/80 pointer-events-none animate-in fade-in-0 zoom-in-95"
                  style={{
                    bottom: `calc(${maxBarPercent}% + 36px)`,
                  }}
                >
                  <p className="font-semibold text-foreground text-xs">{item.label}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px]">
                    <span className="flex items-center gap-1 text-indigo-400 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      {primaryLabel}: {item.value}
                    </span>
                    {item.secondaryValue !== undefined && (
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {secondaryLabel}: {item.secondaryValue}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Columnas de barra */}
              <div className="flex items-end gap-1.5 w-full justify-center h-full pb-1">
                {/* Barra Principal */}
                <div
                  className="w-4 sm:w-6 rounded-t-md bg-gradient-to-t from-violet-600 to-indigo-500 transition-all duration-300 group-hover:brightness-125 shadow-sm"
                  style={{ height: `${Math.max(primaryPercent, 6)}%` }}
                />

                {/* Barra Secundaria (si existe) */}
                {item.secondaryValue !== undefined && (
                  <div
                    className="w-4 sm:w-6 rounded-t-md bg-gradient-to-t from-emerald-600 to-teal-400 transition-all duration-300 group-hover:brightness-125 shadow-sm"
                    style={{ height: `${Math.max(secondaryPercent, 6)}%` }}
                  />
                )}
              </div>

              {/* Etiqueta inferior con espacio completo para no cortarse */}
              <span
                className="mt-2 text-[11px] font-medium text-muted-foreground truncate max-w-[90px] text-center"
                title={item.label}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- PROGRESS / PERFORMANCE BAR LIST ---
export interface PerformanceBarItem {
  title: string;
  subtitle?: string;
  value: number;
  total: number;
  percent: number;
  color?: string;
}

export function PerformanceBarList({ items }: { items: PerformanceBarItem[] }) {
  if (items.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        Sin cursos registrados
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.title} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-[280px]">
              {item.title}
            </span>
            <span className="font-semibold text-muted-foreground">
              {item.value} / {item.total}{" "}
              <span className="text-primary font-bold">({item.percent}%)</span>
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                item.color || "bg-gradient-to-r from-blue-500 to-indigo-600"
              }`}
              style={{ width: `${Math.min(100, Math.max(item.percent, 3))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
