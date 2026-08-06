import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  badge,
  action,
  tip,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  action?: React.ReactNode;
  tip?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-6",
        className,
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--surface-3)] text-[var(--text-muted)]">
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[1rem] font-semibold text-[var(--text-primary)]">{title}</h3>
          {badge ? (
            <span className="rounded-full bg-[var(--info-subtle)] px-2 py-0.5 text-caption font-medium text-[var(--info-text)]">
              {badge}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-[length:var(--text-body)] text-[var(--text-secondary)]">
          {description}
        </p>
        {tip ? (
          <p className="mt-2 text-caption text-[var(--text-muted)]">{tip}</p>
        ) : null}
      </div>
      {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}
