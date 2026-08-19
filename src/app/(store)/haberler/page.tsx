import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, BookOpen, Clock3 } from "lucide-react";
import { listPublishedPosts } from "@/infra/db/content";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { Canvas, Slab } from "@/components/store/slab";
import { PillCta } from "@/components/store/pill-cta";
import { Reveal } from "@/components/store/reveal";
import { SceneImage } from "@/components/store/scene-image";
import { getImage } from "@/content/images";
import {
  JsonLdScript,
  breadcrumbJsonLd,
  organizationJsonLd,
} from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, SITE } from "@/lib/site";
import { formatDate } from "@/lib/format/date";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildPageMetadata({
  title: "Haberler",
  description:
    "Food cost, soğuk zincir, yöresel peynir ve B2B tedarik üzerine pratik rehberler. Market, şarküteri ve HORECA için.",
  path: "/haberler",
  image: getImage("news-hero").src,
});

type PostRow = Awaited<ReturnType<typeof listPublishedPosts>>[number];

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori: rawCategory } = await searchParams;
  const posts = await listPublishedPosts();
  const categories = Array.from(new Set(posts.map((p) => p.category))).sort((a, b) =>
    a.localeCompare(b, "tr"),
  );
  const activeCategory =
    rawCategory && categories.includes(rawCategory) ? rawCategory : null;
  const filtered = activeCategory
    ? posts.filter((p) => p.category === activeCategory)
    : posts;
  const [featured, ...rest] = filtered;

  return (
    <Canvas>
      <JsonLdScript
        data={[
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Ana sayfa", path: "/" },
            { name: "Haberler", path: "/haberler" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Haberler · ${SITE.name}`,
            description:
              "Food cost, soğuk zincir ve B2B tedarik üzerine Yetiş Grup rehberleri.",
            url: absoluteUrl("/haberler"),
            isPartOf: { "@type": "WebSite", name: SITE.name, url: absoluteUrl("/") },
          },
        ]}
      />

      {/* Hero */}
      <Slab className="relative min-h-[40vh] overflow-hidden !p-0 md:min-h-[48vh]">
        <SceneImage
          id="news-hero"
          fill
          priority
          quality={80}
          className="scale-105 object-[42%_center]"
          sizes="100vw"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0.72)_0%,rgba(12,10,8,0.28)_32%,rgba(10,14,10,0.22)_48%,rgba(10,14,10,0.70)_100%)]"
        />
        <div className="absolute inset-x-0 top-0 z-20">
          <SiteHeader variant="overlay" />
        </div>
        <div className="relative z-10 flex min-h-[40vh] flex-col items-center justify-end px-5 pb-10 pt-24 text-center md:min-h-[48vh] md:px-10 md:pb-14 md:pt-28">
          <Reveal>
            <p className="mkt-label text-white/70">Rehberler & yazılar</p>
            <h1 className="mkt-display mt-3 text-balance text-white md:text-[clamp(2.75rem,6vw,4.5rem)]">
              Haberler
            </h1>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/75">
              Tedarik, maliyet ve soğuk zincir: sahada işe yarayan notlar.
            </p>
          </Reveal>
        </div>
      </Slab>

      {/* Intro + filters */}
      <Slab className="mkt-pad !bg-[var(--mkt-card-muted)]">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="mkt-pill mkt-label inline-flex bg-white px-3.5 py-1.5 text-mkt-ink-muted">
                Konular
              </span>
              <h2 className="mkt-h2 mt-4 text-balance text-mkt-ink">
                Ne lazımsa{" "}
                <span className="text-mkt-ink-muted">hızlıca bulun.</span>
              </h2>
              <p className="mkt-body mt-3 max-w-lg">
                {posts.length} yazı · kategoriye göre süzün veya öne çıkanı okuyun.
              </p>
            </div>
            <Link
              href="/haberler/rss.xml"
              className="mkt-pill mkt-label inline-flex w-fit items-center gap-2 border border-[color:var(--mkt-border)] bg-white px-4 py-2.5 text-mkt-ink hover:bg-mkt-card-muted"
            >
              RSS
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </Reveal>

        {categories.length > 0 ? (
          <nav
            aria-label="Kategori filtresi"
            className="mt-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:mt-10 md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden"
          >
            <FilterChip href="/haberler" label="Tümü" active={!activeCategory} count={posts.length} />
            {categories.map((cat) => {
              const count = posts.filter((p) => p.category === cat).length;
              return (
                <FilterChip
                  key={cat}
                  href={`/haberler?kategori=${encodeURIComponent(cat)}`}
                  label={cat}
                  active={activeCategory === cat}
                  count={count}
                />
              );
            })}
          </nav>
        ) : null}
      </Slab>

      {/* Feed */}
      <Slab className="mkt-pad">
        {featured ? (
          <>
            <Reveal>
              <FeaturedCard post={featured} />
            </Reveal>

            {rest.length > 0 ? (
              <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                {rest.map((post, i) => (
                  <Reveal key={post.id} delay={Math.min(i * 50, 200)}>
                    <PostCard post={post} />
                  </Reveal>
                ))}
              </div>
            ) : null}
          </>
        ) : posts.length === 0 ? (
          <EmptyState
            title="Henüz yayınlanmış yazı yok"
            body="Yeni rehberler eklendiğinde burada görünecek."
          />
        ) : (
          <EmptyState
            title="Bu kategoride yazı yok"
            body="Başka bir konu seçin veya tüm yazılara dönün."
            actionHref="/haberler"
            actionLabel="Tüm yazılar"
          />
        )}
      </Slab>

      {/* CTA */}
      <Slab className="relative overflow-hidden !bg-[#0f1f17] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(48,163,105,0.2),transparent_50%)]"
        />
        <div className="mkt-pad relative grid items-center gap-8 py-10 md:py-14 lg:grid-cols-[1fr_auto] lg:py-16">
          <Reveal>
            <p className="mkt-label text-mkt-accent">Katalog & destek</p>
            <h2 className="mkt-h2 mt-3 max-w-lg text-balance text-white">
              Okuduğunuzu rafta deneyin.
            </h2>
            <p className="mt-3 max-w-md text-[15px] text-white/65">
              Ürünleri inceleyin veya satış ekibine yazın. Bayilik ve numune tek formda.
            </p>
          </Reveal>
          <Reveal delay={60}>
            <div className="flex w-full flex-col gap-2.5 sm:flex-row lg:w-auto">
              <PillCta href="/urunler" className="w-full justify-center sm:w-auto">
                Katalog
              </PillCta>
              <Link
                href="/iletisim"
                className="mkt-pill mkt-label inline-flex h-[3.25rem] w-full items-center justify-center gap-2 border border-white/25 px-6 text-[15px] text-white hover:bg-white/10 sm:w-auto"
              >
                İletişim
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </div>
          </Reveal>
        </div>
      </Slab>

      <SiteFooter />
    </Canvas>
  );
}

function FilterChip({
  href,
  label,
  active,
  count,
}: {
  href: string;
  label: string;
  active: boolean;
  count: number;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        "mkt-pill inline-flex shrink-0 items-center gap-2 px-4 py-2.5 text-[13px] font-semibold tracking-[-0.01em] transition-colors",
        active
          ? "bg-mkt-ink text-white"
          : "bg-white text-mkt-ink hover:bg-mkt-ink/5",
      )}
    >
      {label}
      <span
        className={cn(
          "tabular-nums text-[12px]",
          active ? "text-white/65" : "text-mkt-ink-muted",
        )}
      >
        {count}
      </span>
    </Link>
  );
}

function FeaturedCard({ post }: { post: PostRow }) {
  return (
    <Link
      href={`/haberler/${post.slug}`}
      className="group grid overflow-hidden rounded-[1.35rem] bg-white shadow-[0_1px_0_rgba(10,10,10,0.04)] lg:grid-cols-[1.15fr_1fr]"
    >
      <div className="relative aspect-[16/11] overflow-hidden bg-mkt-card-muted lg:aspect-auto lg:min-h-[22rem]">
        {post.coverUrl ? (
          <Image
            src={post.coverUrl}
            alt=""
            fill
            priority
            quality={75}
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-mkt-card-muted text-mkt-ink-muted">
            <BookOpen className="size-10 opacity-40" aria-hidden />
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10">
        <span className="mkt-pill mkt-label inline-flex w-fit bg-mkt-card-muted px-3 py-1.5 text-mkt-ink-muted">
          {post.category}
        </span>
        <h2 className="mt-4 text-[1.45rem] font-medium tracking-[-0.02em] text-mkt-ink md:text-[1.75rem] md:leading-snug">
          {post.title}
        </h2>
        <p className="mkt-body mt-3 line-clamp-3 text-[15px]">{post.excerpt}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-mkt-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-3.5" aria-hidden />
            {post.readingMins} dk okuma
          </span>
          {post.publishedAt ? (
            <time dateTime={post.publishedAt.toISOString()}>
              {formatDate(post.publishedAt)}
            </time>
          ) : null}
          <span className="inline-flex items-center gap-1 font-semibold text-mkt-green-text">
            Oku
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: PostRow }) {
  return (
    <Link
      href={`/haberler/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-white shadow-[0_1px_0_rgba(10,10,10,0.04)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-mkt-card-muted">
        {post.coverUrl ? (
          <Image
            src={post.coverUrl}
            alt=""
            fill
            quality={70}
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-mkt-ink-muted">
            <BookOpen className="size-8 opacity-35" aria-hidden />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <span className="mkt-pill mkt-label inline-flex w-fit bg-mkt-card-muted px-2.5 py-1 text-mkt-ink-muted">
          {post.category}
        </span>
        <h3 className="mt-3 text-[1.05rem] leading-snug font-medium tracking-[-0.015em] text-mkt-ink">
          {post.title}
        </h3>
        <p className="mkt-body mt-2 line-clamp-2 flex-1 text-[13px]">{post.excerpt}</p>
        <div className="mt-4 flex items-center justify-between border-t border-[color:var(--mkt-border)] pt-3 text-[13px]">
          <span className="tabular-nums text-mkt-ink-muted">{post.readingMins} dk</span>
          <span className="inline-flex items-center gap-1 font-semibold text-mkt-green-text">
            Oku
            <ArrowUpRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-dashed border-[color:var(--mkt-border)] bg-mkt-card-muted/60 px-6 py-14 text-center">
      <BookOpen className="mx-auto size-8 text-mkt-ink-muted/50" aria-hidden />
      <h2 className="mt-4 text-[1.25rem] font-medium tracking-[-0.02em] text-mkt-ink">{title}</h2>
      <p className="mkt-body mx-auto mt-2 max-w-sm">{body}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mkt-pill mkt-label mt-6 inline-flex bg-mkt-ink px-5 py-2.5 text-white hover:opacity-90"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
