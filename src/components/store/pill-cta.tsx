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
 * Signature CTA: accent fill + dark circle arrow.
 * Mobile keeps the disc (slightly smaller); no inline-only arrow.
 */
export function PillCta({
  href,
  children,
  variant = "primary",
  className,
  showArrow = true,
}: PillCtaProps) {
  const base =
    "mkt-pill inline-flex items-center justify-center font-semibold transition-[transform,filter] duration-[var(--mkt-motion-hover,200ms)] active:scale-[0.98]";

  if (variant === "primary") {
    return (
      <Link
        href={href}
        className={cn(
          base,
          "bg-mkt-accent text-mkt-accent-ink hover:brightness-105",
          "h-12 gap-3 pr-1.5 pl-6 text-[15px]",
          "sm:h-[3.25rem] sm:pr-2 sm:pl-7 sm:text-[15px]",
          className,
        )}
      >
        <span>{children}</span>
        {showArrow ? (
          <span
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-full bg-mkt-accent-ink text-white",
              "size-9 sm:size-10",
            )}
            aria-hidden
          >
            <ArrowUpRight className="size-4" />
          </span>
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
