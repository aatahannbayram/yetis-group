"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProductDetailSaveBar({
  dirtyCount,
  saving,
  saved,
  onDiscard,
  onSave,
}: {
  dirtyCount: number;
  saving: boolean;
  saved: boolean;
  onDiscard: () => void;
  onSave: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (dirtyCount > 0 || saved) {
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
  }, [dirtyCount, saved]);

  if (dirtyCount === 0 && !saved) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2",
        "transition-transform duration-300 ease-out",
        visible ? "translate-y-0" : "translate-y-full",
      )}
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex w-full max-w-5xl items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        {saved ? (
          <p className="text-sm font-medium text-[#1B5E3A]">Kaydedildi ✓</p>
        ) : (
          <p className="text-sm text-stone-600 dark:text-zinc-400">
            <span className="font-semibold tabular-nums text-stone-900 dark:text-zinc-100">
              {dirtyCount}
            </span>{" "}
            değişiklik kaydedilmedi
          </p>
        )}
        {!saved ? (
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={saving}
              onClick={onDiscard}
              className="text-stone-600 hover:text-stone-900 dark:text-zinc-400"
            >
              Vazgeç
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={saving || dirtyCount === 0}
              onClick={onSave}
            >
              {saving ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
