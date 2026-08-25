"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { BlockingNotice } from "@/components/yg-ops/dealer/blocking-notice";
import { CartDrawer } from "@/components/yg-ops/dealer/cart-drawer";
import { QtyStepper } from "@/components/yg-ops/dealer/qty-stepper";
import {
  PageHeaderSlot,
  PillTabs,
  ProductCard,
  YgButton,
} from "@/components/yg-ops/shared";
import { formatYgMoney, formatYgQty } from "@/lib/yg-ops/format";
import {
  MOCK_CATALOG,
  MOCK_CATALOG_CATEGORIES,
  MOCK_DEALER_CREDIT,
} from "@/lib/yg-ops/mock-data";

export function DealerCatalogPage() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [qtyBySku, setQtyBySku] = useState<Record<string, number>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartLines, setCartLines] = useState<
    { id: string; name: string; packs: number; kgPerPack: number; packLabel: string; priceKurus: number }[]
  >([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    return MOCK_CATALOG.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      return (
        p.name.toLocaleLowerCase("tr-TR").includes(q) ||
        p.packLabel.toLocaleLowerCase("tr-TR").includes(q)
      );
    });
  }, [category, query]);

  const active = MOCK_CATALOG.find((p) => p.id === activeId) ?? null;
  const packs = active ? (qtyBySku[active.id] ?? 0) : 0;
  const belowMin = Boolean(active && packs > 0 && packs < active.moq);
  const lineTotal = active ? packs * active.priceKurus : 0;
  const remaining = MOCK_DEALER_CREDIT.limitKurus - MOCK_DEALER_CREDIT.usedKurus;
  const overLimit = lineTotal > remaining;
  const canAdd = Boolean(active && packs > 0 && !belowMin && !overLimit);

  function addToCart() {
    if (!active || !canAdd) return;
    setCartLines((prev) => {
      const rest = prev.filter((l) => l.id !== active.id);
      return [
        ...rest,
        {
          id: active.id,
          name: active.name,
          packs,
          kgPerPack: active.kgPerPack,
          packLabel: active.packLabel,
          priceKurus: active.priceKurus,
        },
      ];
    });
    setCartOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeaderSlot
        title="Katalog"
        description="Fiyat ve stok mock. Sepete ekleme yerel state."
      >
        {!cartOpen ? (
          packs > 0 ? (
            <YgButton variant="primary" disabled={!canAdd} onClick={addToCart}>
              Sepete ekle
            </YgButton>
          ) : (
            <YgButton variant="primary" onClick={() => setCartOpen(true)}>
              Sepeti aç
            </YgButton>
          )
        ) : null}
      </PageHeaderSlot>

      <PillTabs
        tabs={MOCK_CATALOG_CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
        value={category}
        onChange={(id) => {
          setCategory(id);
          setQuery("");
        }}
      />

      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--yg-text-muted)]"
          aria-hidden
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ürün ara..."
          className="h-[var(--yg-control-h-lg)] w-full rounded-[var(--yg-radius-md)] border border-[color:var(--yg-border-strong)] bg-[var(--yg-panel-2)] pr-3 pl-9 text-[length:var(--yg-text-14)] text-[var(--yg-text)] outline-none placeholder:text-[var(--yg-text-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--yg-focus-ring)]"
        />
      </div>

      {(belowMin || overLimit) && packs > 0 ? (
        <div className="space-y-2">
          {belowMin && active ? (
            <BlockingNotice
              tone="warning"
              title="Minimum sipariş"
              reason={`Bu ürün için en az ${active.moq} ${active.packLabel} gerekir.`}
            />
          ) : null}
          {overLimit ? (
            <BlockingNotice
              tone="danger"
              title="Limit yetersiz"
              reason="Seçilen tutar kalan kredi limitini aşıyor."
            />
          ) : null}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="text-[length:var(--yg-text-14)] text-[var(--yg-text-muted)]">
          Sonuç bulunamadı.{" "}
          <button
            type="button"
            className="font-medium text-[var(--yg-primary-text)] hover:underline"
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
          >
            Filtreyi temizle
          </button>
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((sku) => (
            <ProductCard
              key={sku.id}
              name={sku.name}
              imageUrl={sku.imageUrl}
              priceKurus={sku.priceKurus}
              stockKg={sku.stockKg}
              packCount={sku.packCount}
              packLabel={sku.packLabel}
              expirationDate={sku.expirationDate}
              footer={
                <QtyStepper
                  packs={qtyBySku[sku.id] ?? 0}
                  kgPerPack={sku.kgPerPack}
                  packLabel={sku.packLabel}
                  onChange={(next) => {
                    setActiveId(sku.id);
                    setQtyBySku((prev) => ({ ...prev, [sku.id]: next }));
                  }}
                />
              }
            />
          ))}
        </div>
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        lineCount={cartLines.length}
        footer={
          <YgButton variant="ghost" className="w-full" onClick={() => setCartOpen(false)}>
            Alışverişe dön
          </YgButton>
        }
      >
        {cartLines.length === 0 ? (
          <p className="text-[length:var(--yg-text-14)] text-[var(--yg-text-muted)]">Sepet boş.</p>
        ) : (
          <ul className="space-y-3">
            {cartLines.map((line) => (
              <li key={line.id} className="rounded-[var(--yg-radius-md)] bg-[var(--yg-panel-2)] p-3">
                <p className="text-[length:var(--yg-text-14)] font-medium text-[var(--yg-text)]">
                  {line.name}
                </p>
                <p className="mt-1 text-[length:var(--yg-text-13)] text-[var(--yg-text-muted)]">
                  {formatYgQty(line.packs, line.packs * line.kgPerPack, line.packLabel)} ·{" "}
                  {formatYgMoney(line.packs * line.priceKurus)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CartDrawer>
    </div>
  );
}
