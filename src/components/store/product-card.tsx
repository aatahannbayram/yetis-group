"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/store/cart-context";
import type { Money } from "@/domain/money";
import { formatMoney } from "@/lib/format/money";
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
};

function CompactThumb({
  imageUrl,
  category,
  alt,
}: {
  imageUrl: string | null;
  category: string;
  alt: string;
}) {
  if (!imageUrl) {
    return (
      <div
        className="flex size-14 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-mkt-card-muted text-[length:var(--text-body)] font-semibold text-mkt-ink-muted"
        aria-hidden
      >
        {category.charAt(0).toLocaleUpperCase("tr-TR")}
      </div>
    );
  }

  return (
    <div className="relative size-14 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-mkt-card-muted">
      <Image src={imageUrl} alt={alt} fill className="object-cover" sizes="56px" />
    </div>
  );
}

export function ProductCard({ product }: { product: ProductListItem }) {
  const { addVariant, isPending } = useCart();
  const moq = Math.max(1, product.moq ?? 1);
  const [qty, setQty] = useState(moq);
  const vatPercent =
    typeof product.vatRateBasisPoints === "number"
      ? product.vatRateBasisPoints / 100
      : null;

  return (
    <div className="flex gap-3 rounded-[var(--radius-md)] border border-[color:var(--mkt-border)] bg-mkt-slab p-3.5 shadow-[0_1px_2px_rgb(33_28_22/0.04)] transition-[border-color,box-shadow] hover:border-[color:var(--mkt-border-strong,var(--mkt-border))] hover:shadow-[0_4px_14px_rgb(33_28_22/0.08)]">
      <Link href={`/urunler/${product.slug}`} className="shrink-0">
        <CompactThumb
          imageUrl={product.imageUrl}
          category={product.category}
          alt={product.name}
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/urunler/${product.slug}`}>
              <h3 className="truncate text-[14px] font-medium tracking-[-0.01em] text-mkt-ink hover:opacity-80">
                {product.name}
              </h3>
            </Link>
            <p className="mt-0.5 truncate text-[12px] text-mkt-ink-muted">
              <span className="font-medium tabular-nums text-mkt-ink">{product.sku}</span>
              <span className="mx-1.5 text-mkt-ink-muted/60">·</span>
              {product.category}
            </p>
          </div>
          <p className="shrink-0 text-[15px] font-semibold tracking-[-0.02em] text-mkt-ink tabular-nums">
            {formatMoney(product.unitPrice)}
          </p>
        </div>

        <p className="text-[12px] text-mkt-ink-muted">
          {product.unitLabel}
          {vatPercent != null ? (
            <>
              <span className="mx-1.5 text-mkt-ink-muted/60">·</span>
              %{vatPercent.toString()} KDV
            </>
          ) : null}
          {moq > 1 ? (
            <>
              <span className="mx-1.5 text-mkt-ink-muted/60">·</span>
              Min. {moq}
            </>
          ) : null}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <div className="inline-flex items-center gap-1 rounded-full border border-[color:var(--mkt-border)] bg-mkt-card-muted p-0.5">
            <button
              type="button"
              aria-label="Azalt"
              disabled={qty <= moq}
              onClick={() => setQty((q) => Math.max(moq, q - 1))}
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-mkt-ink",
                qty <= moq && "opacity-40",
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
              onClick={() => setQty((q) => q + 1)}
              className="flex size-7 items-center justify-center rounded-full text-mkt-ink"
            >
              <Plus className="size-3.5" aria-hidden />
            </button>
          </div>

          <button
            type="button"
            aria-label={`${qty} adet sepete ekle`}
            disabled={isPending}
            onClick={() => addVariant(product.variantId, qty)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-mkt-accent px-3 text-[12px] font-medium text-mkt-accent-ink hover:brightness-105 disabled:opacity-60"
          >
            <ShoppingBag className="size-3.5" aria-hidden />
            Sepete ekle
          </button>
        </div>
      </div>
    </div>
  );
}
