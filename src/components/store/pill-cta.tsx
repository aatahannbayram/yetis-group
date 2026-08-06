import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PillCtaProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  showArrow?: boolean;
};

/**
 * Primary CTA - accent fill + dark ink.
 * Mobile: clean pill + inline arrow (no heavy black disc).
 * Desktop: optional disc arrow for signature look.
 */
export function PillCta({
  href,
  children,
  variant = "primary",
  className,
  showArrow = true,
}: PillCtaProps) {
  const base =
    "mkt-pill inline-flex items-center justify-center font-semibold transition-[transform,filter] active:scale-[0.98]";

  if (variant === "primary") {
    return (
      <Link
        href={href}
        className={cn(
          base,
          "bg-mkt-accent text-mkt-accent-ink hover:brightness-105",
          /* Mobile: balanced padding, inline arrow */
          "h-11 gap-2 px-6 text-[14px]",
          /* Desktop: slightly larger; disc arrow if enabled */
          "sm:h-12 sm:gap-3 sm:pr-2.5 sm:pl-6 sm:text-[15px]",
          className,
        )}
      >
        <span>{children}</span>
        {showArrow ? (
          <>
            <ArrowUpRight className="size-4 sm:hidden" aria-hidden strokeWidth={2.25} />
            <span className="hidden size-9 items-center justify-center rounded-full bg-mkt-accent-ink text-white sm:flex">
              <ArrowUpRight className="size-4" aria-hidden />
            </span>
          </>
        ) : null}
      </Link>
    );
  }

  if (variant === "secondary") {
    return (
      <Link
        href={href}
        className={cn(
          base,
          "h-11 border border-[color:var(--mkt-border)] bg-transparent px-5 text-[14px] text-mkt-ink hover:bg-mkt-card-muted sm:h-12 sm:px-6 sm:text-[15px]",
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
