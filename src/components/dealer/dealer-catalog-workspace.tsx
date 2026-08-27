"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { Loader2, Search, Snowflake } from "lucide-react";
import { catalogFallbackImage } from "@/content/catalog-images";
import { CatalogImage } from "@/components/store/catalog-image";
import type {
  DealerCatalogProduct,
  DealerCatalogVariant,
  DealerOrderListProduct,
} from "@/infra/db/dealer-catalog";
import { useDealerCart } from "@/components/dealer/dealer-cart-context";
import { DealerProductSheet } from "@/components/dealer/dealer-product-sheet";
import { fetchDealerProductDetailAction } from "@/app/(dealer-portal)/bayi/siparis/actions";
import { loadDealerCatalogPageAction } from "@/app/(dealer-portal)/bayi/katalog/actions";
import { stockAvailabilityLabel, stockTone } from "@/lib/format/stock";
import { cn } from "@/lib/utils";
import { packLabel } from "@/lib/format/packaging";
import { ProductLoadMore } from "@/components/ui/product-load-more";

function resolveVariant(
  product: { id: string; variants: DealerCatalogVariant[] },
  selected: Record<string, string>,
) {
  const id = selected[product.id] ?? product.variants[0]?.id;
  return product.variants.find((v) => v.id === id) ?? product.variants[0]!;
}

export function DealerCatalogWorkspace({
  initialProducts,
  initialNextCursor,
  totalProductCount,
}: {
  initialProducts: DealerOrderListProduct[];
  initialNextCursor: string | null;
  totalProductCount: number;
}) {
  const { addVariant, isPending, lastError } = useDealerCart();
  const [products, setProducts] = useState(initialProducts);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [category, setCategory] = useState<string | null>(null);
  const [loadingMore, startLoadMore] = useTransition();
  const [filtering, startFilter] = useTransition();
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [qty, setQty] = useState<Record<string, number>>({});
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<DealerCatalogProduct | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const detailCache = useRef(new Map<string, DealerCatalogProduct>());
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setProducts(initialProducts);
    setNextCursor(initialNextCursor);
  }, [initialProducts, initialNextCursor]);

  useEffect(() => {
    const q = deferredSearch.trim();
    if (!q && !category) {
      setProducts(initialProducts);
      setNextCursor(initialNextCursor);
      return;
    }
    startFilter(async () => {
      const page = await loadDealerCatalogPageAction({
        q: q || undefined,
        categoryName: category ?? undefined,
      });
      setProducts(page.items);
      setNextCursor(page.nextCursor);
    });
  }, [deferredSearch, category, initialProducts, initialNextCursor]);

  const categories = useMemo(() => {
    const set = new Set(initialProducts.map((p) => p.categoryName));
    for (const p of products) set.add(p.categoryName);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [initialProducts, products]);

  const loadDetail = useCallback(async (productId: string) => {
    const cached = detailCache.current.get(productId);
    if (cached) {
      setDetailProduct(cached);
      return;
    }
    setDetailProduct(null);
    setDetailLoading(true);
    try {
      const full = await fetchDealerProductDetailAction(productId);
      if (full) {
        detailCache.current.set(productId, full);
        setDetailProduct(full);
      }
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const openDetail = useCallback(
    (productId: string) => {
      setDetailId(productId);
      void loadDetail(productId);
    },
    [loadDetail],
  );

  useEffect(() => {
    if (detailId) void loadDetail(detailId);
  }, [detailId, loadDetail]);

  const loadMore = useCallback(() => {
    if (!nextCursor || loadingMore) return;
    startLoadMore(async () => {
      const page = await loadDealerCatalogPageAction({
        cursor: nextCursor,
        q: deferredSearch.trim() || undefined,
        categoryName: category ?? undefined,
      });
      setProducts((prev) => [...prev, ...page.items]);
      setNextCursor(page.nextCursor);
    });
  }, [nextCursor, loadingMore, deferredSearch, category]);

  const detailVariant = useMemo(() => {
    if (!detailProduct) return null;
    return resolveVariant(detailProduct, selected);
  }, [detailProduct, selected]);

  function addProduct(product: DealerCatalogProduct) {
    const v = resolveVariant(product, selected);
    const amount = qty[product.id] ?? v.moq;
    setMessage(`${product.name} sepete eklendi`);
    addVariant(v.id, amount);
  }

  return (
    <>
      <div className="space-y-4">
        <header className="border-b border-[var(--panel-border)] pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--panel-ink)]">Katalog</h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--panel-ink-muted)]">
            Ürün fotoğrafları, yöresi, olgunlaşması ve diğer özellikleri burada. Sipariş vermek
            için bir ürüne dokunun.
          </p>
        </header>

        <div className="sticky top-0 z-10 -mx-1 space-y-2.5 bg-[var(--panel-canvas)] px-1 pb-2 pt-0.5">
          <label className="relative block min-w-0">
            <span className="sr-only">Ürün ara</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--panel-ink-muted)]"
              aria-hidden
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün adı veya stok kodu"
              className="h-10 w-full rounded-xl border border-[var(--panel-border)] bg-[var(--surface-2)] pr-3 pl-10 text-sm text-[var(--panel-ink)] outline-none placeholder:text-[var(--panel-ink-muted)] focus-visible:border-[var(--primary-solid)] focus-visible:ring-3 focus-visible:ring-[var(--primary-solid)]/15"
            />
          </label>

          <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <FilterChip label="Tümü" active={!category} onClick={() => setCategory(null)} />
            {categories.map((c) => (
              <FilterChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
            ))}
          </div>

          <p className="flex items-center gap-1.5 text-xs text-[var(--panel-ink-muted)]">
            <span className="font-medium tabular-nums text-[var(--panel-ink)]">{products.length}</span>
            <span>/ {totalProductCount} ürün</span>
            {(search !== deferredSearch || filtering) && (
              <Loader2 className="size-3 animate-spin text-[var(--primary-text)]" aria-hidden />
            )}
          </p>
        </div>

        {message ? <p className="text-xs font-medium text-[var(--primary-text)]">{message}</p> : null}
        {lastError ? <p className="text-xs text-[var(--danger-text)]">{lastError}</p> : null}

        {products.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--panel-border)] bg-[var(--surface-2)]/60 px-4 py-10 text-center text-sm text-[var(--panel-ink-muted)]">
            Eşleşen ürün yok.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => {
                const v = resolveVariant(product, selected);
                const tone = stockTone(v.stockKg);
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => openDetail(product.id)}
                    className="group flex flex-col overflow-hidden rounded-xl border border-[var(--panel-border)] bg-[var(--surface-2)] text-left transition-shadow hover:shadow-[0_8px_24px_-16px_rgb(33_28_22/0.35)]"
                  >
                    <div className="relative aspect-square bg-[var(--surface-3)]">
                      <CatalogImage
                        src={catalogFallbackImage(product.categoryName, product.imageUrl)}
                        fallbackSrc={catalogFallbackImage(product.categoryName, null)}
                        alt={product.name}
                        className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                      />
                      {product.requiresColdChain ? (
                        <span className="absolute top-2 left-2 flex size-6 items-center justify-center rounded-full bg-[var(--panel-surface)]/90 text-[var(--primary-text)] ring-1 ring-black/6">
                          <Snowflake className="size-3.5" aria-hidden />
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5 p-3">
                      <p className="text-[10px] font-medium tracking-wide text-[var(--panel-ink-muted)] uppercase">
                        {product.categoryName}
                      </p>
                      <h2 className="line-clamp-2 text-[13px] font-semibold text-[var(--panel-ink)]">
                        {product.name}
                      </h2>
                      <p className="text-[11px] text-[var(--panel-ink-muted)]">
                        {packLabel(v.packSize, v.packagingType)}
                      </p>
                      <p
                        className={cn(
                          "mt-auto pt-1.5 text-[11px] font-medium tabular-nums",
                          tone === "empty" && "text-[var(--danger-text)]",
                          tone === "low" && "text-amber-700",
                          tone === "ok" && "text-[var(--primary-text)]",
                        )}
                      >
                        {stockAvailabilityLabel(v.stockKg)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <ProductLoadMore
              loadedCount={products.length}
              totalCount={totalProductCount}
              hasMore={Boolean(nextCursor)}
              loading={loadingMore}
              onLoadMore={loadMore}
            />
          </>
        )}
      </div>

      <DealerProductSheet
        product={detailProduct}
        variant={detailVariant}
        loading={detailLoading && !detailProduct}
        amount={detailProduct && detailVariant ? (qty[detailProduct.id] ?? detailVariant.moq) : 1}
        pending={isPending}
        onClose={() => {
          setDetailId(null);
          setDetailProduct(null);
        }}
        onSelectVariant={(variantId) => {
          if (!detailProduct) return;
          setSelected((s) => ({ ...s, [detailProduct.id]: variantId }));
        }}
        onQty={(next) => {
          if (!detailProduct) return;
          setQty((q) => ({ ...q, [detailProduct.id]: next }));
        }}
        onAdd={() => {
          if (detailProduct) addProduct(detailProduct);
        }}
        notice={message}
        error={lastError}
      />
    </>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 shrink-0 rounded-lg border px-3 text-xs font-medium transition-colors",
        active
          ? "border-[var(--primary-solid)] bg-[var(--primary-solid)] text-white"
          : "border-[var(--panel-border)] bg-[var(--surface-2)] text-[var(--panel-ink-muted)] hover:border-[var(--panel-ink)]/25 hover:text-[var(--panel-ink)]",
      )}
    >
      {label}
    </button>
  );
}
