import { Suspense } from "react";
import { getStoreCatalogProducts } from "@/infra/db/store-catalog";
import { listStoreCatalogFilters } from "@/infra/db/store-catalog-filters";
import { listPublishedAnnouncements } from "@/infra/db/campaigns";
import { ProductGrid } from "@/components/store/product-grid";
import { WeeklyAnnouncements } from "@/components/store/weekly-announcements";
import { catalogFallbackImage, KATALOG_PLACEHOLDER } from "@/content/catalog-images";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

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
  const [products, { groups: filterGroups, total }, announcements] = await Promise.all([
    getStoreCatalogProducts(kategori),
    listStoreCatalogFilters(),
    listPublishedAnnouncements(),
  ]);

  return (
    <>
      <WeeklyAnnouncements items={announcements} variant="catalog" />
      <div className={announcements.length > 0 ? "mt-8" : "mt-2"}>
        {products.length === 0 ? (
          <div className="mx-auto mt-6 max-w-md text-center">
            <div className="relative mx-auto aspect-[4/3] overflow-hidden rounded-[1.25rem] border border-[color:var(--mkt-border)] bg-mkt-card-muted">
              <Image
                src={KATALOG_PLACEHOLDER}
                alt="Yetiş Grup peynir kataloğu"
                fill
                className="object-cover"
                sizes="(min-width: 640px) 448px, 90vw"
              />
            </div>
            <p className="mkt-body mt-4">Bu kategoride henüz listelenen ürün yok.</p>
          </div>
        ) : (
          <ProductGrid
            activeCategory={kategori}
            filterGroups={filterGroups}
            totalCount={total}
            products={products.map((product) => ({
              ...product,
              imageUrl: catalogFallbackImage(product.category, product.imageUrl),
            }))}
          />
        )}
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
