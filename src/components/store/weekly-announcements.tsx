import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { SiteAnnouncement } from "@/domain/campaigns/live";
import { ScrollReveal } from "@/components/store/scroll-reveal";
import { cn } from "@/lib/utils";

function Cover({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  if (!src) {
    return <div className={cn("bg-[#e4e0d6]", className)} aria-hidden />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized={src.startsWith("/uploads/")}
      className={cn("object-cover", className)}
      sizes="(min-width: 1024px) 50vw, 100vw"
    />
  );
}

function AdBanner({ item }: { item: SiteAnnouncement }) {
  return (
    <Link
      href={item.href}
      className="group relative isolate flex min-h-[16.5rem] flex-col justify-end overflow-hidden rounded-[1.35rem] text-white sm:min-h-[18.5rem] lg:min-h-[20rem]"
    >
      <Cover
        src={item.imageUrl}
        alt=""
        className="transition-transform duration-700 group-hover:scale-[1.04]"
      />
      <div
        aria-hidden
        className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(10,14,10,0.08)_0%,rgba(10,14,10,0.45)_42%,rgba(10,14,10,0.9)_100%)]"
      />
      <div className="relative z-[2] flex flex-col gap-2.5 p-5 sm:p-6">
        <p className="mkt-label text-white/70">Bu hafta</p>
        <h3 className="max-w-md text-[1.25rem] leading-tight font-semibold tracking-[-0.03em] sm:text-[1.45rem]">
          {item.name}
        </h3>
        {item.note ? (
          <p className="max-w-md text-[13px] leading-relaxed text-white/80 sm:text-[14px]">{item.note}</p>
        ) : null}
        <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/14 px-3.5 py-2 text-[12.5px] font-semibold backdrop-blur-sm transition-colors group-hover:bg-white/22">
          {item.ctaLabel}
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

export function WeeklyAnnouncements({
  items,
  variant = "home",
}: {
  items: SiteAnnouncement[];
  variant?: "home" | "catalog" | "dealer";
}) {
  if (items.length === 0) return null;
  const [featured] = items;
  const banners = items.slice(0, 2);
  const extras = items.slice(2);

  if (variant === "catalog") {
    return (
      <aside className="overflow-hidden rounded-[1.25rem] border border-[color:var(--mkt-border)] bg-mkt-slab">
        <Link href={featured.href} className="group grid sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
          <div className="relative min-h-[160px] overflow-hidden sm:min-h-[200px]">
            <Cover src={featured.imageUrl} alt="" />
          </div>
          <div className="flex flex-col justify-center gap-2 px-5 py-5 sm:px-6">
            <p className="mkt-label text-mkt-green-text">Haftalık duyuru</p>
            <p className="text-[1.15rem] font-semibold tracking-[-0.02em] text-mkt-ink">{featured.name}</p>
            {featured.note ? (
              <p className="line-clamp-2 text-[14px] leading-relaxed text-mkt-ink-muted">{featured.note}</p>
            ) : null}
            <span className="mt-1 inline-flex items-center gap-1 text-[13px] font-semibold text-mkt-green-text">
              {featured.ctaLabel}
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </Link>
      </aside>
    );
  }

  if (variant === "dealer") {
    return (
      <Link
        href={featured.href}
        className="flex items-start gap-3 rounded-2xl border border-[var(--panel-border)] bg-white p-4 shadow-[var(--shadow-sm)]"
      >
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary-subtle)] text-[var(--primary-text)]">
          <Sparkles className="size-4" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="text-[11px] font-semibold tracking-wide text-[var(--primary-text)] uppercase">
            Haftalık duyuru
          </span>
          <span className="mt-0.5 block text-[15px] font-semibold text-[var(--text-primary)]">{featured.name}</span>
          {featured.note ? (
            <span className="mt-1 block text-[13px] leading-relaxed text-[var(--text-muted)]">
              {featured.note}
            </span>
          ) : null}
        </span>
      </Link>
    );
  }

  return (
    <section className="relative overflow-hidden bg-[#f0eee8]" aria-labelledby="weekly-ads-title">
      <div className="relative mkt-pad">
        <ScrollReveal>
          <p className="mkt-label text-mkt-ink-muted">Haftalık</p>
          <h2 id="weekly-ads-title" className="mkt-h2 mt-3 max-w-xl text-balance text-mkt-ink">
            Duyurular
          </h2>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-mkt-ink-muted">
            Yeni partiler, yenilenen stoklar ve bayiye özel katalog güncellemeleri.
          </p>
        </ScrollReveal>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2">
          {banners.map((item) => (
            <AdBanner key={item.id} item={item} />
          ))}
        </div>

        {extras.length > 0 ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {extras.slice(0, 3).map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex h-full min-h-[5.5rem] overflow-hidden rounded-[1.1rem] border border-[color:var(--mkt-border)] bg-mkt-slab transition-colors hover:bg-[#ebe8e0]"
                >
                  <div className="relative w-[4.75rem] shrink-0 sm:w-24">
                    <Cover src={item.imageUrl} alt="" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center px-3.5 py-3">
                    <p className="truncate text-[14px] font-semibold tracking-[-0.02em] text-mkt-ink">
                      {item.name}
                    </p>
                    {item.note ? (
                      <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-mkt-ink-muted">
                        {item.note}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
