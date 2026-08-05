import { headers } from "next/headers";
import { auth } from "@/infra/auth/server";
import { getProductsWithPricing } from "@/infra/db/pricing";
import { ProductGrid } from "@/components/store/product-grid";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";

export default async function ProductsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const products = await getProductsWithPricing(session?.user.id);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <p className="text-caption leading-caption font-semibold tracking-[0.18em] text-brand-600 uppercase">
            Katalog
          </p>
          <h1 className="mt-3 text-h2 leading-h2 font-semibold text-neutral-900">Ürünler</h1>
          <p className="mt-2 max-w-lg text-body leading-body text-neutral-500">
            {session
              ? "Hesabınıza tanımlı fiyat listesi aşağıda gösteriliyor."
              : "Fiyatlar bayi girişi yapıldığında hesabınıza özel listeye göre güncellenir."}
          </p>

          <div className="mt-10">
            <ProductGrid
              products={products.map((product) => ({
                id: product.id,
                sku: product.sku,
                slug: product.slug,
                name: product.name,
                category: product.category,
                imageUrl: product.imageUrl,
                unitLabel: product.unitLabel,
                kgPerUnit: product.kgPerUnit.toString(),
                unitPrice: product.unitPrice,
              }))}
            />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
