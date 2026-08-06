import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Building2,
  Refrigerator,
  ShoppingBag,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { listPublishedPosts } from "@/infra/db/content";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { Canvas, Slab } from "@/components/store/slab";
import { SplitPromo, SoftTile, SolidTile } from "@/components/b2b";

export const metadata = {
  title: "Haberler & Yazılar · Yetiş Grup",
  description: "Food cost, soğuk zincir, yöresel peynir ve B2B tedarik üzerine yazılar.",
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Bayilik: Building2,
  Depolama: Refrigerator,
  "Ürün Bilgisi": BookOpen,
  "Gıda Güvenliği": Refrigerator,
  HORECA: UtensilsCrossed,
  "Satın Alma": ShoppingBag,
  "Maliyet Yönetimi": Wallet,
};

export default async function BlogIndexPage() {
  const posts = await listPublishedPosts();
  const [featured, ...rest] = posts;
  const solidPosts = rest.slice(-2);
  const gridPosts = rest.slice(0, Math.max(0, rest.length - 2));

  const categoryTiles = Array.from(
    posts.reduce((map, post) => {
      if (!map.has(post.category)) map.set(post.category, post.slug);
      return map;
    }, new Map<string, string>()),
  ).slice(0, 4);

  return (
    <Canvas>
      <Slab>
        <SiteHeader />
        <div className="mkt-pad">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="mkt-h2 text-balance text-mkt-ink">Haberler</h1>
            <p className="mkt-label text-mkt-ink-muted">{posts.length} yazı</p>
          </div>

          {featured ? (
            <SplitPromo
              className="mt-8 md:mt-10"
              tag={featured.category}
              title={featured.title}
              description={featured.excerpt}
              href={`/haberler/${featured.slug}`}
              ctaLabel="Oku"
              imageUrl={featured.coverUrl}
              tone="ink"
            />
          ) : null}

          {categoryTiles.length > 0 ? (
            <section className="mt-10 md:mt-12">
              <p className="mkt-body text-[15px] text-mkt-ink">
                Konular, ürünler ve pratik rehberler bir bakışta
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                {categoryTiles.map(([cat, slug]) => {
                  const Icon = CATEGORY_ICONS[cat] ?? BookOpen;
                  return (
                    <SoftTile
                      key={cat}
                      href={`/haberler/${slug}`}
                      label={cat}
                      icon={Icon}
                    />
                  );
                })}
              </div>
            </section>
          ) : null}

          {gridPosts.length > 0 ? (
            <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {gridPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/haberler/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-[1.25rem] border border-[color:var(--mkt-border)] bg-white"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-mkt-card-muted">
                    {post.coverUrl ? (
                      <Image
                        src={post.coverUrl}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(min-width: 1024px) 30vw, 90vw"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <span className="mkt-pill mkt-label inline-flex w-fit border border-[color:var(--mkt-border)] px-2.5 py-1 text-mkt-ink-muted">
                      {post.category}
                    </span>
                    <h2 className="mt-3 text-[1.05rem] leading-snug font-semibold tracking-[-0.015em] text-mkt-ink">
                      {post.title}
                    </h2>
                    <p className="mkt-body mt-2 line-clamp-2 flex-1 text-[13px]">{post.excerpt}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-[color:var(--mkt-border)] pt-3">
                      <span className="mkt-label text-mkt-ink-muted">{post.readingMins} dk</span>
                      <span className="mkt-label border-b border-mkt-green-text/40 text-mkt-green-text group-hover:border-mkt-green-text">
                        Oku
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}

          {solidPosts.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:mt-5 sm:grid-cols-2">
              {solidPosts.map((post) => (
                <SolidTile
                  key={post.id}
                  href={`/haberler/${post.slug}`}
                  tag={post.category}
                  title={post.title}
                  subtitle={post.excerpt}
                />
              ))}
            </div>
          ) : null}

          {posts.length === 0 ? (
            <p className="mkt-body mt-12">Henüz yayınlanmış yazı yok.</p>
          ) : null}
        </div>
      </Slab>
      <SiteFooter />
    </Canvas>
  );
}
