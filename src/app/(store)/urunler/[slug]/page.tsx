import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/infra/auth/server";
import { getProductBySlugWithPricing, getProductsWithPricing } from "@/infra/db/pricing";
import { getProductBySlug } from "@/infra/db/products";
import { getUserDealerId } from "@/infra/db/users";
import { ProductCard } from "@/components/store/product-card";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductAttributes, ProductJsonLd } from "@/components/store/product-attributes";
import { PdpLead, PdpBody } from "@/components/store/pdp-description";
import { PdpFacts } from "@/components/store/pdp-facts";
import { PdpCinsPicker } from "@/components/store/pdp-cins-picker";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { Canvas, Slab } from "@/components/store/slab";
import { Reveal } from "@/components/store/reveal";
import { ViewItemTracker } from "@/components/store/view-item-tracker";
import { listRecipesForProduct } from "@/infra/db/content";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLdScript, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { catalogFallbackImage } from "@/content/catalog-images";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return buildPageMetadata({
    title: product.name,
    description:
      product.description.slice(0, 160) ||
      `${product.name}: Yetiş Grup B2B katalogunda yöresel/kırsal ürün.`,
    path: `/urunler/${product.slug}`,
    image: product.imageUrl,
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const dealerId = session?.user.id ? await getUserDealerId(session.user.id) : null;
  const isDealer = dealerId !== null;
  const product = await getProductBySlugWithPricing(slug, session?.user.id);

  if (!product) notFound();

  const [allProducts, recipes] = await Promise.all([
    getProductsWithPricing(session?.user.id),
    listRecipesForProduct(product.id),
  ]);
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <Canvas>
      <ProductJsonLd
        name={product.name}
        description={product.description}
        image={product.imageUrl}
        sku={product.sku}
        brand={product.producer.name}
        path={`/urunler/${product.slug}`}
        category={product.category}
      />
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: "Ana sayfa", path: "/" },
          { name: "Ürünler", path: "/urunler" },
          { name: product.name, path: `/urunler/${product.slug}` },
        ])}
      />
      <ViewItemTracker
        itemId={product.sku}
        itemName={product.name}
      />
      <Slab>
        <SiteHeader />
        <div className="mkt-pad">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/urunler"
              aria-label="Ürünlere dön"
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--mkt-border)] bg-white text-mkt-ink transition-colors hover:bg-[#FAF8F3]"
            >
              <ArrowLeft className="size-4" aria-hidden />
            </Link>
            <nav className="mkt-label flex flex-wrap gap-2 text-mkt-ink-muted/80">
              <Link href="/urunler" className="hover:text-mkt-ink">
                Ürünler
              </Link>
              <span aria-hidden>/</span>
              <Link
                href={`/urunler?kategori=${product.categorySlug ?? ""}`}
                className="hover:text-mkt-ink"
              >
                {product.category}
              </Link>
            </nav>
          </div>

          <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
            <Reveal>
              <ProductGallery
                items={product.media.map((m) => ({
                  id: m.id,
                  url: m.url,
                  alt: m.alt,
                  kind: m.kind,
                }))}
                fallbackUrl={catalogFallbackImage(product.category, product.imageUrl)}
                fallbackAlt={product.name}
                region={product.producer?.region}
              />
            </Reveal>

            <Reveal delay={100}>
              <div className="lg:sticky lg:top-28 lg:pb-4">
                <span className="mkt-pill mkt-label inline-flex bg-[#FAF8F3] px-3 py-1.5 text-mkt-ink-muted">
                  {product.category}
                </span>
                <h1 className="mkt-display mt-4 text-balance text-[clamp(2rem,4.6vw,3.15rem)] text-mkt-ink">
                  {product.name}
                </h1>

                <PdpCinsPicker
                  slug={product.slug}
                  isDealer={isDealer}
                  cinsler={product.variants.map((v) => ({
                    id: v.id,
                    packLabel: v.packLabel,
                    packagingType: v.packagingType,
                    packSize: v.packSize,
                    unitFactor: v.unitFactor.toString(),
                  }))}
                >
                  <PdpLead text={product.description} />
                  {product.requiresColdChain ? (
                    <p className="mkt-label mt-4 text-mkt-green-text">Soğuk zincir</p>
                  ) : null}
                </PdpCinsPicker>

                <PdpBody text={product.description} />

                <div className="mt-10">
                  <ProductAttributes values={product.attributeValues} />
                </div>
              </div>
            </Reveal>
          </div>

          <PdpFacts
            requiresColdChain={product.requiresColdChain}
            storageCondition={product.storageCondition}
            shelfLifeDays={product.shelfLifeDays}
            usageTips={product.usageTips}
            techSheetUrl={product.techSheetUrl}
            producer={product.producer}
          />

          {recipes.length > 0 ? (
            <div className="mt-14">
              <p className="mkt-label text-mkt-green-text">Bu ürünle tarifler</p>
              <ul className="mt-4 flex flex-wrap gap-3">
                {recipes.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/tarifler/${r.slug}`}
                      className="mkt-pill mkt-label inline-flex bg-[#FAF8F3] px-4 py-2.5 text-mkt-ink hover:bg-mkt-accent hover:text-mkt-accent-ink"
                    >
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {related.length > 0 ? (
            <div className="mt-16 border-t border-[color:var(--mkt-border)] pt-12">
              <h2 className="text-[1.25rem] font-medium tracking-[-0.015em] text-mkt-ink">
                {product.category} kategorisinden diğerleri
              </h2>
              <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-8">
                {related.map((p, index) => (
                  <Reveal key={p.id} delay={(index % 3) * 60}>
                    <ProductCard
                      product={{
                        id: p.id,
                        variantId: p.variantId,
                        sku: p.sku,
                        slug: p.slug,
                        name: p.name,
                        category: p.category,
                        imageUrl: p.imageUrl,
                        unitLabel: p.unitLabel,
                        packagingType: p.packagingType,
                        packSize: p.packSize,
                        kgPerUnit: p.kgPerUnit.toString(),
                        cins: p.cins,
                        vatRateBasisPoints: p.vatRateBasisPoints,
                      }}
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Slab>
      <SiteFooter />
    </Canvas>
  );
}
