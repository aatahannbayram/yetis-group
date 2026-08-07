"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/components/store/cart-context";
import type { Money } from "@/domain/money";
import { formatMoney } from "@/lib/format/money";
import { stockAvailabilityLabel, stockTone } from "@/lib/format/stock";
import { cn } from "@/lib/utils";

export type PdpVariant = {
  id: string;
  sku: string;
  packLabel: string;
  unitPrice: Money;
  stockKg?: number;
};

export function ProductDetailActions({
  variants,
  initialVariantId,
}: {
  variants: PdpVariant[];
  initialVariantId: string;
}) {
  const { addVariant } = useCart();
  const [variantId, setVariantId] = useState(initialVariantId);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selected = useMemo(
    () => variants.find((v) => v.id === variantId) ?? variants[0],
    [variants, variantId],
  );

  if (!selected) return null;

  const stockKg = selected.stockKg ?? 0;
  const tone = stockTone(stockKg);
  const outOfStock = tone === "empty";

  return (
    <div className="flex flex-col gap-5">
      {variants.length > 1 ? (
        <div>
          <p className="mkt-label text-mkt-ink">Ambalaj</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((v) => {
              const vTone = stockTone(v.stockKg ?? 0);
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantId(v.id)}
                  className={cn(
                    "mkt-pill mkt-label px-4 py-2",
                    v.id === selected.id
                      ? "bg-mkt-accent text-mkt-accent-ink"
                      : "bg-mkt-card-muted text-mkt-ink-muted",
                    vTone === "empty" && v.id !== selected.id && "opacity-55",
                  )}
                >
                  {v.packLabel}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div>
        <p className="text-[2rem] font-medium tracking-[-0.02em] text-mkt-green-text tabular-nums">
          {formatMoney(selected.unitPrice)}
        </p>
        <p
          className={cn(
            "mt-2 text-[13px] font-medium",
            tone === "empty" && "text-stone-600",
            tone === "low" && "text-amber-800",
            tone === "ok" && "text-mkt-ink-muted",
          )}
        >
          {stockAvailabilityLabel(stockKg)}
          {tone === "low" ? " · Yakında tükenebilir" : null}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Azalt"
          disabled={outOfStock}
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex size-10 items-center justify-center rounded-full border border-[color:var(--mkt-border)] disabled:opacity-40"
        >
          <Minus className="size-4" />
        </button>
        <span className="w-8 text-center text-[15px] font-medium tabular-nums">{quantity}</span>
        <button
          type="button"
          aria-label="Artır"
          disabled={outOfStock}
          onClick={() => setQuantity((q) => q + 1)}
          className="flex size-10 items-center justify-center rounded-full border border-[color:var(--mkt-border)] disabled:opacity-40"
        >
          <Plus className="size-4" />
        </button>
      </div>

      <button
        type="button"
        disabled={outOfStock}
        className={cn(
          "mkt-pill inline-flex h-12 items-center justify-center text-[15px] font-medium disabled:opacity-50",
          outOfStock
            ? "bg-stone-200 text-stone-600"
            : "bg-mkt-accent text-mkt-accent-ink hover:brightness-105",
        )}
        onClick={() => {
          addVariant(selected.id, quantity);
          setAdded(true);
          setTimeout(() => setAdded(false), 1600);
        }}
      >
        {outOfStock ? "Stok yok" : added ? "Sepete Eklendi" : "Sepete Ekle"}
      </button>

      <p className="mkt-label text-mkt-ink-muted">SKU: {selected.sku}</p>
    </div>
  );
}
