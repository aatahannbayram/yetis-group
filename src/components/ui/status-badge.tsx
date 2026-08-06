import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/**
 * Status tone → subtle bg + text + optional dot.
 * Filled brand green is never used for success/active badges.
 */
export type StatusTone =
  | "neutral"
  | "neutral-strong"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "skt-ok"
  | "skt-info"
  | "skt-warn"
  | "skt-danger";

const toneClass: Record<StatusTone, string> = {
  neutral: "bg-[var(--neutral-subtle)] text-[var(--neutral-text)] border border-[var(--neutral-border)]",
  "neutral-strong":
    "bg-[var(--surface-3)] text-[var(--text-secondary)] border border-[var(--border-strong)]",
  info: "bg-[var(--info-subtle)] text-[var(--info-text)] border border-[var(--info-border)]",
  success:
    "bg-[var(--success-subtle)] text-[var(--success-text)] border border-[var(--success-border)]",
  warning:
    "bg-[var(--warning-subtle)] text-[var(--warning-text)] border border-[var(--warning-border)]",
  danger:
    "bg-[var(--danger-subtle)] text-[var(--danger-text)] border border-[var(--danger-border)]",
  "skt-ok":
    "bg-[var(--success-subtle)] text-[var(--success-text)] border border-[var(--success-border)]",
  "skt-info":
    "bg-[var(--info-subtle)] text-[var(--info-text)] border border-[var(--info-border)]",
  "skt-warn":
    "bg-[var(--warning-subtle)] text-[var(--warning-text)] border border-[var(--warning-border)]",
  "skt-danger":
    "bg-[var(--danger-subtle)] text-[var(--danger-text)] border border-[var(--danger-border)]",
};

const dotClass: Record<StatusTone, string> = {
  neutral: "bg-[var(--neutral-solid)]",
  "neutral-strong": "bg-[var(--text-secondary)]",
  info: "bg-[var(--info-solid)]",
  success: "bg-[var(--success-solid)]",
  warning: "bg-[var(--warning-solid)]",
  danger: "bg-[var(--danger-solid)]",
  "skt-ok": "bg-[var(--success-solid)]",
  "skt-info": "bg-[var(--info-solid)]",
  "skt-warn": "bg-[var(--warning-solid)]",
  "skt-danger": "bg-[var(--danger-solid)]",
};

/** @deprecated Prefer StatusBadge */
export type StatusPillTone = StatusTone | "progress" | "review" | "warn" | "skt-soon" | "skt-critical" | "skt-expired" | "skt-warn";

function normalizeTone(tone: StatusPillTone): StatusTone {
  switch (tone) {
    case "progress":
    case "review":
      return "info";
    case "warn":
    case "skt-soon":
    case "skt-warn":
      return "warning";
    case "skt-critical":
    case "skt-expired":
      return "skt-danger";
    case "skt-ok":
      return "skt-ok";
    default:
      return tone as StatusTone;
  }
}

export function StatusBadge({
  label,
  tone = "neutral",
  icon: Icon,
  showDot = true,
  className,
}: {
  label: string;
  tone?: StatusTone;
  icon?: LucideIcon;
  showDot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full px-2 py-0.5 text-[length:var(--text-caption)] font-medium",
        toneClass[tone],
        className,
      )}
      title={label}
    >
      {Icon ? (
        <Icon className="size-3 shrink-0" aria-hidden />
      ) : showDot ? (
        <span className={cn("size-1.5 shrink-0 rounded-full", dotClass[tone])} aria-hidden />
      ) : null}
      <span className="truncate">{label}</span>
    </span>
  );
}

/** @deprecated Use StatusBadge */
export function StatusPill({
  label,
  tone = "neutral",
  icon,
  className,
}: {
  label: string;
  tone?: StatusPillTone;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <StatusBadge
      label={label}
      tone={normalizeTone(tone)}
      icon={icon}
      className={className}
    />
  );
}
