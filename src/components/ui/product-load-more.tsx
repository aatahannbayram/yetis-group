"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductLoadMore({
  loadedCount,
  totalCount,
  hasMore,
  loading,
  onLoadMore,
  className,
}: {
  loadedCount: number;
  totalCount: number;
  hasMore: boolean;
  loading?: boolean;
  onLoadMore: () => void;
  className?: string;
}) {
  if (!hasMore) return null;

  return (
    <div className={cn("flex flex-col items-center gap-2 py-6", className)}>
      <p className="text-xs text-[var(--panel-ink-muted)]">
        <span className="font-medium tabular-nums text-[var(--panel-ink)]">{loadedCount}</span>
        {" / "}
        {totalCount} ürün gösteriliyor
      </p>
      <button
        type="button"
        disabled={loading}
        onClick={onLoadMore}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--panel-border)] bg-[var(--surface-2)] px-4 text-sm font-medium text-[var(--panel-ink)] transition-colors hover:border-[var(--primary-solid)]/40 hover:text-[var(--primary-text)] disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        Daha fazla yükle
      </button>
    </div>
  );
}
