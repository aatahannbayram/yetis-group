import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PillCtaProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "glass";
  className?: string;
  showArrow?: boolean;
};

/**
 * Signature CTA: accent fill, inner light, dark arrow disc.
 * `glass` is for photo heroes (frosted white outline).
 */
export function PillCta({
  href,
  children,
  variant = "primary",
  className,
  showArrow = true,
}: PillCtaProps) {
  const base =
    "mkt-pill group/cta inline-flex items-center justify-center font-semibold outline-none select-none " +
    "transition-[transform,box-shadow,background-color,border-color,filter] duration-200 ease-out " +
    "focus-visible:ring-2 focus-visible:ring-[var(--mkt-accent)]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent " +
    "motion-safe:active:scale-[0.98]";

  if (variant === "primary") {
    return (
      <Link
        href={href}
        className={cn(
          base,
          "relative isolate overflow-hidden text-mkt-accent-ink",
          "h-12 gap-3 pr-1.5 pl-6 text-[15px] tracking-[-0.015em]",
          "sm:h-[3.25rem] sm:pr-1.5 sm:pl-7",
          "bg-[linear-gradient(180deg,#4bb57d_0%,var(--mkt-accent)_48%,#248a58_100%)]",
          "shadow-[inset_0_1px_0_0_rgb(255_255_255/0.38),inset_0_-1px_0_0_rgb(0_0_0/0.12),0_1px_2px_rgb(0_0_0/0.18),0_12px_28px_-10px_rgb(16_70_42/0.55)]",
          "motion-safe:hover:-translate-y-0.5",
          "hover:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.48),0_4px_10px_rgb(0_0_0/0.18),0_20px_40px_-14px_rgb(16_70_42/0.62)]",
          "motion-safe:active:translate-y-0",
          className,
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgb(255_255_255/0.22)_48%,transparent_62%)] opacity-0 transition-opacity duration-300 group-hover/cta:opacity-100"
        />
        <span className="relative">{children}</span>
        {showArrow ? (
          <span
            className={cn(
              "relative inline-flex shrink-0 items-center justify-center rounded-full",
              "size-9 sm:size-10",
              "bg-[#0a0a0a] text-white",
              "shadow-[inset_0_1px_0_0_rgb(255_255_255/0.18),0_1px_2px_rgb(0_0_0/0.28)]",
              "transition-transform duration-200 ease-out",
              "motion-safe:group-hover/cta:scale-105",
            )}
            aria-hidden
          >
            <ArrowUpRight className="size-4 transition-transform duration-200 motion-safe:group-hover/cta:translate-x-0.5 motion-safe:group-hover/cta:-translate-y-0.5" />
          </span>
        ) : null}
      </Link>
    );
  }

  if (variant === "glass") {
    return (
      <Link
        href={href}
        className={cn(
          base,
          "h-12 px-6 text-[14px] tracking-[-0.015em] text-white sm:h-[3.25rem] sm:px-7 sm:text-[15px]",
          "border border-white/30 bg-white/12 backdrop-blur-md",
          "shadow-[inset_0_1px_0_0_rgb(255_255_255/0.22),0_8px_24px_-12px_rgb(0_0_0/0.45)]",
          "hover:border-white/50 hover:bg-white/18",
          "motion-safe:hover:-translate-y-0.5",
          className,
        )}
      >
        {children}
      </Link>
    );
  }

  if (variant === "secondary") {
    return (
      <Link
        href={href}
        className={cn(
          base,
          "h-12 border border-[color:var(--mkt-border)] bg-transparent px-5 text-[14px] text-mkt-ink hover:bg-mkt-card-muted sm:h-[3.25rem] sm:px-6 sm:text-[15px]",
          className,
        )}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(base, "px-4 py-2 text-[15px] font-medium text-mkt-ink hover:opacity-70", className)}
    >
      {children}
    </Link>
  );
}
