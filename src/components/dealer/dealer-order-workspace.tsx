"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { catalogFallbackImage } from "@/content/catalog-images";
import { CatalogImage } from "@/components/store/catalog-image";
import { QtyInput } from "@/components/ui/qty-input";
import type { DealerCatalogProduct } from "@/infra/db/dealer-catalog";
import { useDealerCart } from "@/components/dealer/dealer-cart-context";
import { DealerProductSheet } from "@/components/dealer/dealer-product-sheet";
import { formatMoney } from "@/lib/format/money";
import { stockAvailabilityLabel, stockTone } from "@/lib/format/stock";
import { cn } from "@/lib/utils";
import { packLabel, packagingTypeLabel, salesUnitLabel } from "@/lib/format/packaging";
import { formatKg } from "@/lib/format/weight";
import { kg } from "@/domain/weight";

function stockLabel(stockKg: number) {
  const tone = stockTone(stockKg);
  return { text: stockAvailabilityLabel(stockKg), tone };
}

/** Stoktaki kg'yi paket adedine çevirir (koli/teneke↔kg katsayısı üzerinden). */
function maxOrderableQty(stockKg: number, unitFactor: string) {
  const factor = Number(unitFactor);
  if (!Number.isFinite(factor) || factor <= 0) return 0;
  return Math.max(0, Math.floor(stockKg / factor));
}

export function DealerOrderWorkspace({
  products,
  initialProductSlug,
  initialCinsId,
}: {
  products: DealerCatalogProduct[];
  initialProductSlug?: string | null;
  initialCinsId?: string | null;
}) {
  const { addVariant, isPending, lastError } = useDealerCart();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const p of products) {
      if (p.variants[0]) init[p.id] = p.variants[0].id;
    }
    if (initialProductSlug && initialCinsId) {
      const match = products.find((p) => p.slug === initialProductSlug);
      if (match?.variants.some((v) => v.id === initialCinsId)) {
        init[match.id] = initialCinsId;
      }
    }
    return init;
  });
  const [qty, setQty] = useState<Record<string, number>>({});
  const [detailId, setDetailId] = useState<string | null>(() => {
    if (!initialProductSlug) return null;
    return products.find((p) => p.slug === initialProductSlug)?.id ?? null;
  });
  const [message, setMessage] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.categoryName));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr-TR");
    return products.filter((p) => {
      if (category && p.categoryName !== category) return false;
      if (!q) return true;
      if (p.name.toLocaleLowerCase("tr-TR").includes(q)) return true;
      return p.variants.some((v) => {
        const pack = packLabel(v.packSize, v.packagingType).toLocaleLowerCase("tr-TR");
        const type = packagingTypeLabel(v.packagingType).toLocaleLowerCase("tr-TR");
        return (
          v.sku.toLocaleLowerCase("tr-TR").includes(q) ||
          pack.includes(q) ||
          type.includes(q)
        );
      });
    });
  }, [products, search, category]);

  function variantOf(product: DealerCatalogProduct) {
    const id = selected[product.id] ?? product.variants[0]?.id;
    return product.variants.find((v) => v.id === id) ?? product.variants[0]!;
  }

  const detailProduct = products.find((p) => p.id === detailId) ?? null;
  const detailVariant = detailProduct ? variantOf(detailProduct) : null;

  function addProduct(product: DealerCatalogProduct) {
    const v = variantOf(product);
    const amount = qty[product.id] ?? v.moq;
    setMessage(`${product.name} sepete eklendi`);
    addVariant(v.id, amount);
  }

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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
              className="h-11 w-full rounded-lg border border-[var(--panel-border)] bg-white pr-3 pl-10 text-sm outline-none focus-visible:border-[var(--primary-solid)] focus-visible:ring-3 focus-visible:ring-[var(--primary-solid)]/15"
            />
          </label>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <FilterChip label="Tümü" active={!category} onClick={() => setCategory(null)} />
          {categories.map((c) => (
            <FilterChip
              key={c}
              label={c}
              active={category === c}
              onClick={() => setCategory(c)}
            />
          ))}
        </div>

        {message ? (
          <p className="text-xs font-medium text-[var(--primary-text)]">{message}</p>
        ) : null}
        {lastError ? <p className="text-xs text-[var(--danger-text)]">{lastError}</p> : null}

        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--panel-border)] bg-white/60 px-4 py-10 text-center text-sm text-[var(--panel-ink-muted)]">
            Eşleşen ürün yok.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--panel-border)] overflow-hidden rounded-xl border border-[var(--panel-border)] bg-white">
            {filtered.map((product) => {
              const v = variantOf(product);
              const stock = stockLabel(v.stockKg);
              const maxQty = maxOrderableQty(v.stockKg, v.unitFactor);
              const amount = qty[product.id] ?? v.moq;
              const insufficientForMoq = maxQty < v.moq;
              return (
                <li key={product.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
                  <button
                    type="button"
                    onClick={() => setDetailId(product.id)}
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
                        onClick={() => setDetailId(product.id)}
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
                        <p className="mb-1 text-[11px] font-medium text-[var(--panel-ink-muted)]">
                          Cins
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                        {product.variants.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setSelected((s) => ({ ...s, [product.id]: opt.id }));
                              setQty((q) => {
                                const current = q[product.id] ?? opt.moq;
                                return {
                                  ...q,
                                  [product.id]: Math.max(opt.moq, current),
                                };
                              });
                            }}
                            className={cn(
                              "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                              selected[product.id] === opt.id
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
                        {packLabel(v.packSize, v.packagingType)} · {v.sku}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--panel-ink-muted)]">
                      <span className="font-mono tabular-nums">{v.sku}</span>
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
                      <span>%{(v.vatRateBasisPoints / 100).toString()} KDV</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <p className="text-lg font-semibold tabular-nums text-[var(--panel-ink)]">
                      {formatMoney(v.unitPrice)}
                      <span className="ml-1 text-xs font-medium text-[var(--panel-ink-muted)]">
                        / {salesUnitLabel(v.packagingType)}
                      </span>
                    </p>
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <QtyInput
                            value={amount}
                            min={v.moq}
                            max={Math.max(v.moq, maxQty)}
                            disabled={isPending || insufficientForMoq}
                            ariaLabel={salesUnitLabel(v.packagingType)}
                            onCommit={(next) =>
                              setQty((q) => ({ ...q, [product.id]: next }))
                            }
                          />
                        <span className="text-xs font-medium text-[var(--panel-ink-muted)]">
                          {salesUnitLabel(v.packagingType)}
                        </span>
                        <button
                          type="button"
                          disabled={isPending || insufficientForMoq}
                          onClick={() => addProduct(product)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--primary-solid)] px-3.5 text-sm font-semibold text-white transition-[transform,background-color] hover:bg-[var(--primary-hover)] active:scale-[0.97] disabled:opacity-40"
                        >
                          <Plus className="size-3.5" aria-hidden />
                          {insufficientForMoq ? "Stok yetersiz" : "Ekle"}
                        </button>
                      </div>
                      {!insufficientForMoq ? (
                        <p className="text-[11px] text-[var(--panel-ink-muted)]">
                          Maks. {maxQty} {salesUnitLabel(v.packagingType)} ({formatKg(kg(v.stockKg.toString()))})
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <DealerProductSheet
        product={detailProduct}
        variant={detailVariant}
        amount={
          detailProduct && detailVariant
            ? (qty[detailProduct.id] ?? detailVariant.moq)
            : 1
        }
        pending={isPending}
        onClose={() => setDetailId(null)}
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
        "h-8 shrink-0 rounded-md border px-3 text-xs font-medium transition-colors",
        active
          ? "border-[var(--panel-ink)] bg-[var(--panel-ink)] text-white"
          : "border-[var(--panel-border)] bg-white text-[var(--panel-ink-muted)] hover:border-[var(--panel-ink)]/30",
      )}
    >
      {label}
    </button>
  );
}
