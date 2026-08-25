import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getStoreCatalogProductsPage } from "@/infra/db/product-list-page";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { Canvas, Slab } from "@/components/store/slab";
import { Reveal } from "@/components/store/reveal";
import { SceneImage } from "@/components/store/scene-image";
import { CatalogProductsSection } from "@/components/store/catalog-products-section";
import { CatalogCtaSection } from "@/components/store/catalog-cta-section";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLdScript, breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/json-ld";
import { getImage } from "@/content/images";
import { catalogFallbackImage } from "@/content/catalog-images";

export const metadata: Metadata = buildPageMetadata({
  title: "Ürün kataloğu | Toptan yöresel gıda",
  description:
    "Yetiş Grup B2B ürün kataloğu: peynir, süt ürünleri ve yöresel gıdalar. Bayi hesabıyla net fiyat listesi ve sipariş.",
  path: "/urunler",
  image: getImage("products-hero").src,
});

async function CatalogJsonLd({ kategori }: { kategori?: string }) {
  const page = await getStoreCatalogProductsPage({ categorySlug: kategori, limit: 40 });
  const listItems = page.items.map((p) => ({
    name: p.name,
    path: `/urunler/${p.slug}`,
    image: catalogFallbackImage(p.category, p.imageUrl),
  }));

  return (
    <JsonLdScript
      data={[
        breadcrumbJsonLd([
          { name: "Ana sayfa", path: "/" },
          { name: "Ürünler", path: "/urunler" },
        ]),
        itemListJsonLd(listItems, "Yetiş Grup ürün kataloğu"),
      ]}
    />
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;

  return (
    <Canvas>
      <Suspense fallback={null}>
        <CatalogJsonLd kategori={kategori} />
      </Suspense>

      <Slab className="relative min-h-[36vh] overflow-hidden !p-0 md:min-h-[42vh]">
        <SceneImage
          id="products-hero"
          fill
          quality={70}
          className="scale-105 object-[center_40%]"
          sizes="(min-width: 1024px) 1200px, 100vw"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0.72)_0%,rgba(12,10,8,0.28)_32%,rgba(10,14,10,0.22)_48%,rgba(10,14,10,0.78)_100%)]"
        />
        <div className="absolute inset-x-0 top-0 z-20">
          <SiteHeader variant="overlay" />
        </div>
        <div className="relative z-10 flex min-h-[36vh] flex-col items-center justify-end px-5 pt-24 pb-6 text-center md:min-h-[42vh] md:px-10 md:pt-28 md:pb-8">
          <Reveal>
            <p className="mkt-label text-white/70">B2B peynir kataloğu</p>
            <h1 className="mkt-h2 mt-2 text-balance text-white">Ürün Kataloğu</h1>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/75">
              Katalog herkese açık. Fiyat ve stok onaylı bayi girişi sonrası panelde görünür.{" "}
              <Link href="/auth" className="font-medium text-white underline-offset-2 hover:underline">
                Bayi girişi
              </Link>
            </p>
          </Reveal>
        </div>
      </Slab>

      <Slab>
        <div className="mkt-pad">
          <CatalogProductsSection kategori={kategori} />
        </div>
      </Slab>

      <CatalogCtaSection />

      <SiteFooter />
    </Canvas>
  );
}
