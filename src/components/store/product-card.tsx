"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Package, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/store/cart-context";
import type { Money } from "@/domain/money";
import { formatMoney } from "@/lib/format/money";
import { stockAvailabilityLabel, stockTone } from "@/lib/format/stock";
import { cn } from "@/lib/utils";

export type ProductListItem = {
  id: string;
  variantId: string;
  sku: string;
  slug: string;
  name: string;
  category: string;
  imageUrl: string | null;
  unitLabel: string;
  kgPerUnit: string | { toString(): string };
  unitPrice: Money;
  moq?: number;
  vatRateBasisPoints?: number;
  /** Sevkiyat edilebilir stok (kg). */
  stockKg?: number;
};

export function ProductCard({ product }: { product: ProductListItem }) {
  const { addVariant, isPending } = useCart();
  const moq = Math.max(1, product.moq ?? 1);
  const [qty, setQty] = useState(moq);
  const [added, setAdded] = useState(false);
  const vatPercent =
    typeof product.vatRateBasisPoints === "number" ? product.vatRateBasisPoints / 100 : null;
  const stockKg = product.stockKg ?? 0;
  const tone = stockTone(stockKg);
  const outOfStock = tone === "empty";

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-[color:var(--mkt-border)] bg-mkt-slab shadow-[0_1px_2px_rgb(33_28_22/0.04)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-[color:var(--mkt-border-strong,var(--mkt-border))] hover:shadow-[0_18px_36px_-14px_rgb(33_28_22/0.18)]">
      <Link href={`/urunler/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-mkt-card-muted">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-transform duration-500 group-hover:scale-[1.06]",
              outOfStock && "opacity-70",
            )}
            sizes="(min-width: 1280px) 360px, (min-width: 640px) 45vw, 90vw"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-mkt-ink-muted">
            <Package className="size-10" aria-hidden />
          </div>
        )}
        <span
          className={cn(
            "absolute top-3 right-3 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-sm",
            tone === "empty" && "bg-stone-900/85 text-white",
            tone === "low" && "bg-amber-50/95 text-amber-950",
            tone === "ok" && "bg-white/90 text-mkt-ink",
          )}
        >
          {stockAvailabilityLabel(stockKg)}
        </span>
        {moq > 1 ? (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-mkt-ink shadow-sm backdrop-blur-sm">
            Min. {moq}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="mkt-label text-mkt-ink-muted">{product.category}</p>
        <Link href={`/urunler/${product.slug}`}>
          <h3 className="text-[15px] leading-snug font-semibold tracking-[-0.01em] text-mkt-ink hover:opacity-80">
            {product.name}
          </h3>
        </Link>
        <p className="text-[12px] text-mkt-ink-muted">
          {product.unitLabel}
          {vatPercent != null ? (
            <>
              <span className="mx-1.5 text-mkt-ink-muted/60">·</span>
              %{vatPercent.toString()} KDV
            </>
          ) : null}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className="text-[1.25rem] font-semibold tracking-[-0.02em] text-mkt-ink tabular-nums">
            {formatMoney(product.unitPrice)}
          </p>
          <div className="inline-flex items-center gap-0.5 rounded-full border border-[color:var(--mkt-border)] bg-mkt-card-muted p-0.5">
            <button
              type="button"
              aria-label="Azalt"
              disabled={qty <= moq || outOfStock}
              onClick={() => setQty((q) => Math.max(moq, q - 1))}
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-mkt-ink",
                (qty <= moq || outOfStock) && "opacity-40",
              )}
            >
              <Minus className="size-3.5" aria-hidden />
            </button>
            <span className="min-w-7 text-center text-[13px] font-medium tabular-nums text-mkt-ink">
              {qty}
            </span>
            <button
              type="button"
              aria-label="Artır"
              disabled={outOfStock}
              onClick={() => setQty((q) => q + 1)}
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-mkt-ink",
                outOfStock && "opacity-40",
              )}
            >
              <Plus className="size-3.5" aria-hidden />
            </button>
          </div>
        </div>

        <button
          type="button"
          aria-label={outOfStock ? "Stok yok" : `${qty} adet sepete ekle`}
          disabled={isPending || outOfStock}
          onClick={() => {
            addVariant(product.variantId, qty);
            setAdded(true);
            setTimeout(() => setAdded(false), 1400);
          }}
          className={cn(
            "mt-2.5 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold transition-colors disabled:opacity-60",
            outOfStock
              ? "bg-stone-200 text-stone-600"
              : added
                ? "bg-mkt-green-text text-white"
                : "bg-mkt-accent text-mkt-accent-ink hover:brightness-105",
          )}
        >
          <ShoppingBag className="size-3.5" aria-hidden />
          {outOfStock ? "Stok yok" : added ? "Sepete eklendi" : "Sepete ekle"}
        </button>
      </div>
    </div>
  );
}
