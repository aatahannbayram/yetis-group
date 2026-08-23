import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { SiteAnnouncement } from "@/domain/campaigns/live";
import { PillCta } from "@/components/store/pill-cta";
import { ScrollReveal } from "@/components/store/scroll-reveal";
import { cn } from "@/lib/utils";

function Cover({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  if (!src) {
    return <div className={cn("bg-[#1a2e24]", className)} aria-hidden />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized={src.startsWith("/uploads/")}
      className={cn("object-cover", className)}
      sizes="(min-width: 1024px) 55vw, 100vw"
    />
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
  const [featured, ...rest] = items;

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
    <section className="relative overflow-hidden bg-[#0f1f17] text-white" aria-labelledby="weekly-news-title">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(48,163,105,0.22),transparent_50%)]"
      />
      <div className="relative mkt-pad">
        <ScrollReveal>
          <p className="mkt-label text-mkt-accent">Haftalık duyurular</p>
          <h2 id="weekly-news-title" className="mkt-h2 mt-3 max-w-xl text-balance text-white">
            Yeni nesil katalog güncellemesi.
          </h2>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/70">
            Bu hafta rafta olanlar, yakında eklenecek ürünler ve bayiye özel haberler burada.
          </p>
        </ScrollReveal>

        <div
          className={
            rest.length > 0
              ? "mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] lg:items-stretch"
              : "mt-10"
          }
        >
          <article className="group relative isolate min-h-[22rem] overflow-hidden rounded-[1.5rem]">
            <Cover
              src={featured.imageUrl}
              alt=""
              className="transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(10,14,10,0.05)_0%,rgba(10,14,10,0.55)_48%,rgba(10,14,10,0.88)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 z-[2] flex flex-col gap-3 p-6 sm:p-8">
              <p className="mkt-label text-mkt-accent">Bu hafta</p>
              <h3 className="max-w-md text-[1.65rem] leading-tight font-semibold tracking-[-0.03em] sm:text-[2rem]">
                {featured.name}
              </h3>
              {featured.note ? (
                <p className="max-w-md text-[14px] leading-relaxed text-white/80 sm:text-[15px]">{featured.note}</p>
              ) : null}
              <div className="pt-1">
                <PillCta href={featured.href} variant="glass" className="w-full justify-center sm:w-auto">
                  {featured.ctaLabel}
                </PillCta>
              </div>
            </div>
          </article>

          {rest.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {rest.slice(0, 3).map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="flex h-full min-h-[6.5rem] overflow-hidden rounded-[1.15rem] border border-white/10 bg-white/[0.06] transition-colors hover:bg-white/[0.1]"
                  >
                    <div className="relative w-[5.5rem] shrink-0 sm:w-28">
                      <Cover src={item.imageUrl} alt="" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
                      <p className="truncate text-[15px] font-semibold tracking-[-0.02em]">{item.name}</p>
                      {item.note ? (
                        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-white/65">{item.note}</p>
                      ) : null}
                      <p className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-mkt-accent">
                        {item.ctaLabel}
                        <ArrowUpRight className="size-3.5" />
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
