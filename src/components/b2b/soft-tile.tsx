import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Metro-style light quick-access tile (icon + underlined label).
 * Store shortcuts, admin hub links, category jumps.
 */
export function SoftTile({
  href,
  label,
  icon: Icon,
  className,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col items-center justify-center gap-3 rounded-[1.15rem] border border-border bg-brand-50/60 px-4 py-6 text-center transition-colors hover:border-brand-600/30 hover:bg-brand-50",
        className,
      )}
    >
      <Icon
        className="size-8 stroke-[1.4] text-brand-700 transition-transform group-hover:scale-105"
        aria-hidden
      />
      <span className="text-[11px] font-medium tracking-[0.06em] uppercase border-b border-brand-700/35 pb-0.5 text-foreground group-hover:border-brand-700">
        {label}
      </span>
    </Link>
  );
}
