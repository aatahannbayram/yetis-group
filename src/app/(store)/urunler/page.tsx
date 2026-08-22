import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { ArrowUpRight } from "lucide-react";
import { auth } from "@/infra/auth/server";
import { getProductsWithPricing } from "@/infra/db/pricing";
import { listCategories } from "@/infra/db/categories";
import { getUserDealerId } from "@/infra/db/users";
import { ProductGrid } from "@/components/store/product-grid";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { Canvas, Slab } from "@/components/store/slab";
import { PillCta } from "@/components/store/pill-cta";
import { Reveal } from "@/components/store/reveal";
import { SceneImage } from "@/components/store/scene-image";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLdScript, breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/json-ld";
import { getImage } from "@/content/images";
import { catalogFallbackImage } from "@/content/catalog-images";
import { listPublishedAnnouncements } from "@/infra/db/campaigns";
import { WeeklyAnnouncements } from "@/components/store/weekly-announcements";

export const metadata: Metadata = buildPageMetadata({
  title: "Ürün kataloğu | Toptan yöresel gıda",
  description:
    "Yetiş Grup B2B ürün kataloğu: peynir, süt ürünleri ve yöresel gıdalar. Bayi hesabıyla net fiyat listesi ve sipariş.",
  path: "/urunler",
  image: getImage("products-hero").src,
});

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  const dealerId = session?.user.id ? await getUserDealerId(session.user.id) : null;
  const [products, categories, announcements] = await Promise.all([
    getProductsWithPricing(session?.user.id, kategori),
    listCategories(),
    listPublishedAnnouncements(),
  ]);

  const rootCategories = categories
    .filter((c) => !c.parentId)
    .map((c) => ({ slug: c.slug, name: c.name }));

  const listItems = products.slice(0, 40).map((p) => ({
    name: p.name,
    path: `/urunler/${p.slug}`,
    image: catalogFallbackImage(p.category, p.imageUrl),
  }));

  return (
    <Canvas>
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { name: "Ana sayfa", path: "/" },
            { name: "Ürünler", path: "/urunler" },
          ]),
          itemListJsonLd(listItems, "Yetiş Grup ürün kataloğu"),
        ]}
      />

      <Slab className="relative min-h-[40vh] overflow-hidden !p-0 md:min-h-[48vh]">
        <SceneImage
          id="products-hero"
          fill
          priority
          quality={80}
          className="scale-105 object-[center_40%]"
          sizes="100vw"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0.72)_0%,rgba(12,10,8,0.28)_32%,rgba(10,14,10,0.22)_48%,rgba(10,14,10,0.72)_100%)]"
        />
        <div className="absolute inset-x-0 top-0 z-20">
          <SiteHeader variant="overlay" />
        </div>
        <div className="relative z-10 flex min-h-[40vh] flex-col items-center justify-end px-5 pb-10 pt-24 text-center md:min-h-[48vh] md:px-10 md:pb-14 md:pt-28">
          <Reveal>
            <p className="mkt-label text-white/70">Katalog</p>
            <h1 className="mkt-display mt-3 text-balance text-white md:text-[clamp(2.75rem,6vw,4.5rem)]">
              Ürünler
            </h1>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/75">
              {session
                ? "Hikâye ve ambalaj burada. Fiyat, stok ve sipariş miktarı bayi panelinde."
                : "Katalog herkese açık. Fiyat ve stok onaylı bayi girişi sonrası panelde görünür."}
            </p>
          </Reveal>
        </div>
      </Slab>

      <Slab>
        <div className="mkt-pad">
          <WeeklyAnnouncements items={announcements} variant="catalog" />
          <div className={announcements.length > 0 ? "mt-8" : "mt-2"}>
            <Suspense fallback={null}>
              <ProductGrid
                activeCategory={kategori}
                categories={rootCategories}
                products={products.map((product) => ({
                  id: product.id,
                  variantId: product.variantId,
                  sku: product.sku,
                  slug: product.slug,
                  name: product.name,
                  category: product.category,
                  imageUrl: catalogFallbackImage(product.category, product.imageUrl),
                  unitLabel: product.unitLabel,
                  packagingType: product.packagingType,
                  packSize: product.packSize,
                  kgPerUnit: product.kgPerUnit.toString(),
                  cins: product.cins,
                  vatRateBasisPoints: product.vatRateBasisPoints,
                }))}
              />
            </Suspense>
          </div>
        </div>
      </Slab>

      <Slab className="relative overflow-hidden !bg-[#0f1f17] !p-0 text-white">
        <div className="grid items-stretch lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.42fr)]">
          <div className="relative flex flex-col justify-center px-5 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14 lg:px-12 lg:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(48,163,105,0.2),transparent_50%)]"
            />
            <Reveal className="relative">
              <p className="mkt-label text-mkt-accent">Bayi sipariş</p>
              <h2 className="mkt-h2 mt-3 max-w-lg text-balance text-white">
                Fiyat ve stok yalnızca panelde.
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/70">
                Onaylı hesapla liste fiyatınız, lot ve sipariş miktarı açılır. Misafir katalogda hikâye kalır.
              </p>
              <div className="mt-8 flex w-full flex-col gap-2.5 sm:flex-row">
                {dealerId ? (
                  <PillCta href="/bayi/siparis" className="w-full justify-center sm:w-auto">
                    Sipariş paneli
                  </PillCta>
                ) : (
                  <PillCta href="/auth" className="w-full justify-center sm:w-auto">
                    Bayi Girişi
                  </PillCta>
                )}
                <Link
                  href="/auth?tab=uye"
                  className="mkt-pill inline-flex h-[3.25rem] w-full items-center justify-center gap-2 bg-white px-6 text-[15px] font-semibold text-[#0a0a0a] hover:bg-white/92 sm:w-auto"
                >
                  Bayi başvurusu
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              </div>
            </Reveal>
          </div>
          <div className="relative h-[220px] min-h-[220px] sm:h-[260px] lg:h-auto lg:min-h-full">
            <SceneImage
              id="products-cta"
              fill
              quality={70}
              className="object-center"
              sizes="(min-width: 1024px) 42vw, 100vw"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[#0f1f17] via-[#0f1f17]/20 to-transparent lg:bg-gradient-to-r lg:from-[#0f1f17] lg:via-[#0f1f17]/35 lg:to-transparent"
            />
          </div>
        </div>
      </Slab>

      <SiteFooter />
    </Canvas>
  );
}
