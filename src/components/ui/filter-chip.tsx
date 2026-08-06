"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function FilterChip({
  label,
  active,
  onClick,
  onClear,
  className,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  onClear?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 max-w-full items-center gap-1.5 rounded-full border px-2.5 text-caption font-medium transition-[background-color,border-color] duration-[var(--motion-hover)]",
        active
          ? "border-[var(--panel-accent-action)] bg-brand-50 text-[var(--panel-accent-action)]"
          : "border-[var(--panel-border)] bg-[var(--panel-surface)] text-[var(--panel-ink)] hover:border-neutral-300",
        className,
      )}
      title={label}
    >
      <span className="truncate">{label}</span>
      {active && onClear ? (
        <span
          role="button"
          tabIndex={0}
          aria-label={`${label} filtresini kaldır`}
          className="inline-flex size-4 shrink-0 items-center justify-center rounded-full hover:bg-brand-100"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onClear();
            }
          }}
        >
          <X className="size-3" aria-hidden />
        </span>
      ) : null}
    </button>
  );
}
