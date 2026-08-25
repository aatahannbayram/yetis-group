import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type BlockingTone = "warning" | "danger" | "info";

const toneClass: Record<BlockingTone, string> = {
  warning: "bg-[var(--yg-notice-warning-bg)] text-[var(--yg-warning)]",
  danger: "bg-[var(--yg-notice-danger-bg)] text-[var(--yg-danger)]",
  info: "bg-[var(--yg-notice-info-bg)] text-[var(--yg-info)]",
};

export function BlockingNotice({
  tone,
  title,
  reason,
  children,
  className,
}: {
  tone: BlockingTone;
  title: string;
  /** Why the related action is disabled / blocked. Required copy. */
  reason: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--yg-radius-md)] px-4 py-3",
        toneClass[tone],
        className,
      )}
      role="status"
    >
      <p className="text-[length:var(--yg-text-14)] font-medium">{title}</p>
      <p className="mt-1 text-[length:var(--yg-text-13)] opacity-90">{reason}</p>
      {children}
    </div>
  );
}
