import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatTone = "neutral" | "success" | "warning" | "danger" | "info";

/**
 * Single StatCard pattern for panel KPIs.
 * Filled emphasis only when tone !== neutral.
 * No count-up animation.
 */
export function StatCard({
  label,
  value,
  unit,
  suffix,
  delta,
  tone,
  href,
  hint,
  loading,
  icon: Icon,
  /** @deprecated Use tone="warning" | "danger" */
  warn,
  /** @deprecated Featured fill removed — totals stay neutral */
  featured: _featured,
  className,
}: {
  label: string;
  value: string | number;
  unit?: string;
  suffix?: string;
  delta?: string;
  tone?: StatTone;
  href?: string;
  hint?: string;
  loading?: boolean;
  icon?: LucideIcon;
  warn?: boolean;
  featured?: boolean;
  className?: string;
}) {
  void _featured;
  const resolvedTone: StatTone = tone ?? (warn ? "warning" : "neutral");
  const filled = resolvedTone !== "neutral";
  const displayUnit = unit ?? suffix;

  const iconTone = cn(
    "flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)]",
    resolvedTone === "neutral" && "bg-[var(--surface-3)] text-[var(--primary-text)]",
    resolvedTone === "warning" && "bg-[var(--warning-subtle)] text-[var(--warning-text)]",
    resolvedTone === "danger" && "bg-[var(--danger-subtle)] text-[var(--danger-text)]",
    resolvedTone === "success" && "bg-[var(--success-subtle)] text-[var(--success-text)]",
    resolvedTone === "info" && "bg-[var(--info-subtle)] text-[var(--info-text)]",
  );

  const body = (
    <div
      className={cn(
        "group relative flex min-h-[96px] flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] border p-4 transition-[border-color,box-shadow,transform,background-color] duration-[var(--motion-hover)]",
        !filled &&
          "border-[var(--border)] bg-[var(--surface)] hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]",
        filled &&
          resolvedTone === "warning" &&
          "border-[var(--warning-border)] bg-[linear-gradient(160deg,var(--warning-subtle),var(--surface)_55%)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
        filled &&
          resolvedTone === "danger" &&
          "border-[var(--danger-border)] bg-[linear-gradient(160deg,var(--danger-subtle),var(--surface)_55%)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
        filled &&
          resolvedTone === "success" &&
          "border-[var(--success-border)] bg-[linear-gradient(160deg,var(--success-subtle),var(--surface)_55%)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
        filled &&
          resolvedTone === "info" &&
          "border-[var(--info-border)] bg-[linear-gradient(160deg,var(--info-subtle),var(--surface)_55%)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
        className,
      )}
    >
      {filled ? (
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-0 left-0 w-[3px]",
            resolvedTone === "warning" && "bg-[var(--warning-solid)]",
            resolvedTone === "danger" && "bg-[var(--danger-solid)]",
            resolvedTone === "success" && "bg-[var(--success-solid)]",
            resolvedTone === "info" && "bg-[var(--info-solid)]",
          )}
        />
      ) : null}
      <div className="flex items-start justify-between gap-2 pl-0.5">
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon ? (
            <span className={iconTone}>
              <Icon className="size-3.5" aria-hidden />
            </span>
          ) : null}
          <p className="text-[11px] font-semibold tracking-[0.06em] text-[var(--text-muted)] uppercase">
            {label}
          </p>
        </div>
        {href ? (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface)]/80 text-[var(--text-muted)] opacity-0 shadow-[var(--shadow-sm)] transition-opacity group-hover:opacity-100">
            <ArrowUpRight className="size-3.5" aria-hidden />
          </span>
        ) : null}
      </div>
      {loading ? (
        <div className="mt-3 h-8 w-20 animate-pulse rounded bg-[var(--surface-3)]" />
      ) : (
        <p
          className={cn(
            "mt-3 pl-0.5 text-[1.625rem] font-semibold tracking-[-0.03em] tabular-nums",
            resolvedTone === "neutral" && "text-[var(--text-primary)]",
            resolvedTone === "warning" && "text-[var(--warning-text)]",
            resolvedTone === "danger" && "text-[var(--danger-text)]",
            resolvedTone === "success" && "text-[var(--success-text)]",
            resolvedTone === "info" && "text-[var(--info-text)]",
          )}
        >
          {value}
          {displayUnit ? (
            <span className="ml-1.5 text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
              {displayUnit}
            </span>
          ) : null}
        </p>
      )}
      {(delta || hint) && (
        <p className="mt-1 pl-0.5 text-[length:var(--text-caption)] text-[var(--text-muted)]">
          {delta ?? hint}
        </p>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2"
      >
        {body}
      </Link>
    );
  }
  return body;
}

export function CardLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-3)] text-[var(--text-muted)]"
      aria-label="Detaya git"
    >
      <ArrowUpRight className="size-4" aria-hidden />
    </Link>
  );
}

export function PillButton({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full px-4 text-[length:var(--text-body)] font-semibold sm:w-auto",
        variant === "primary"
          ? "bg-[var(--primary-solid)] text-white shadow-[0_8px_20px_-8px_color-mix(in_srgb,var(--primary-solid)_55%,transparent)] hover:bg-[var(--primary-hover)]"
          : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-2)]",
        className,
      )}
    >
      {children}
    </Link>
  );
}
