"use client";

import { Rows3, Rows4 } from "lucide-react";
import { cn } from "@/lib/utils";

export type Density = "compact" | "comfortable";

export function DensityToggle({
  value,
  onChange,
  className,
}: {
  value: Density;
  onChange: (d: Density) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex h-8 items-center rounded-[var(--radius-sm)] border border-[var(--panel-border)] bg-[var(--panel-surface)] p-0.5",
        className,
      )}
      role="group"
      aria-label="Yoğunluk"
    >
      <button
        type="button"
        title="Kompakt"
        aria-pressed={value === "compact"}
        onClick={() => onChange("compact")}
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-[6px] transition-colors duration-[var(--motion-hover)]",
          value === "compact"
            ? "bg-brand-50 text-[var(--panel-accent-action)]"
            : "text-[var(--panel-ink-muted)] hover:text-[var(--panel-ink)]",
        )}
      >
        <Rows4 className="size-3.5" aria-hidden />
      </button>
      <button
        type="button"
        title="Rahat"
        aria-pressed={value === "comfortable"}
        onClick={() => onChange("comfortable")}
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-[6px] transition-colors duration-[var(--motion-hover)]",
          value === "comfortable"
            ? "bg-brand-50 text-[var(--panel-accent-action)]"
            : "text-[var(--panel-ink-muted)] hover:text-[var(--panel-ink)]",
        )}
      >
        <Rows3 className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
