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
 * Farmora-language pill CTA.
 * Primary: accent fill + dark ink (never white on green).
 */
export function PillCta({
  href,
  children,
  variant = "primary",
  className,
  showArrow = true,
}: PillCtaProps) {
  const base =
    "mkt-pill inline-flex items-center gap-3 font-medium transition-transform active:scale-[0.98]";

  if (variant === "primary") {
    return (
      <Link
        href={href}
        className={cn(
          base,
          "bg-mkt-accent py-2.5 pr-2.5 pl-6 text-[15px] text-mkt-accent-ink hover:brightness-105",
          className,
        )}
      >
        <span>{children}</span>
        {showArrow ? (
          <span className="flex size-9 items-center justify-center rounded-full bg-mkt-accent-ink text-white">
            <ArrowUpRight className="size-4" aria-hidden />
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
          "border border-[color:var(--mkt-border)] bg-transparent px-6 py-3 text-[15px] text-mkt-ink hover:bg-mkt-card-muted",
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
      className={cn(base, "px-4 py-2 text-[15px] text-mkt-ink hover:opacity-70", className)}
    >
      {children}
    </Link>
  );
}
