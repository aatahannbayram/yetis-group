import type { ReactNode } from "react";
import { YgButton, type YgButtonVariant } from "@/components/yg-ops/shared/button";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    variant?: YgButtonVariant;
  };
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[length:var(--yg-text-24)] font-semibold tracking-[-0.02em] text-[var(--yg-text)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-[length:var(--yg-text-14)] text-[var(--yg-text-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <YgButton variant={action.variant ?? "primary"} onClick={action.onClick}>
          {action.label}
        </YgButton>
      ) : null}
    </div>
  );
}

export function PageHeaderSlot({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[length:var(--yg-text-24)] font-semibold tracking-[-0.02em] text-[var(--yg-text)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-[length:var(--yg-text-14)] text-[var(--yg-text-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
