import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--yg-radius-lg)] bg-[var(--yg-panel-2)] p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[length:var(--yg-text-13)] text-[var(--yg-text-muted)]">{label}</p>
        {icon ? <span className="text-[var(--yg-text-muted)]">{icon}</span> : null}
      </div>
      <p className="mt-2 text-[length:var(--yg-text-24)] font-semibold tabular-nums tracking-[-0.02em] text-[var(--yg-text)]">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-[length:var(--yg-text-12)] text-[var(--yg-text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}
