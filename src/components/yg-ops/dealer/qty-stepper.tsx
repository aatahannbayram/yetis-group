"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatYgQty } from "@/lib/yg-ops/format";

export function QtyStepper({
  packs,
  kgPerPack,
  packLabel = "koli",
  onChange,
  className,
}: {
  packs: number;
  kgPerPack: number;
  packLabel?: string;
  onChange: (packs: number) => void;
  className?: string;
}) {
  const kg = packs * kgPerPack;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Azalt"
          disabled={packs <= 0}
          onClick={() => onChange(Math.max(0, packs - 1))}
          className="inline-flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--yg-radius-md)] bg-[var(--yg-panel)] text-[var(--yg-text)] disabled:opacity-40"
        >
          <Minus className="size-4" aria-hidden />
        </button>
        <span className="min-w-[3rem] text-center text-[length:var(--yg-text-16)] font-semibold tabular-nums text-[var(--yg-text)]">
          {packs}
        </span>
        <button
          type="button"
          aria-label="Artır"
          onClick={() => onChange(packs + 1)}
          className="inline-flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--yg-radius-md)] bg-[var(--yg-panel)] text-[var(--yg-text)]"
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
      <p className="text-[length:var(--yg-text-12)] text-[var(--yg-text-muted)]">
        {formatYgQty(packs, kg, packLabel)}
      </p>
    </div>
  );
}
