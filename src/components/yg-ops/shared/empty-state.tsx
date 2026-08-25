import type { ReactNode } from "react";
import { YgButton } from "@/components/yg-ops/shared/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-center rounded-[var(--yg-radius-lg)] bg-[var(--yg-panel-2)] px-6 py-10",
        className,
      )}
    >
      <p className="text-[length:var(--yg-text-16)] font-medium text-[var(--yg-text)]">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-[length:var(--yg-text-14)] text-[var(--yg-text-muted)]">
          {description}
        </p>
      ) : null}
      {action ? (
        <YgButton variant="ghost" className="mt-4" onClick={action.onClick}>
          {action.label}
        </YgButton>
      ) : null}
    </div>
  );
}

export function EmptyStateSlot({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-center rounded-[var(--yg-radius-lg)] bg-[var(--yg-panel-2)] px-6 py-10",
        className,
      )}
    >
      <p className="text-[length:var(--yg-text-16)] font-medium text-[var(--yg-text)]">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-[length:var(--yg-text-14)] text-[var(--yg-text-muted)]">
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
}
