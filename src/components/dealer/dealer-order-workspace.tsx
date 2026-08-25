"use client";

import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { Loader2, Plus, Search, X } from "lucide-react";
import { catalogFallbackImage } from "@/content/catalog-images";
import { CatalogImage } from "@/components/store/catalog-image";
import { QtyInput } from "@/components/ui/qty-input";
import type {
  DealerCatalogProduct,
  DealerCatalogVariant,
  DealerOrderListProduct,
} from "@/infra/db/dealer-catalog";
import { useDealerCart } from "@/components/dealer/dealer-cart-context";
import { DealerProductSheet } from "@/components/dealer/dealer-product-sheet";
import { fetchDealerProductDetailAction } from "@/app/(dealer-portal)/bayi/siparis/actions";
import { formatMoney } from "@/lib/format/money";
import { stockAvailabilityLabel, stockTone } from "@/lib/format/stock";
import { cn } from "@/lib/utils";
import { packLabel, packagingTypeLabel, salesUnitLabel } from "@/lib/format/packaging";
import { formatKg } from "@/lib/format/weight";
import { kg } from "@/domain/weight";

type SearchableProduct = DealerOrderListProduct & { searchText: string };

function buildSearchText(product: DealerOrderListProduct): string {
  const parts = [product.name, product.categoryName];
  for (const v of product.variants) {
    parts.push(
      v.sku,
      packLabel(v.packSize, v.packagingType),
      packagingTypeLabel(v.packagingType),
    );
  }
  return parts.join(" ").toLocaleLowerCase("tr-TR");
}

function stockLabel(stockKg: number) {
  const tone = stockTone(stockKg);
  return { text: stockAvailabilityLabel(stockKg), tone };
}

function maxOrderableQty(stockKg: number, unitFactor: string) {
  const factor = Number(unitFactor);
  if (!Number.isFinite(factor) || factor <= 0) return 0;
  return Math.max(0, Math.floor(stockKg / factor));
}

function resolveVariant(
  product: DealerOrderListProduct,
  selected: Record<string, string>,
): DealerCatalogVariant {
  const id = selected[product.id] ?? product.variants[0]?.id;
  return product.variants.find((v) => v.id === id) ?? product.variants[0]!;
}

export function DealerOrderWorkspace({
  products,
  initialProductSlug,
  initialCinsId,
}: {
  products: DealerOrderListProduct[];
  initialProductSlug?: string | null;
  initialCinsId?: string | null;
}) {
  const { addVariant, isPending, lastError } = useDealerCart();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [category, setCategory] = useState<string | null>(null);
  const [, startFilterTransition] = useTransition();

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    if (initialProductSlug && initialCinsId) {
      const match = products.find((p) => p.slug === initialProductSlug);
      if (match?.variants.some((v) => v.id === initialCinsId)) {
        return { [match.id]: initialCinsId };
      }
    }
    return {};
  });
  const [qty, setQty] = useState<Record<string, number>>({});
  const [detailId, setDetailId] = useState<string | null>(() => {
    if (!initialProductSlug) return null;
    return products.find((p) => p.slug === initialProductSlug)?.id ?? null;
  });
  const [detailProduct, setDetailProduct] = useState<DealerCatalogProduct | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const detailCache = useRef(new Map<string, DealerCatalogProduct>());
  const [message, setMessage] = useState<string | null>(null);

  const isSearchPending = search !== deferredSearch;

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      map.set(p.categoryName, (map.get(p.categoryName) ?? 0) + 1);
    }
    return map;
  }, [products]);

  const categories = useMemo(
    () => Array.from(categoryCounts.keys()).sort((a, b) => a.localeCompare(b, "tr")),
    [categoryCounts],
  );

  const searchableProducts = useMemo(
    (): SearchableProduct[] =>
      products.map((p) => ({ ...p, searchText: buildSearchText(p) })),
    [products],
  );

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLocaleLowerCase("tr-TR");
    return searchableProducts.filter((p) => {
      if (category && p.categoryName !== category) return false;
      if (!q) return true;
      return p.searchText.includes(q);
    });
  }, [searchableProducts, deferredSearch, category]);

  const hasActiveFilters = Boolean(category || search.trim());

  const loadDetail = useCallback(async (productId: string) => {
    const cached = detailCache.current.get(productId);
    if (cached) {
      setDetailProduct(cached);
      return;
    }
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

  const closeDetail = useCallback(() => {
    setDetailId(null);
    setDetailProduct(null);
  }, []);

  const setCategoryFilter = useCallback((next: string | null) => {
    startFilterTransition(() => setCategory(next));
  }, []);

  const handleSelectVariant = useCallback((productId: string, variantId: string) => {
    setSelected((s) => ({ ...s, [productId]: variantId }));
    setQty((q) => {
      const product = products.find((p) => p.id === productId);
      const variant = product?.variants.find((v) => v.id === variantId);
      if (!variant) return q;
      const current = q[productId] ?? variant.moq;
      return { ...q, [productId]: Math.max(variant.moq, current) };
    });
  }, [products]);

  const handleQty = useCallback((productId: string, next: number) => {
    setQty((q) => ({ ...q, [productId]: next }));
  }, []);

  const addProduct = useCallback(
    (product: DealerOrderListProduct) => {
      const v = resolveVariant(product, selected);
      const amount = qty[product.id] ?? v.moq;
      setMessage(`${product.name} sepete eklendi`);
      addVariant(v.id, amount);
    },
    [addVariant, qty, selected],
  );

  const handleAdd = useCallback(
    (productId: string) => {
      const product = products.find((p) => p.id === productId);
      if (product) addProduct(product);
    },
    [addProduct, products],
  );

  const detailVariant = useMemo(() => {
    if (!detailProduct) return null;
    const id = selected[detailProduct.id] ?? detailProduct.variants[0]?.id;
    return detailProduct.variants.find((v) => v.id === id) ?? detailProduct.variants[0] ?? null;
  }, [detailProduct, selected]);

  return (
    <>
      <div className="space-y-4">
        <header className="border-b border-[var(--panel-border)] pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--panel-ink)]">
            Sipariş ver
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--panel-ink-muted)]">
            Ürünü seçin, paketi belirleyin, sepete ekleyin. Stok sevkiyat edilebilir lotlardan
            hesaplanır.
          </p>
        </header>

        <div className="sticky top-0 z-10 -mx-1 space-y-2.5 bg-[var(--panel-canvas)] px-1 pb-2 pt-0.5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Ürün ara</span>
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--panel-ink-muted)]"
                aria-hidden
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ürün adı veya stok kodu"
                className="h-10 w-full rounded-xl border border-[var(--panel-border)] bg-[var(--surface-2)] pr-9 pl-10 text-sm text-[var(--panel-ink)] outline-none placeholder:text-[var(--panel-ink-muted)] focus-visible:border-[var(--primary-solid)] focus-visible:ring-3 focus-visible:ring-[var(--primary-solid)]/15"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-[var(--panel-ink-muted)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--panel-ink)]"
                  aria-label="Aramayı temizle"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              ) : null}
            </label>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter(null);
                }}
                className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-[var(--panel-border)] px-3 text-sm font-medium text-[var(--panel-ink-muted)] transition-colors hover:border-[var(--panel-ink)]/20 hover:text-[var(--panel-ink)]"
              >
                <X className="size-3.5" aria-hidden />
                Temizle
              </button>
            ) : null}
          </div>

          <div className="relative">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-4 bg-gradient-to-r from-[var(--panel-canvas)] to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-[var(--panel-canvas)] to-transparent"
              aria-hidden
            />
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <FilterChip
                label="Tümü"
                count={products.length}
                active={!category}
                onClick={() => setCategoryFilter(null)}
              />
              {categories.map((c) => (
                <FilterChip
                  key={c}
                  label={c}
                  count={categoryCounts.get(c) ?? 0}
                  active={category === c}
                  onClick={() => setCategoryFilter(c)}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-[var(--panel-ink-muted)]">
            <p className="flex items-center gap-1.5">
              {hasActiveFilters ? (
                <>
                  <span className="font-medium tabular-nums text-[var(--panel-ink)]">
                    {filtered.length}
                  </span>
                  <span>/ {products.length} ürün</span>
                </>
              ) : (
                <>
                  <span className="font-medium tabular-nums text-[var(--panel-ink)]">
                    {products.length}
                  </span>
                  <span>ürün</span>
                </>
              )}
              {isSearchPending ? (
                <Loader2 className="size-3 animate-spin text-[var(--primary-text)]" aria-hidden />
              ) : null}
            </p>
            {category ? (
              <p className="truncate">
                Kategori:{" "}
                <span className="font-medium text-[var(--panel-ink)]">{category}</span>
              </p>
            ) : null}
          </div>
        </div>

        {message ? (
          <p className="text-xs font-medium text-[var(--primary-text)]">{message}</p>
        ) : null}
        {lastError ? <p className="text-xs text-[var(--danger-text)]">{lastError}</p> : null}

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--panel-border)] bg-[var(--surface-2)]/60 px-4 py-10 text-center">
            <p className="text-sm font-medium text-[var(--panel-ink)]">Eşleşen ürün yok</p>
            <p className="mt-1 text-xs text-[var(--panel-ink-muted)]">
              {hasActiveFilters
                ? "Arama veya kategori filtresini değiştirin."
                : "Katalogda henüz ürün bulunmuyor."}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter(null);
                }}
                className="mt-3 text-xs font-medium text-[var(--primary-text)] hover:underline"
              >
                Filtreleri temizle
              </button>
            ) : null}
          </div>
        ) : (
          <ul className="divide-y divide-[var(--panel-border)] overflow-hidden rounded-xl border border-[var(--panel-border)] bg-[var(--surface-2)]">
            {filtered.map((product) => (
              <OrderProductRow
                key={product.id}
                product={product}
                variant={resolveVariant(product, selected)}
                amount={qty[product.id] ?? resolveVariant(product, selected).moq}
                isPending={isPending}
                onSelectVariant={handleSelectVariant}
                onQty={handleQty}
                onAdd={handleAdd}
                onOpenDetail={openDetail}
              />
            ))}
          </ul>
        )}
      </div>

      <DealerProductSheet
        product={detailProduct}
        variant={detailVariant}
        loading={detailLoading && !detailProduct}
        amount={
          detailProduct && detailVariant
            ? (qty[detailProduct.id] ?? detailVariant.moq)
            : 1
        }
        pending={isPending}
        onClose={closeDetail}
        onSelectVariant={(variantId) => {
          if (!detailProduct) return;
          handleSelectVariant(detailProduct.id, variantId);
        }}
        onQty={(next) => {
          if (!detailProduct) return;
          handleQty(detailProduct.id, next);
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

const OrderProductRow = memo(function OrderProductRow({
  product,
  variant,
  amount,
  isPending,
  onSelectVariant,
  onQty,
  onAdd,
  onOpenDetail,
}: {
  product: DealerOrderListProduct;
  variant: DealerCatalogVariant;
  amount: number;
  isPending: boolean;
  onSelectVariant: (productId: string, variantId: string) => void;
  onQty: (productId: string, qty: number) => void;
  onAdd: (productId: string) => void;
  onOpenDetail: (productId: string) => void;
}) {
  const stock = stockLabel(variant.stockKg);
  const maxQty = maxOrderableQty(variant.stockKg, variant.unitFactor);
  const insufficientForMoq = maxQty < variant.moq;

  return (
    <li className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
      <button
        type="button"
        onClick={() => onOpenDetail(product.id)}
        className="group/img relative size-16 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-3)] text-left sm:size-20"
        title={`${product.name} detayını aç`}
      >
        <CatalogImage
          src={catalogFallbackImage(product.categoryName, product.imageUrl)}
          fallbackSrc={catalogFallbackImage(product.categoryName, null)}
          alt={product.name}
          className="object-cover transition-transform duration-300 group-hover/img:scale-105 motion-reduce:transition-none motion-reduce:group-hover/img:scale-100"
          sizes="80px"
        />
      </button>

      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-[var(--panel-ink-muted)] uppercase">
            {product.categoryName}
          </p>
          <button
            type="button"
            onClick={() => onOpenDetail(product.id)}
            className="block w-full text-left"
          >
            <h2 className="truncate text-[15px] font-semibold text-[var(--panel-ink)] transition-colors hover:text-[var(--primary-text)]">
              {product.name}
            </h2>
            <p className="mt-0.5 text-[11px] text-[var(--panel-ink-muted)]">Detayı gör</p>
          </button>
        </div>

        {product.variants.length > 1 ? (
          <div>
            <p className="mb-1 text-[11px] font-medium text-[var(--panel-ink-muted)]">Cins</p>
            <div className="flex flex-wrap gap-1.5">
              {product.variants.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSelectVariant(product.id, opt.id)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                    variant.id === opt.id
                      ? "border-[var(--primary-solid)] bg-[var(--primary-subtle)] text-[var(--primary-text)]"
                      : "border-[var(--panel-border)] text-[var(--panel-ink-muted)] hover:border-[var(--primary-solid)]/40",
                  )}
                >
                  {packLabel(opt.packSize, opt.packagingType)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-[var(--panel-ink-muted)]">
            {packLabel(variant.packSize, variant.packagingType)} · {variant.sku}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--panel-ink-muted)]">
          <span className="font-mono tabular-nums">{variant.sku}</span>
          <span
            className={cn(
              "tabular-nums",
              stock.tone === "empty" && "text-[var(--danger-text)]",
              stock.tone === "low" && "text-amber-700",
              stock.tone === "ok" && "text-[var(--primary-text)]",
            )}
          >
            {stock.text}
          </span>
          <span>%{(variant.vatRateBasisPoints / 100).toString()} KDV</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
        <p className="text-lg font-semibold tabular-nums text-[var(--panel-ink)]">
          {formatMoney(variant.unitPrice)}
          <span className="ml-1 text-xs font-medium text-[var(--panel-ink-muted)]">
            / {salesUnitLabel(variant.packagingType)}
          </span>
        </p>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <QtyInput
              value={amount}
              min={variant.moq}
              max={Math.max(variant.moq, maxQty)}
              disabled={isPending || insufficientForMoq}
              ariaLabel={salesUnitLabel(variant.packagingType)}
              onCommit={(next) => onQty(product.id, next)}
            />
            <span className="text-xs font-medium text-[var(--panel-ink-muted)]">
              {salesUnitLabel(variant.packagingType)}
            </span>
            <button
              type="button"
              disabled={isPending || insufficientForMoq}
              onClick={() => onAdd(product.id)}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-[transform,background-color] active:scale-[0.97] disabled:pointer-events-none",
                insufficientForMoq
                  ? "bg-[var(--surface-3)] text-[var(--panel-ink-muted)] ring-1 ring-[var(--panel-border)]"
                  : "bg-[var(--primary-solid)] text-white hover:bg-[var(--primary-hover)] dark:text-[#06231a]",
              )}
            >
              {!insufficientForMoq ? <Plus className="size-3.5" aria-hidden /> : null}
              {insufficientForMoq ? "Stok yetersiz" : "Ekle"}
            </button>
          </div>
          {!insufficientForMoq ? (
            <p className="text-[11px] text-[var(--panel-ink-muted)]">
              Maks. {maxQty} {salesUnitLabel(variant.packagingType)} (
              {formatKg(kg(variant.stockKg.toString()))})
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
});

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={cn(
        "inline-flex max-w-[10rem] shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors",
        active
          ? "border-[var(--primary-solid)] bg-[var(--primary-solid)] text-white shadow-sm"
          : "border-[var(--panel-border)] bg-[var(--surface-2)] text-[var(--panel-ink-muted)] hover:border-[var(--panel-ink)]/25 hover:text-[var(--panel-ink)]",
      )}
    >
      <span className="truncate">{label}</span>
      {count !== undefined ? (
        <span
          className={cn(
            "shrink-0 rounded px-1 py-px text-[10px] tabular-nums",
            active ? "bg-white/15 text-white" : "bg-[var(--surface-3)] text-[var(--panel-ink-muted)]",
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
