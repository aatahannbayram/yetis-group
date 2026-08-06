"use client";

import { cn } from "@/lib/utils";

export type MetricItem = {
  id: string;
  label: string;
  value: string | number;
  tone?: "default" | "warn" | "danger" | "info";
};

export function MetricStrip({
  items,
  activeId,
  onSelect,
  className,
}: {
  items: MetricItem[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid min-h-[80px] gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
        className,
      )}
      role="toolbar"
      aria-label="Metrik filtreleri"
    >
      {items.map((item) => {
        const active = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item.id)}
            className={cn(
              "relative flex flex-col items-start justify-center rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition-[background-color,border-color,box-shadow] duration-[var(--motion-hover)]",
              active
                ? "border-[var(--primary-solid)] bg-[var(--primary-subtle)] shadow-[var(--shadow-sm)]"
                : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]",
              item.tone === "danger" &&
                !active &&
                "border-[var(--danger-border)]",
              item.tone === "warn" && !active && "border-[var(--warning-border)]",
              item.tone === "info" && !active && "border-[var(--info-border)]",
            )}
          >
            {active ? (
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-[3px] rounded-l-[var(--radius-md)] bg-[var(--primary-solid)]"
              />
            ) : null}
            <span className="text-[length:var(--text-caption)] text-[var(--text-muted)]">
              {item.label}
            </span>
            <span
              className={cn(
                "mt-0.5 text-[1.125rem] font-semibold tabular-nums text-[var(--text-primary)]",
                item.tone === "danger" && "text-[var(--danger-text)]",
                item.tone === "warn" && "text-[var(--warning-text)]",
                item.tone === "info" && "text-[var(--info-text)]",
              )}
            >
              {item.value}
            </span>
          </button>
        );
      })}
    </div>
  );
}
