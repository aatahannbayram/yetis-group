"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/components/store/cart-context";
import type { Money } from "@/domain/money";
import { formatMoney } from "@/lib/format/money";
import { cn } from "@/lib/utils";

export type PdpVariant = {
  id: string;
  sku: string;
  packLabel: string;
  unitPrice: Money;
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

  return (
    <div className="flex flex-col gap-5">
      {variants.length > 1 ? (
        <div>
          <p className="mkt-label text-mkt-ink">Ambalaj</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariantId(v.id)}
                className={cn(
                  "mkt-pill mkt-label px-4 py-2",
                  v.id === selected.id
                    ? "bg-mkt-accent text-mkt-accent-ink"
                    : "bg-mkt-card-muted text-mkt-ink-muted",
                )}
              >
                {v.packLabel}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <p className="text-[2rem] font-medium tracking-[-0.02em] text-mkt-green-text tabular-nums">
        {formatMoney(selected.unitPrice)}
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Azalt"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex size-10 items-center justify-center rounded-full border border-[color:var(--mkt-border)]"
        >
          <Minus className="size-4" />
        </button>
        <span className="w-8 text-center text-[15px] font-medium tabular-nums">{quantity}</span>
        <button
          type="button"
          aria-label="Artır"
          onClick={() => setQuantity((q) => q + 1)}
          className="flex size-10 items-center justify-center rounded-full border border-[color:var(--mkt-border)]"
        >
          <Plus className="size-4" />
        </button>
      </div>

      <button
        type="button"
        className="mkt-pill inline-flex h-12 items-center justify-center bg-mkt-accent text-[15px] font-medium text-mkt-accent-ink hover:brightness-105"
        onClick={() => {
          addVariant(selected.id, quantity);
          setAdded(true);
          setTimeout(() => setAdded(false), 1600);
        }}
      >
        {added ? "Sepete Eklendi" : "Sepete Ekle"}
      </button>

      <p className="mkt-label text-mkt-ink-muted">SKU: {selected.sku}</p>
    </div>
  );
}
