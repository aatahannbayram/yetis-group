import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import type { Money } from "@/domain/money";
import { catalogFallbackImage } from "@/content/catalog-images";

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
  unitPrice?: Money;
  moq?: number;
  vatRateBasisPoints?: number;
  /** Sevkiyat edilebilir stok (kg). */
  stockKg?: number;
};

export function ProductCard({ product }: { product: ProductListItem }) {
  const imageSrc = catalogFallbackImage(product.category, product.imageUrl);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-[color:var(--mkt-border)] bg-mkt-slab shadow-[0_1px_2px_rgb(33_28_22/0.04)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-[color:var(--mkt-border-strong,var(--mkt-border))] hover:shadow-[0_18px_36px_-14px_rgb(33_28_22/0.18)]">
      <Link href={`/urunler/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-mkt-card-muted">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            sizes="(min-width: 1280px) 360px, (min-width: 640px) 45vw, 90vw"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-mkt-ink-muted">
            <Package className="size-10" aria-hidden />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="mkt-label text-mkt-ink-muted">{product.category}</p>
        <Link href={`/urunler/${product.slug}`}>
          <h3 className="text-[15px] leading-snug font-semibold tracking-[-0.01em] text-mkt-ink hover:opacity-80">
            {product.name}
          </h3>
        </Link>
        <p className="text-[12px] text-mkt-ink-muted">{product.unitLabel}</p>
        <Link
          href="/auth"
          className="mt-auto pt-3 text-[13px] font-medium text-mkt-green-text hover:underline"
        >
          Bayi girişi ile fiyat ve stok
        </Link>
      </div>
    </div>
  );
}
