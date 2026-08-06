"use client";

import { cn } from "@/lib/utils";

export type SavedView = {
  id: string;
  label: string;
};

export function SavedViews({
  views,
  activeId,
  onSelect,
  className,
}: {
  views: SavedView[];
  activeId?: string | null;
  onSelect: (id: string) => void;
  className?: string;
}) {
  if (views.length === 0) return null;
  return (
    <div
      className={cn("flex flex-wrap items-center gap-1", className)}
      role="tablist"
      aria-label="Kayıtlı görünümler"
    >
      {views.map((view) => {
        const active = activeId === view.id;
        return (
          <button
            key={view.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(view.id)}
            className={cn(
              "h-8 shrink-0 rounded-full px-3 text-caption font-medium transition-colors duration-[var(--motion-hover)]",
              active
                ? "bg-[var(--panel-accent-action)] text-white"
                : "text-[var(--panel-ink-muted)] hover:bg-neutral-100 hover:text-[var(--panel-ink)]",
            )}
          >
            {view.label}
          </button>
        );
      })}
    </div>
  );
}
