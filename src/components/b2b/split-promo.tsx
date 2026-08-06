import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Metro-style B2B split banner — dark copy panel + photo.
 * Shared by storefront and admin (tone variants).
 */
export function SplitPromo({
  tag,
  title,
  description,
  href,
  ctaLabel = "Keşfet",
  imageUrl,
  tone = "ink",
  className,
}: {
  tag?: string;
  title: string;
  description?: string;
  href: string;
  ctaLabel?: string;
  imageUrl?: string | null;
  tone?: "ink" | "brand";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group grid overflow-hidden rounded-[1.35rem] md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] md:rounded-[1.5rem]",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-col justify-center gap-4 p-6 sm:p-8 md:p-10",
          tone === "brand"
            ? "bg-[linear-gradient(145deg,var(--brand-feature-start),var(--brand-feature-end))]"
            : "bg-mkt-accent-ink",
        )}
      >
        {tag ? (
          <span className="mkt-pill mkt-label inline-flex w-fit border border-white/35 bg-transparent px-3 py-1 text-white">
            {tag}
          </span>
        ) : null}
        <h2 className="text-[1.45rem] leading-[1.12] font-semibold tracking-[-0.02em] text-white uppercase sm:text-[1.85rem] md:text-[2.1rem]">
          {title}
        </h2>
        {description ? (
          <p className="line-clamp-3 max-w-md text-[14px] leading-relaxed text-white/70">
            {description}
          </p>
        ) : null}
        <span className="mkt-pill mt-1 inline-flex w-fit items-center gap-2 bg-mkt-accent px-5 py-2.5 text-[14px] font-medium text-mkt-accent-ink transition-transform group-hover:translate-x-0.5">
          {ctaLabel}
          <ArrowRight className="size-4" aria-hidden />
        </span>
      </div>
      <div className="relative min-h-[220px] sm:min-h-[280px] md:min-h-full">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            priority
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            sizes="(min-width: 768px) 55vw, 100vw"
          />
        ) : (
          <div className="size-full bg-mkt-card-muted" />
        )}
      </div>
    </Link>
  );
}
