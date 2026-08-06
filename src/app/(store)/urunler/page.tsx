import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/infra/auth/server";
import { getProductsWithPricing } from "@/infra/db/pricing";
import { listCategories } from "@/infra/db/categories";
import { ProductGrid } from "@/components/store/product-grid";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { Canvas, Slab } from "@/components/store/slab";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  const [products, categories] = await Promise.all([
    getProductsWithPricing(session?.user.id, kategori),
    listCategories(),
  ]);

  const rootCategories = categories
    .filter((c) => !c.parentId)
    .map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <Canvas>
      <Slab>
        <SiteHeader />
        <div className="mkt-pad">
          <p className="mkt-label text-mkt-green-text">Katalog</p>
          <h1 className="mkt-h2 mt-3 text-balance text-mkt-ink">Ürünler</h1>
          <p className="mkt-body mt-3 max-w-lg">
            {session
              ? "Hesabınıza tanımlı fiyat listesi aşağıda gösteriliyor."
              : "Fiyatlar bayi girişi yapıldığında hesabınıza özel listeye göre güncellenir."}
          </p>

          <div className="mt-10">
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
                  imageUrl: product.imageUrl,
                  unitLabel: product.unitLabel,
                  kgPerUnit: product.kgPerUnit.toString(),
                  unitPrice: product.unitPrice,
                  moq: product.moq,
                  vatRateBasisPoints: product.vatRateBasisPoints,
                }))}
              />
            </Suspense>
          </div>
        </div>
      </Slab>
      <SiteFooter />
    </Canvas>
  );
}
