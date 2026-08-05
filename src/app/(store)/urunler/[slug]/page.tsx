import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/infra/auth/server";
import { getProductBySlugWithPricing, getProductsWithPricing } from "@/infra/db/pricing";
import { ProductImage } from "@/components/store/product-image";
import { ProductCard } from "@/components/store/product-card";
import { ProductDetailActions } from "@/components/store/product-detail-actions";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { formatMoney } from "@/lib/format/money";
import { formatKg } from "@/lib/format/weight";
import { kg } from "@/domain/weight";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const product = await getProductBySlugWithPricing(slug, session?.user.id);

  if (!product) notFound();

  const allProducts = await getProductsWithPricing(session?.user.id);
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const productItem = {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    category: product.category,
    imageUrl: product.imageUrl,
    unitLabel: product.unitLabel,
    kgPerUnit: product.kgPerUnit.toString(),
    unitPrice: product.unitPrice,
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="grid gap-10 md:grid-cols-2 md:gap-14">
            <ProductImage
              imageUrl={product.imageUrl}
              category={product.category}
              alt={product.name}
              className="w-full rounded-3xl"
              sizes="(min-width: 768px) 45vw, 90vw"
            />

            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-caption font-medium tracking-wide text-muted-foreground uppercase">
                  {product.category}
                </span>
                <p className="font-mono text-caption text-neutral-400">{product.sku}</p>
              </div>
              <h1 className="mt-3 text-h2 leading-h2 font-semibold text-neutral-900">
                {product.name}
              </h1>
              <p className="mt-1 text-body-sm text-neutral-500">
                {product.unitLabel} &middot; {formatKg(kg(product.kgPerUnit.toString()))}
              </p>

              <p className="mt-4 tabular-nums text-h1 leading-h1 font-bold text-brand-700">
                {formatMoney(product.unitPrice)}
              </p>

              <p className="mt-4 text-body leading-body font-light text-neutral-600">
                {product.description}
              </p>

              <div className="mt-8">
                <ProductDetailActions product={productItem} />
              </div>

              {!session ? (
                <p className="mt-4 text-caption text-neutral-400">
                  Bu fiyat standart listedir. Bayi girişi yaparak size özel fiyatı görün.
                </p>
              ) : null}
            </div>
          </div>

          {related.length > 0 ? (
            <div className="mt-20 border-t border-neutral-200 pt-12">
              <h2 className="text-h4 leading-h4 font-semibold text-neutral-900">
                {product.category} kategorisinden diğerleri
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={{
                      id: p.id,
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
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
