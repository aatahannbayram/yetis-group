"use client";

import { LayoutGrid, LayoutList, Columns3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "table" | "cards" | "kanban";

const icons = {
  table: LayoutList,
  cards: LayoutGrid,
  kanban: Columns3,
} as const;

export function ViewSwitcher({
  value,
  onChange,
  modes = ["table", "cards"],
  className,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
  modes?: ViewMode[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex h-8 items-center rounded-[var(--radius-sm)] border border-[var(--panel-border)] bg-[var(--panel-surface)] p-0.5",
        className,
      )}
      role="group"
      aria-label="Görünüm"
    >
      {modes.map((mode) => {
        const Icon = icons[mode];
        const label = mode === "table" ? "Tablo" : mode === "cards" ? "Kart" : "Kanban";
        return (
          <button
            key={mode}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={value === mode}
            onClick={() => onChange(mode)}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-[6px] transition-colors duration-[var(--motion-hover)]",
              value === mode
                ? "bg-brand-50 text-[var(--panel-accent-action)]"
                : "text-[var(--panel-ink-muted)] hover:text-[var(--panel-ink)]",
            )}
          >
            <Icon className="size-3.5" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
