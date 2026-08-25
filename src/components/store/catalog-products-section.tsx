import { Suspense } from "react";
import { getStoreCatalogProducts } from "@/infra/db/store-catalog";
import { listStoreRootCategories } from "@/infra/db/categories";
import { listPublishedAnnouncements } from "@/infra/db/campaigns";
import { ProductGrid } from "@/components/store/product-grid";
import { WeeklyAnnouncements } from "@/components/store/weekly-announcements";
import { catalogFallbackImage } from "@/content/catalog-images";
import { Skeleton } from "@/components/ui/skeleton";

function CatalogGridSkeleton() {
  return (
    <>
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-full" />
        ))}
      </div>
      <Skeleton className="mt-6 h-11 max-w-sm rounded-full" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-[1.25rem] border border-[color:var(--mkt-border)]">
            <Skeleton className="aspect-[4/5] w-full rounded-none" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

async function CatalogProductsInner({ kategori }: { kategori?: string }) {
  const [products, categories, announcements] = await Promise.all([
    getStoreCatalogProducts(kategori),
    listStoreRootCategories(),
    listPublishedAnnouncements(),
  ]);

  return (
    <>
      <WeeklyAnnouncements items={announcements} variant="catalog" />
      <div className={announcements.length > 0 ? "mt-8" : "mt-2"}>
        <ProductGrid
          activeCategory={kategori}
          categories={categories}
          products={products.map((product) => ({
            ...product,
            imageUrl: catalogFallbackImage(product.category, product.imageUrl),
          }))}
        />
      </div>
    </>
  );
}

export function CatalogProductsSection({ kategori }: { kategori?: string }) {
  return (
    <Suspense fallback={<CatalogGridSkeleton />}>
      <CatalogProductsInner kategori={kategori} />
    </Suspense>
  );
}
