"use client";

import { cn } from "@/lib/utils";

export function BulkActionBar({
  count,
  children,
  onClear,
  className,
}: {
  count: number;
  children: React.ReactNode;
  onClear?: () => void;
  className?: string;
}) {
  if (count <= 0) return null;
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-4 z-40 flex justify-center px-3 pointer-events-none",
        className,
      )}
      role="region"
      aria-label="Toplu işlemler"
    >
      <div
        className="pointer-events-auto flex max-w-full flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-[var(--panel-border)] bg-[var(--panel-ink)] px-3 py-2 text-white transition-transform duration-[var(--motion-bulk)]"
        style={{ animation: "panel-bulk-up var(--motion-bulk) ease-out" }}
      >
        <span className="text-caption font-medium tabular-nums">
          {count} seçili
        </span>
        <div className="flex flex-wrap items-center gap-1.5">{children}</div>
        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="ml-1 text-caption text-white/70 underline-offset-2 hover:text-white hover:underline"
          >
            Temizle
          </button>
        ) : null}
      </div>
    </div>
  );
}
