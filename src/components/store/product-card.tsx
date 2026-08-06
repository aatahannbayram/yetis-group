"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { ProductImage } from "@/components/store/product-image";
import { useCart } from "@/components/store/cart-context";
import type { Money } from "@/domain/money";
import { formatMoney } from "@/lib/format/money";

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
};

export function ProductCard({ product }: { product: ProductListItem }) {
  const { addVariant } = useCart();

  return (
    <div className="group flex flex-col">
      <Link href={`/urunler/${product.slug}`} className="block">
        <ProductImage
          imageUrl={product.imageUrl}
          category={product.category}
          alt={product.name}
          className="overflow-hidden rounded-[1.25rem]"
          sizes="(min-width: 1024px) 25vw, 50vw"
        />
      </Link>
      <div className="mt-3 flex flex-1 flex-col gap-1.5 px-0.5">
        <span className="mkt-pill mkt-label inline-flex w-fit bg-mkt-card-muted px-3 py-1 text-mkt-ink-muted">
          {product.category}
        </span>
        <Link href={`/urunler/${product.slug}`}>
          <h3 className="text-[15px] font-medium tracking-[-0.01em] text-mkt-ink hover:opacity-80">
            {product.name}
          </h3>
        </Link>
        <p className="mkt-body text-[13px]">{product.unitLabel}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-[1.25rem] font-medium tracking-[-0.02em] text-mkt-ink tabular-nums">
            {formatMoney(product.unitPrice)}
          </p>
          <button
            type="button"
            aria-label="Sepete ekle"
            onClick={() => addVariant(product.variantId)}
            className="flex size-10 items-center justify-center rounded-full bg-mkt-accent text-mkt-accent-ink hover:brightness-105"
          >
            <ShoppingBag className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
