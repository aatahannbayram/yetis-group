import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Metro-style dark destination tile - tag + bold title + subtitle.
 */
export function SolidTile({
  href,
  tag,
  title,
  subtitle,
  className,
}: {
  href: string;
  tag: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col items-start justify-center gap-3 rounded-[1.25rem] bg-mkt-accent-ink px-6 py-8 transition-opacity hover:opacity-95 sm:px-8 sm:py-10",
        className,
      )}
    >
      <span className="mkt-pill mkt-label inline-flex border border-white/40 bg-transparent px-3 py-1 text-white">
        {tag}
      </span>
      <h3 className="text-[1.35rem] leading-tight font-semibold tracking-[-0.02em] text-white uppercase sm:text-[1.6rem]">
        {title}
      </h3>
      {subtitle ? (
        <p className="max-w-sm text-[13px] leading-relaxed text-white/65 sm:text-[14px]">
          {subtitle}
        </p>
      ) : null}
    </Link>
  );
}
