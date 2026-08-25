"use client";

import { cn } from "@/lib/utils";

export type PillTab = {
  id: string;
  label: string;
};

export function PillTabs({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: PillTab[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {tabs.map((tab) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex h-[var(--yg-pill-h)] min-h-[44px] shrink-0 items-center rounded-[var(--yg-radius-pill)] px-4 text-[length:var(--yg-text-13)] font-medium transition-colors duration-[var(--yg-duration)]",
              selected
                ? "bg-[var(--yg-primary)] text-[var(--yg-text-inverse)]"
                : "bg-[var(--yg-panel-2)] text-[var(--yg-text-muted)] hover:text-[var(--yg-text)]",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
