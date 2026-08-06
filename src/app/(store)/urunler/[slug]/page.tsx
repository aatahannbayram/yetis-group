import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/infra/auth/server";
import { getProductBySlugWithPricing, getProductsWithPricing } from "@/infra/db/pricing";
import { getProductBySlug } from "@/infra/db/products";
import { ProductCard } from "@/components/store/product-card";
import { ProductDetailActions } from "@/components/store/product-detail-actions";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductAttributes, ProductJsonLd } from "@/components/store/product-attributes";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { Canvas, Slab } from "@/components/store/slab";
import { Reveal } from "@/components/store/reveal";
import { ViewItemTracker } from "@/components/store/view-item-tracker";
import { listRecipesForProduct } from "@/infra/db/content";
import { formatKg } from "@/lib/format/weight";
import { kg } from "@/domain/weight";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLdScript, breadcrumbJsonLd } from "@/lib/seo/json-ld";

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
  const product = await getProductBySlugWithPricing(slug, session?.user.id);

  if (!product) notFound();

  const [allProducts, recipes] = await Promise.all([
    getProductsWithPricing(session?.user.id),
    listRecipesForProduct(product.id),
  ]);
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const variants = product.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    packLabel: v.packSize ?? v.packagingType,
    unitPrice: v.unitPrice,
  }));

  return (
    <Canvas>
      <ProductJsonLd
        name={product.name}
        description={product.description}
        image={product.imageUrl}
        sku={product.sku}
        priceKurus={product.unitPrice}
        brand={product.producer.name}
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
        priceKurus={product.unitPrice}
      />
      <Slab>
        <SiteHeader />
        <div className="mkt-pad">
          <nav className="mkt-label flex flex-wrap gap-2 text-mkt-ink-muted">
            <Link href="/urunler" className="hover:text-mkt-ink">
              Ürünler
            </Link>
            <span>/</span>
            <Link
              href={`/urunler?kategori=${product.categorySlug ?? ""}`}
              className="hover:text-mkt-ink"
            >
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-mkt-ink">{product.name}</span>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
            <Reveal>
              <ProductGallery
                items={product.media.map((m) => ({
                  id: m.id,
                  url: m.url,
                  alt: m.alt,
                  kind: m.kind,
                }))}
                fallbackUrl={product.imageUrl}
                fallbackAlt={product.name}
              />
            </Reveal>

            <Reveal delay={100}>
              <span className="mkt-pill mkt-label inline-flex bg-mkt-card-muted px-3 py-1.5 text-mkt-ink-muted">
                {product.category}
              </span>
              <h1 className="mkt-h2 mt-4 text-balance text-mkt-ink">{product.name}</h1>
              <p className="mkt-body mt-2">
                {product.unitLabel} · {formatKg(kg(product.kgPerUnit.toString()))}
              </p>

              <p className="mkt-body mt-5">{product.description}</p>

              <div className="mt-8">
                <ProductDetailActions
                  variants={variants}
                  initialVariantId={product.variantId}
                />
              </div>

              {!session ? (
                <p className="mkt-label mt-4 text-mkt-ink-muted/70">
                  Bu fiyat standart listedir. Bayi girişi yaparak size özel fiyatı görün.
                </p>
              ) : null}

              <div className="mt-10">
                <ProductAttributes values={product.attributeValues} />
              </div>

              {(product.storageCondition || product.usageTips || product.shelfLifeDays) && (
                <div className="mt-8 space-y-3 rounded-[1.25rem] bg-mkt-card-muted p-5">
                  {product.requiresColdChain ? (
                    <p className="mkt-label text-mkt-green-text">Soğuk zincir gerekli</p>
                  ) : null}
                  {product.storageCondition ? (
                    <p className="mkt-body">
                      <span className="text-mkt-ink">Saklama: </span>
                      {product.storageCondition}
                    </p>
                  ) : null}
                  {product.shelfLifeDays ? (
                    <p className="mkt-body">
                      <span className="text-mkt-ink">Raf ömrü: </span>
                      {product.shelfLifeDays} gün
                    </p>
                  ) : null}
                  {product.usageTips ? (
                    <p className="mkt-body">
                      <span className="text-mkt-ink">Kullanım: </span>
                      {product.usageTips}
                    </p>
                  ) : null}
                  {product.techSheetUrl ? (
                    <a
                      href={product.techSheetUrl}
                      className="mkt-label text-mkt-green-text underline-offset-2 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Teknik föy (PDF)
                    </a>
                  ) : null}
                </div>
              )}

              {product.producer ? (
                <div className="mt-8 rounded-[1.25rem] bg-mkt-card-muted p-5 md:p-6">
                  <p className="mkt-label text-mkt-green-text">Üretici</p>
                  <p className="mt-2 text-[1.1rem] font-medium tracking-[-0.015em] text-mkt-ink">
                    {product.producer.name}
                  </p>
                  {product.producer.region ? (
                    <p className="mkt-body mt-1">{product.producer.region}</p>
                  ) : null}
                  {product.producer.story ? (
                    <p className="mkt-body mt-3">{product.producer.story}</p>
                  ) : null}
                </div>
              ) : null}

              {recipes.length > 0 ? (
                <div className="mt-8">
                  <p className="mkt-label text-mkt-green-text">Bu ürünle tarifler</p>
                  <ul className="mt-3 space-y-2">
                    {recipes.map((r) => (
                      <li key={r.id}>
                        <Link
                          href={`/tarifler/${r.slug}`}
                          className="mkt-pill mkt-label inline-flex bg-mkt-card-muted px-4 py-2 text-mkt-ink hover:bg-mkt-accent hover:text-mkt-accent-ink"
                        >
                          {r.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Reveal>
          </div>

          {related.length > 0 ? (
            <div className="mt-16 border-t border-[color:var(--mkt-border)] pt-12">
              <h2 className="text-[1.25rem] font-medium tracking-[-0.015em] text-mkt-ink">
                {product.category} kategorisinden diğerleri
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
                        kgPerUnit: p.kgPerUnit.toString(),
                        unitPrice: p.unitPrice,
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
