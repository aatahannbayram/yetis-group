"use client";

import { useMemo, useState } from "react";
import { Search, Snowflake } from "lucide-react";
import { catalogFallbackImage } from "@/content/catalog-images";
import { CatalogImage } from "@/components/store/catalog-image";
import type { DealerCatalogProduct } from "@/infra/db/dealer-catalog";
import { useDealerCart } from "@/components/dealer/dealer-cart-context";
import { DealerProductSheet } from "@/components/dealer/dealer-product-sheet";
import { formatAttributeDisplay } from "@/lib/format/attribute-value";
import { stockAvailabilityLabel, stockTone } from "@/lib/format/stock";
import { cn } from "@/lib/utils";
import { packLabel } from "@/lib/format/packaging";

function badgesFor(product: DealerCatalogProduct) {
  return product.attributeValues
    .map((v) => formatAttributeDisplay(v))
    .filter((label): label is string => Boolean(label))
    .slice(0, 3);
}

export function DealerCatalogWorkspace({ products }: { products: DealerCatalogProduct[] }) {
  const { addVariant, isPending, lastError } = useDealerCart();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const p of products) {
      if (p.variants[0]) init[p.id] = p.variants[0].id;
    }
    return init;
  });
  const [qty, setQty] = useState<Record<string, number>>({});
  const [detailId, setDetailId] = useState<string | null>(null);
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
      return p.name.toLocaleLowerCase("tr-TR").includes(q);
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
            Katalog
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--panel-ink-muted)]">
            Ürün fotoğrafları, yöresi, olgunlaşması ve diğer özellikleri burada. Sipariş vermek
            için bir ürüne dokunun.
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
              placeholder="Ürün adı"
              className="h-11 w-full rounded-lg border border-[var(--panel-border)] bg-white pr-3 pl-10 text-sm outline-none focus-visible:border-[var(--primary-solid)] focus-visible:ring-3 focus-visible:ring-[var(--primary-solid)]/15"
            />
          </label>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <FilterChip label="Tümü" active={!category} onClick={() => setCategory(null)} />
          {categories.map((c) => (
            <FilterChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
          ))}
        </div>

        {message ? <p className="text-xs font-medium text-[var(--primary-text)]">{message}</p> : null}
        {lastError ? <p className="text-xs text-[var(--danger-text)]">{lastError}</p> : null}

        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--panel-border)] bg-white/60 px-4 py-10 text-center text-sm text-[var(--panel-ink-muted)]">
            Eşleşen ürün yok.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => {
              const v = variantOf(product);
              const tone = stockTone(v.stockKg);
              const badges = badgesFor(product);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setDetailId(product.id)}
                  className="group flex flex-col overflow-hidden rounded-xl border border-[var(--panel-border)] bg-white text-left transition-shadow hover:shadow-[0_8px_24px_-16px_rgb(33_28_22/0.35)]"
                >
                  <div className="relative aspect-square bg-[#FAF8F3]">
                    <CatalogImage
                      src={catalogFallbackImage(product.categoryName, product.imageUrl)}
                      fallbackSrc={catalogFallbackImage(product.categoryName, null)}
                      alt={product.name}
                      className="object-contain p-4 transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                    />
                    {product.requiresColdChain ? (
                      <span className="absolute top-2 left-2 flex size-6 items-center justify-center rounded-full bg-white/90 text-[var(--primary-text)] ring-1 ring-black/6">
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
                    {badges.length > 0 ? (
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        {badges.map((b) => (
                          <span
                            key={b}
                            className="rounded-full bg-[#FAF8F3] px-2 py-0.5 text-[10px] font-medium text-[var(--panel-ink-muted)]"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    ) : null}
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
        )}
      </div>

      <DealerProductSheet
        product={detailProduct}
        variant={detailVariant}
        amount={detailProduct && detailVariant ? (qty[detailProduct.id] ?? detailVariant.moq) : 1}
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
