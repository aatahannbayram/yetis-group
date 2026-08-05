"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/store/product-image";
import { useCart } from "@/components/store/cart-context";
import type { Money } from "@/domain/money";
import { formatMoney } from "@/lib/format/money";

export type ProductListItem = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  category: string;
  imageUrl: string | null;
  unitLabel: string;
  kgPerUnit: string;
  unitPrice: Money;
};

export function ProductCard({ product }: { product: ProductListItem }) {
  const { addLine } = useCart();

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/urunler/${product.slug}`}>
        <ProductImage
          imageUrl={product.imageUrl}
          category={product.category}
          alt={product.name}
          className="rounded-none"
          sizes="(min-width: 1024px) 25vw, 50vw"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-caption font-medium tracking-wide text-muted-foreground uppercase">
            {product.category}
          </span>
          <span className="font-mono text-caption text-neutral-300">{product.sku}</span>
        </div>
        <Link href={`/urunler/${product.slug}`} className="hover:underline">
          <h3 className="text-body-sm leading-body-sm font-semibold text-foreground">
            {product.name}
          </h3>
        </Link>
        <p className="text-caption text-muted-foreground">{product.unitLabel}</p>
        <div className="mt-2 flex items-end justify-between gap-2">
          <p className="tabular-nums text-h2 leading-h2 font-bold text-foreground">
            {formatMoney(product.unitPrice)}
          </p>
          <Button
            size="icon"
            className="shrink-0 rounded-full bg-brand-700 text-white hover:bg-brand-800"
            aria-label="Sepete ekle"
            onClick={() =>
              addLine({
                productId: product.id,
                name: product.name,
                unitLabel: product.unitLabel,
                priceKurus: product.unitPrice,
                kgPerUnit: product.kgPerUnit,
              })
            }
          >
            <ShoppingBag />
          </Button>
        </div>
      </div>
    </div>
  );
}
