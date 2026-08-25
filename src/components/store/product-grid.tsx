"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductCard, type ProductListItem } from "@/components/store/product-card";
import { HoverLift } from "@/components/motion/hover-lift";
import { CatalogCategoryFilter } from "@/components/store/catalog-category-filter";
import type { CatalogFilterGroup } from "@/domain/catalog/filter-groups";
import { findFilterGroup } from "@/domain/catalog/filter-groups";
import { loadStoreCatalogPageAction } from "@/app/(store)/urunler/actions";
import { ProductLoadMore } from "@/components/ui/product-load-more";

export function ProductGrid({
  initialProducts,
  initialNextCursor,
  catalogTotalCount,
  filterGroups,
  activeCategory,
}: {
  initialProducts: ProductListItem[];
  initialNextCursor: string | null;
  catalogTotalCount: number;
  filterGroups: CatalogFilterGroup[];
  activeCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const [products, setProducts] = useState(initialProducts);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [totalCount, setTotalCount] = useState(catalogTotalCount);
  const [loadingMore, startLoadMore] = useTransition();
  const [searching, startSearch] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setProducts(initialProducts);
    setNextCursor(initialNextCursor);
    setTotalCount(catalogTotalCount);
    setQuery("");
  }, [initialProducts, initialNextCursor, catalogTotalCount, activeCategory]);

  useEffect(() => {
    if (!deferredQuery) return;
    startSearch(async () => {
      const page = await loadStoreCatalogPageAction({
        q: deferredQuery,
        categorySlug: activeCategory,
      });
      setProducts(page.items);
      setNextCursor(page.nextCursor);
      setTotalCount(page.totalCount);
    });
  }, [deferredQuery, activeCategory]);

  const displayProducts = useMemo(() => {
    if (deferredQuery) return products;
    return products;
  }, [products, deferredQuery]);

  const activeLabel = useMemo(() => {
    if (!activeCategory) return null;
    const hit = findFilterGroup(filterGroups, activeCategory);
    if (!hit) return activeCategory;
    return hit.activeChild?.name ?? hit.group.name;
  }, [activeCategory, filterGroups]);

  function setCategory(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("kategori", slug);
    else params.delete("kategori");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const loadMore = useCallback(() => {
    if (!nextCursor || loadingMore) return;
    startLoadMore(async () => {
      const page = await loadStoreCatalogPageAction({
        cursor: nextCursor,
        q: deferredQuery || undefined,
        categorySlug: activeCategory,
      });
      setProducts((prev) => [...prev, ...page.items]);
      setNextCursor(page.nextCursor);
      setTotalCount(page.totalCount);
    });
  }, [nextCursor, loadingMore, deferredQuery, activeCategory]);

  return (
    <div>
      <CatalogCategoryFilter
        groups={filterGroups}
        totalCount={catalogTotalCount}
        activeCategory={activeCategory}
        onSelect={setCategory}
      />

      <div className="relative mt-5 max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-mkt-ink-muted"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ürün veya kategori ara..."
          className="mkt-pill h-11 border-[color:var(--mkt-border)] bg-white pl-9"
          aria-label="Ürün veya kategori ara"
        />
      </div>

      {activeLabel ? (
        <p className="mkt-label mt-4 text-mkt-ink-muted">
          {displayProducts.length} ürün · {activeLabel}
          {" · "}
          <Link href="/urunler" className="text-mkt-green-text hover:underline">
            Filtreyi temizle
          </Link>
        </p>
      ) : (
        <p className="mkt-label mt-4 text-mkt-ink-muted">
          {searching ? "Aranıyor…" : `${displayProducts.length} ürün listeleniyor`}
        </p>
      )}

      {displayProducts.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <p className="mkt-body">Sonuç bulunamadı.</p>
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-[13px] font-semibold text-mkt-green-text hover:underline"
            >
              Aramayı temizle
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {displayProducts.map((product) => (
              <HoverLift key={product.id} className="h-full">
                <ProductCard product={product} />
              </HoverLift>
            ))}
          </div>
          <ProductLoadMore
            loadedCount={displayProducts.length}
            totalCount={totalCount}
            hasMore={Boolean(nextCursor)}
            loading={loadingMore}
            onLoadMore={loadMore}
            className="[&_p]:text-mkt-ink-muted [&_button]:border-[color:var(--mkt-border)] [&_button]:bg-white"
          />
        </>
      )}
    </div>
  );
}
