"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Maximize2, PackageSearch, Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { EditablePrice } from "@/components/admin/editable-price";
import { EditableTextarea } from "@/components/admin/editable-textarea";
import {
  createProductAction,
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

const PACKAGING_TYPES = [
  { value: "TENEKE", label: "Teneke" },
  { value: "VAKUM", label: "Vakum" },
  { value: "KOLI", label: "Koli" },
  { value: "KUTU", label: "Kutu" },
  { value: "DOKME", label: "Dökme" },
] as const;

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

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

export function ProductListSheet({
  products,
  categories,
  producers,
}: {
  products: ProductRow[];
  categories: { id: string; name: string }[];
  producers: { id: string; name: string }[];
}) {
  const [mode, setMode] = useState<"closed" | "create" | "detail">("closed");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = products.find((p) => p.id === selectedId) ?? null;

  function openCreate() {
    setSelectedId(null);
    setMode("create");
  }

  function openDetail(id: string) {
    setSelectedId(id);
    setMode("detail");
  }

  function close() {
    setMode("closed");
    setSelectedId(null);
  }

  return (
    <>
      <div className="mb-4 flex justify-end px-4 pt-4 sm:px-5 sm:pt-5">
        <Button type="button" onClick={openCreate} className="gap-1.5">
          <Plus className="size-4" aria-hidden />
          Yeni Ürün
        </Button>
      </div>

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
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-neutral-400">
                Henüz ürün yok. &ldquo;Yeni Ürün&rdquo; ile ekleyin.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => {
              const variant = product.variants[0];
              if (!variant) return null;
              const isSelected = mode === "detail" && selectedId === product.id;
              return (
                <TableRow
                  key={product.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  data-state={isSelected ? "selected" : undefined}
                  className="cursor-pointer"
                  onClick={() => openDetail(product.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openDetail(product.id);
                    }
                  }}
                >
                  <TableCell>
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt=""
                        width={36}
                        height={36}
                        className="rounded-md object-cover"
                      />
                    ) : (
                      <div className="size-9 rounded-md bg-neutral-100" />
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-neutral-900">{product.name}</span>
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
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <EditablePrice
                      priceKurus={variant.pricePerUnitKurus}
                      onSave={(kurus) => updateVariantPriceAction(variant.id, kurus)}
                    />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/admin/urunler/${product.slug}`}
                      className="inline-flex items-center justify-center rounded-md p-1.5 text-neutral-300 transition-colors hover:bg-muted hover:text-brand-700"
                      title="Tam ekranda aç"
                      aria-label={`${product.name} tam ekranda aç`}
                    >
                      <Maximize2 className="size-3.5" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <Sheet open={mode !== "closed"} onOpenChange={(open) => !open && close()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {mode === "create" ? (
            <>
              <SheetHeader>
                <SheetTitle>Yeni Ürün</SheetTitle>
                <SheetDescription>
                  Ürün ve varsayılan varyant birlikte oluşturulur. Lot ve görselleri sonra ekleyebilirsiniz.
                </SheetDescription>
              </SheetHeader>

              <form
                action={createProductAction}
                onSubmit={close}
                className="flex-1 space-y-4 overflow-y-auto px-4 pb-4"
              >
                <div className="space-y-1">
                  <label className="text-caption text-muted-foreground">Ürün adı</label>
                  <Input name="name" required placeholder="Örn. Beyaz Peynir 17 kg Teneke" />
                </div>

                <div className="space-y-1">
                  <label className="text-caption text-muted-foreground">Açıklama</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    placeholder="Mağazada görünecek kısa açıklama"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-caption text-muted-foreground">Kategori</label>
                    <select name="primaryCategoryId" required className={selectClass} defaultValue="">
                      <option value="" disabled>
                        Seçin
                      </option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-caption text-muted-foreground">Üretici</label>
                    <select name="producerId" required className={selectClass} defaultValue="">
                      <option value="" disabled>
                        Seçin
                      </option>
                      {producers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-caption text-muted-foreground">SKU</label>
                    <Input name="sku" placeholder="Boş bırakılırsa otomatik" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-caption text-muted-foreground">Ambalaj tipi</label>
                    <select name="packagingType" className={selectClass} defaultValue="KOLI">
                      {PACKAGING_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-caption text-muted-foreground">Paket boyutu</label>
                  <Input name="packSize" placeholder="Örn. 17 kg teneke" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-caption text-muted-foreground">Birim (kg)</label>
                    <Input
                      name="unitFactor"
                      type="number"
                      step="0.001"
                      min="0.001"
                      defaultValue="1"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-caption text-muted-foreground">Baz fiyat (₺)</label>
                    <Input
                      name="priceTl"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0,00"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-caption text-muted-foreground">KDV %</label>
                    <Input name="vatPercent" type="number" step="0.01" min="0" defaultValue="1" />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Ürünü oluştur
                </Button>
              </form>
            </>
          ) : null}

          {mode === "detail" && selected ? (
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
                    placeholder="Ürün açıklaması eklenmemiş. Mağazada gösterilecek metni yazmak için tıklayın"
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
