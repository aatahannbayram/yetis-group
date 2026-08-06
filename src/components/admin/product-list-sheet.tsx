"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Maximize2, PackageSearch } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { EditablePrice } from "@/components/admin/editable-price";
import { EditableTextarea } from "@/components/admin/editable-textarea";
import {
  updateVariantPriceAction,
  updateProductDescriptionAction,
} from "@/app/(admin)/admin/urunler/actions";

const kgFormatter = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});
function formatStockKg(kg: number) {
  return `${kgFormatter.format(kg)} kg`;
}

export type ProductRowVariant = {
  id: string;
  sku: string;
  packSize: string | null;
  packagingType: string;
  baseUnit: string;
  unitFactor: string;
  vatRateBasisPoints: number;
  pricePerUnitKurus: number;
};

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  categoryName: string;
  stockKg: number;
  variants: ProductRowVariant[];
  media: Array<{ id: string; url: string; alt: string | null; isPrimary: boolean }>;
};

export function ProductListSheet({ products }: { products: ProductRow[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = products.find((p) => p.id === selectedId) ?? null;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Ürün</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Stok</TableHead>
            <TableHead className="text-right">Baz Fiyat</TableHead>
            <TableHead className="w-9"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const variant = product.variants[0];
            if (!variant) return null;
            return (
              <TableRow key={product.id}>
                <TableCell>
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={36}
                      height={36}
                      className="rounded-md object-cover"
                    />
                  ) : (
                    <div className="size-9 rounded-md bg-neutral-100" />
                  )}
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => setSelectedId(product.id)}
                    className="text-left font-medium text-neutral-900 hover:text-brand-700 hover:underline"
                  >
                    {product.name}
                  </button>
                  <p className="text-caption text-neutral-400">
                    {variant.packSize ?? variant.packagingType}
                  </p>
                </TableCell>
                <TableCell className="font-mono text-caption text-neutral-500">
                  {variant.sku}
                </TableCell>
                <TableCell className="text-neutral-500">{product.categoryName}</TableCell>
                <TableCell className="tabular-nums text-neutral-700">
                  {formatStockKg(product.stockKg)}
                </TableCell>
                <TableCell className="text-right">
                  <EditablePrice
                    priceKurus={variant.pricePerUnitKurus}
                    onSave={(kurus) => updateVariantPriceAction(variant.id, kurus)}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/urunler/${product.slug}`}
                    className="inline-flex items-center justify-center rounded-md p-1.5 text-neutral-300 transition-colors hover:bg-muted hover:text-brand-700"
                    title="Tam ekranda aç"
                  >
                    <Maximize2 className="size-3.5" />
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected ? (
            <>
              <SheetHeader>
                <div className="flex items-start gap-3">
                  {selected.imageUrl ? (
                    <Image
                      src={selected.imageUrl}
                      alt={selected.name}
                      width={48}
                      height={48}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                      <PackageSearch className="size-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <SheetTitle className="truncate">{selected.name}</SheetTitle>
                    <SheetDescription>{selected.categoryName}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
                <div>
                  <p className="mb-1.5 text-caption font-medium text-muted-foreground">
                    Açıklama
                  </p>
                  <EditableTextarea
                    value={selected.description}
                    placeholder="Ürün açıklaması eklenmemiş — mağazada gösterilecek metni yazmak için tıklayın"
                    onSave={(value) =>
                      updateProductDescriptionAction(selected.id, selected.slug, value)
                    }
                  />
                </div>

                <div>
                  <p className="mb-1.5 text-caption font-medium text-muted-foreground">
                    Varyantlar
                  </p>
                  <div className="space-y-2">
                    {selected.variants.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-mono text-caption text-neutral-500">
                            {v.sku}
                          </p>
                          <p className="text-body-sm text-neutral-700">
                            {v.packSize ?? v.packagingType} &middot; {v.baseUnit} &middot; %
                            {(v.vatRateBasisPoints / 100).toString()} KDV
                          </p>
                        </div>
                        <EditablePrice
                          priceKurus={v.pricePerUnitKurus}
                          onSave={(kurus) => updateVariantPriceAction(v.id, kurus)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {selected.media.length > 0 ? (
                  <div>
                    <p className="mb-1.5 text-caption font-medium text-muted-foreground">
                      Görseller
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selected.media.map((m) => (
                        <div
                          key={m.id}
                          className="relative size-16 overflow-hidden rounded-lg bg-muted"
                        >
                          <Image
                            src={m.url}
                            alt={m.alt ?? ""}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <Button asChild className="w-full">
                  <Link href={`/admin/urunler/${selected.slug}`}>
                    <Maximize2 className="size-3.5" />
                    Tam ekranda aç &amp; düzenle
                  </Link>
                </Button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
