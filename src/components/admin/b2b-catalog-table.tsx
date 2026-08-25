"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Package, Pencil } from "lucide-react";
import type { ProductRow } from "@/components/admin/product-list-sheet";
import { loadB2bCatalogPageAction } from "@/app/(panel)/panel/b2b/katalog/actions";
import { ProductLoadMore } from "@/components/ui/product-load-more";
import { money } from "@/domain/money";
import { kg } from "@/domain/weight";
import { formatMoney } from "@/lib/format/money";
import { formatKg } from "@/lib/format/weight";
import { packLabel, salesUnitLabel } from "@/lib/format/packaging";

export function B2bCatalogTable({
  initialProducts,
  initialNextCursor,
  totalProductCount,
  stockByVariant,
  categorySlug,
}: {
  initialProducts: ProductRow[];
  initialNextCursor: string | null;
  totalProductCount: number;
  stockByVariant: Record<string, number>;
  categorySlug?: string;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loadingMore, startLoadMore] = useTransition();

  const rows = useMemo(
    () =>
      products.flatMap((product) =>
        product.variants.map((variant) => ({
          product,
          variant,
          stock: stockByVariant[variant.id] ?? 0,
        })),
      ),
    [products, stockByVariant],
  );

  const loadMore = useCallback(() => {
    if (!nextCursor || loadingMore) return;
    startLoadMore(async () => {
      const page = await loadB2bCatalogPageAction({
        cursor: nextCursor,
        categorySlug,
      });
      setProducts((prev) => [...prev, ...page.items]);
      setNextCursor(page.nextCursor);
    });
  }, [nextCursor, loadingMore, categorySlug]);

  if (products.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-[length:var(--text-body-sm)] text-[var(--text-muted)]">
        Bu filtrede ürün yok.
      </p>
    );
  }

  return (
    <>
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]">
            <th className="px-3 py-2.5 text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
              Ürün
            </th>
            <th className="px-3 py-2.5 text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
              SKU
            </th>
            <th className="px-3 py-2.5 text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
              Cins
            </th>
            <th className="px-3 py-2.5 text-right text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
              Birim fiyat
            </th>
            <th className="px-3 py-2.5 text-right text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
              Stok
            </th>
            <th className="px-3 py-2.5 text-right text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
              KDV
            </th>
            <th className="px-3 py-2.5 text-right text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
              Net kg
            </th>
            <th className="px-3 py-2.5 text-right text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
              Min.
            </th>
            <th className="px-3 py-2.5 text-right text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
              <span className="sr-only">İşlemler</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ product, variant, stock }) => {
            const cover =
              product.media.find((m) => m.isPrimary)?.url ?? product.imageUrl;
            const moq = variant.moq;
            const vatPercent = variant.vatRateBasisPoints / 100;
            const extraCins = product.variants.length - 1;

            return (
              <tr
                key={variant.id}
                className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-2)]"
              >
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--surface-3)]">
                      {cover ? (
                        <Image
                          src={cover}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-[var(--text-muted)]">
                          <Package className="size-4 opacity-50" aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[length:var(--text-body)] font-medium text-[var(--text-primary)]">
                        {product.name}
                      </p>
                      <p className="truncate text-[length:var(--text-caption)] text-[var(--text-muted)]">
                        {product.categoryName}
                        {extraCins > 0 ? ` · +${extraCins} cins` : ""}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-[length:var(--text-caption)] font-medium tabular-nums text-[var(--text-secondary)]">
                  {variant.sku}
                </td>
                <td className="px-3 py-2 text-[length:var(--text-caption)] text-[var(--text-secondary)]">
                  {packLabel(variant.packSize, variant.packagingType)}
                </td>
                <td className="px-3 py-2 text-right text-[length:var(--text-body)] font-semibold tabular-nums text-[var(--text-primary)]">
                  {formatMoney(money(variant.pricePerUnitKurus))}
                  <span className="ml-1 font-normal text-[var(--text-muted)]">
                    / {salesUnitLabel(variant.packagingType)}
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-[length:var(--text-caption)] tabular-nums text-[var(--text-secondary)]">
                  {Math.round(stock)} kg
                </td>
                <td className="px-3 py-2 text-right text-[length:var(--text-caption)] tabular-nums text-[var(--text-secondary)]">
                  %{vatPercent}
                </td>
                <td className="px-3 py-2 text-right text-[length:var(--text-caption)] tabular-nums text-[var(--text-secondary)]">
                  {formatKg(kg(variant.unitFactor))}
                </td>
                <td className="px-3 py-2 text-right text-[length:var(--text-caption)] tabular-nums text-[var(--text-secondary)]">
                  {moq}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/panel/urunler/${product.slug}`}
                      className="inline-flex size-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
                      aria-label="Düzenle"
                      title="Düzenle"
                    >
                      <Pencil className="size-3.5" aria-hidden />
                    </Link>
                    <Link
                      href={`/urunler/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex size-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
                      aria-label="Mağazada aç"
                      title="Mağazada aç"
                    >
                      <ExternalLink className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ProductLoadMore
        loadedCount={products.length}
        totalCount={totalProductCount}
        hasMore={Boolean(nextCursor)}
        loading={loadingMore}
        onLoadMore={loadMore}
      />
    </>
  );
}
