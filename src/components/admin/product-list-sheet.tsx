"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpRight,
  Maximize2,
  PackageSearch,
  Plus,
  Boxes,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { EditablePrice } from "@/components/admin/editable-price";
import { EditableTextarea } from "@/components/admin/editable-textarea";
import {
  createProductAction,
  updateVariantPriceAction,
  updateProductDescriptionAction,
} from "@/app/(panel)/panel/urunler/actions";
import type { Density } from "@/components/ui/density-toggle";
import type { ViewMode } from "@/components/ui/view-switcher";
import { cn } from "@/lib/utils";
import { Stagger, StaggerItem } from "@/components/motion/fade-up";
import { HoverLift } from "@/components/motion/hover-lift";
import { ProductExcelToolbar } from "@/components/admin/product-excel-toolbar";

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
  "h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none focus-visible:border-[#1B5E3A] focus-visible:ring-4 focus-visible:ring-[#1B5E3A]/15 dark:border-zinc-800 dark:bg-zinc-950";

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

function stockTone(kg: number): "ok" | "low" | "empty" {
  if (kg <= 0) return "empty";
  if (kg < 50) return "low";
  return "ok";
}

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
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [density, setDensity] = useState<Density>("comfortable");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
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

  const categoryNames = useMemo(() => {
    const set = new Set(products.map((p) => p.categoryName));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [products]);

  const filtered = useMemo(() => {
    let rows = products;
    if (categoryFilter) {
      rows = rows.filter((p) => p.categoryName === categoryFilter);
    }
    const q = search.trim().toLocaleLowerCase("tr-TR");
    if (!q) return rows;
    return rows.filter((row) => {
      const variant = row.variants[0];
      return (
        row.name.toLocaleLowerCase("tr-TR").includes(q) ||
        row.categoryName.toLocaleLowerCase("tr-TR").includes(q) ||
        (variant?.sku.toLocaleLowerCase("tr-TR").includes(q) ?? false)
      );
    });
  }, [products, search, categoryFilter]);

  const getRowId = useCallback((r: ProductRow) => r.id, []);
  const globalFilterFn = useCallback(() => true, []);

  const columns = useMemo<ColumnDef<ProductRow, unknown>[]>(
    () => [
      {
        id: "thumb",
        header: "",
        size: 56,
        enableSorting: false,
        cell: ({ row }) => <ProductThumb product={row.original} size={44} />,
      },
      {
        accessorKey: "name",
        header: "Ürün",
        minSize: 200,
        cell: ({ row }) => {
          const variant = row.original.variants[0];
          return (
            <div className="min-w-0 max-w-[280px]">
              <p className="truncate font-medium text-stone-900 dark:text-zinc-50" title={row.original.name}>
                {row.original.name}
              </p>
              <p className="truncate text-xs text-stone-500">
                {variant?.packSize ?? variant?.packagingType ?? "—"}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "categoryName",
        header: "Kategori",
        cell: ({ getValue }) => (
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600 dark:bg-zinc-800 dark:text-zinc-300">
            {String(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "stockKg",
        header: "Stok",
        cell: ({ row }) => (
          <StockBadge kg={row.original.stockKg} />
        ),
      },
      {
        id: "price",
        header: "Baz fiyat",
        enableSorting: false,
        cell: ({ row }) => {
          const variant = row.original.variants[0];
          if (!variant) return "—";
          return (
            <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
              <EditablePrice
                priceKurus={variant.pricePerUnitKurus}
                onSave={(kurus) => updateVariantPriceAction(variant.id, kurus)}
              />
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        size: 44,
        enableSorting: false,
        cell: ({ row }) => (
          <Link
            href={`/panel/urunler/${row.original.slug}`}
            className="inline-flex size-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-[#1B5E3A]"
            title="Detay"
            aria-label={`${row.original.name} detay`}
            onClick={(e) => e.stopPropagation()}
          >
            <ArrowUpRight className="size-3.5" />
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <div
      className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      data-density={density}
    >
      <div className="border-b border-stone-100 px-3 py-2.5 dark:border-zinc-800">
        <ListToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Ürün, SKU veya kategori ara…"
          density={density}
          onDensityChange={setDensity}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          viewModes={["cards", "table"]}
          filters={
            <div className="flex max-w-full gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <FilterChip
                label="Tümü"
                active={!categoryFilter}
                onClick={() => setCategoryFilter(null)}
              />
              {categoryNames.map((name) => (
                <FilterChip
                  key={name}
                  label={name}
                  active={categoryFilter === name}
                  onClick={() => setCategoryFilter(name)}
                />
              ))}
            </div>
          }
          trailing={
            <div className="flex flex-wrap items-center justify-end gap-2">
              <ProductExcelToolbar />
              <Button
                type="button"
                onClick={openCreate}
                className="h-8 gap-1.5 bg-[#1B5E3A] text-white hover:bg-[#164e31]"
              >
                <Plus className="size-4" aria-hidden />
                Yeni ürün
              </Button>
            </div>
          }
          className="!static !mx-0 !border-0 !bg-transparent !p-0 !backdrop-blur-none"
        />
      </div>

      {viewMode === "cards" ? (
        <div className="bg-stone-50/60 p-3 sm:p-4 dark:bg-zinc-950/40">
          {filtered.length === 0 ? (
            categoryFilter || search.trim() ? (
              <FilterEmptyState
                title={
                  categoryFilter
                    ? `"${categoryFilter}" kategorisinde ürün yok`
                    : "Arama sonucu boş"
                }
                description="Filtreyi veya aramayı temizleyip tekrar deneyin."
                onClear={() => {
                  setCategoryFilter(null);
                  setSearch("");
                }}
              />
            ) : (
              <EmptyState onCreate={openCreate} />
            )
          ) : (
            <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => (
                <StaggerItem key={product.id}>
                  <HoverLift>
                    <ProductCard
                      product={product}
                      onOpen={() => openDetail(product.id)}
                    />
                  </HoverLift>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          getRowId={getRowId}
          storageKey="panel-products"
          search=""
          globalFilterFn={globalFilterFn}
          onRowOpen={(row) => openDetail(row.id)}
          emptyTitle={
            categoryFilter || search.trim()
              ? "Filtre sonucu boş"
              : "Ürün yok"
          }
          emptyDescription={
            categoryFilter || search.trim()
              ? "Kategori veya aramayı temizleyip tekrar deneyin."
              : "Yeni ürün ekleyerek kataloğu doldurun."
          }
          filterEmptyTitle="Filtre sonucu boş"
          filterEmptyDescription="Kategori veya aramayı temizleyip tekrar deneyin."
          emptyAction={
            categoryFilter || search.trim() ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCategoryFilter(null);
                  setSearch("");
                }}
                className="gap-1.5"
              >
                Filtreyi temizle
              </Button>
            ) : (
              <Button type="button" onClick={openCreate} className="gap-1.5">
                <Plus className="size-4" aria-hidden />
                Yeni ürün
              </Button>
            )
          }
        />
      )}

      <Sheet open={mode !== "closed"} onOpenChange={(open) => !open && close()}>
        <SheetContent className="w-full overflow-y-auto border-stone-200 sm:max-w-lg dark:border-zinc-800">
          {mode === "create" ? (
            <>
              <SheetHeader>
                <SheetTitle>Yeni ürün</SheetTitle>
                <SheetDescription>
                  Ürün ve varsayılan paket birlikte oluşur. Fotoğraf ve lotu sonra ekleyebilirsiniz.
                </SheetDescription>
              </SheetHeader>

              <form
                action={createProductAction}
                onSubmit={close}
                className="flex-1 space-y-4 overflow-y-auto px-4 pb-4"
              >
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-500">Ürün adı</label>
                  <Input name="name" required placeholder="Örn. Beyaz Peynir 17 kg Teneke" className="h-10" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-500">Açıklama</label>
                  <textarea
                    name="description"
                    rows={3}
                    className={cn(selectClass, "min-h-[5rem] py-2")}
                    placeholder="Mağazada görünecek kısa açıklama"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-500">Kategori</label>
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
                    <label className="text-xs font-medium text-stone-500">Üretici</label>
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
                    <label className="text-xs font-medium text-stone-500">SKU</label>
                    <Input name="sku" placeholder="Boş = otomatik" className="h-10" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-500">Ambalaj</label>
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
                  <label className="text-xs font-medium text-stone-500">Paket boyutu</label>
                  <Input name="packSize" placeholder="Örn. 17 kg teneke" className="h-10" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-500">Birim (kg)</label>
                    <Input
                      name="unitFactor"
                      type="number"
                      step="0.001"
                      min="0.001"
                      defaultValue="1"
                      required
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-500">Fiyat (₺)</label>
                    <Input
                      name="priceTl"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0,00"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-500">KDV %</label>
                    <Input name="vatPercent" type="number" step="0.01" min="0" defaultValue="1" className="h-10" />
                  </div>
                </div>

                <Button type="submit" className="h-10 w-full bg-[#1B5E3A] text-white hover:bg-[#164e31]">
                  Ürünü oluştur
                </Button>
              </form>
            </>
          ) : null}

          {mode === "detail" && selected ? (
            <>
              <SheetHeader>
                <div className="flex items-start gap-3">
                  <ProductThumb product={selected} size={56} className="rounded-xl" />
                  <div className="min-w-0">
                    <SheetTitle className="truncate">{selected.name}</SheetTitle>
                    <SheetDescription>{selected.categoryName}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
                <div className="flex flex-wrap gap-2">
                  <StockBadge kg={selected.stockKg} />
                  <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600 dark:bg-zinc-800 dark:text-zinc-300">
                    <Boxes className="size-3" />
                    {selected.variants.length} paket tipi
                  </span>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-medium text-stone-500">Açıklama</p>
                  <EditableTextarea
                    value={selected.description}
                    placeholder="Ürün açıklaması eklenmemiş. Mağazada gösterilecek metni yazmak için tıklayın"
                    onSave={(value) =>
                      updateProductDescriptionAction(selected.id, selected.slug, value)
                    }
                  />
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-medium text-stone-500">Paketler / fiyat</p>
                  <div className="space-y-2">
                    {selected.variants.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between rounded-xl border border-stone-200 px-3 py-2.5 dark:border-zinc-800"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-stone-800 dark:text-zinc-100">
                            {v.packSize ?? v.packagingType}
                          </p>
                          <p className="truncate font-mono text-[11px] text-stone-400">{v.sku}</p>
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
                    <p className="mb-1.5 text-xs font-medium text-stone-500">Görseller</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.media.map((m) => (
                        <div
                          key={m.id}
                          className="relative size-16 overflow-hidden rounded-xl bg-stone-100 dark:bg-zinc-800"
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

                <Button asChild className="h-10 w-full gap-1.5 bg-[#1B5E3A] text-white hover:bg-[#164e31]">
                  <Link href={`/panel/urunler/${selected.slug}`}>
                    <Maximize2 className="size-3.5" />
                    Tam ekranda düzenle
                  </Link>
                </Button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-[#1B5E3A] text-white"
          : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300",
      )}
    >
      {label}
    </button>
  );
}

function StockBadge({ kg }: { kg: number }) {
  const tone = stockTone(kg);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
        tone === "ok" && "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
        tone === "low" && "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
        tone === "empty" && "bg-stone-100 text-stone-500 dark:bg-zinc-800 dark:text-zinc-400",
      )}
    >
      {formatStockKg(kg)}
    </span>
  );
}

function ProductThumb({
  product,
  size,
  className,
}: {
  product: ProductRow;
  size: number;
  className?: string;
}) {
  const src = product.imageUrl ?? product.media.find((m) => m.isPrimary)?.url ?? product.media[0]?.url;
  if (src) {
    return (
      <div
        style={{ width: size, height: size }}
        className={cn("relative shrink-0 overflow-hidden rounded-xl bg-stone-100 dark:bg-zinc-800", className)}
      >
        <Image src={src} alt="" fill className="object-cover" sizes={`${size}px`} />
      </div>
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-400 dark:bg-zinc-800",
        className,
      )}
    >
      <PackageSearch className="size-5" aria-hidden />
    </div>
  );
}

function ProductCard({ product, onOpen }: { product: ProductRow; onOpen: () => void }) {
  const variant = product.variants[0];
  const cover =
    product.imageUrl ?? product.media.find((m) => m.isPrimary)?.url ?? product.media[0]?.url ?? null;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white",
        "shadow-sm transition-[transform,box-shadow,border-color] duration-200",
        "hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md",
        "dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700",
      )}
    >
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-zinc-800">
          {cover ? (
            <Image
              src={cover}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 90vw"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-stone-300">
              <PackageSearch className="size-10" aria-hidden />
            </div>
          )}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-stone-700 shadow-sm backdrop-blur-sm dark:bg-zinc-900/90 dark:text-zinc-200">
              {product.categoryName}
            </span>
            <StockBadge kg={product.stockKg} />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3.5">
          <div className="min-w-0">
            <h3
              className="line-clamp-2 text-[15px] leading-snug font-semibold tracking-[-0.01em] text-stone-900 dark:text-zinc-50"
              title={product.name}
            >
              {product.name}
            </h3>
            <p className="mt-1 truncate text-xs text-stone-500">
              {variant?.packSize ?? variant?.packagingType ?? "Paket yok"}
              {product.variants.length > 1 ? ` · +${product.variants.length - 1} paket` : ""}
            </p>
          </div>

          <div className="mt-auto flex items-end justify-between gap-2 pt-1">
            <div
              className="min-w-0"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <p className="text-[10px] font-medium tracking-wide text-stone-400 uppercase">
                Baz fiyat
              </p>
              {variant ? (
                <EditablePrice
                  priceKurus={variant.pricePerUnitKurus}
                  onSave={(kurus) => updateVariantPriceAction(variant.id, kurus)}
                />
              ) : (
                <p className="text-base font-semibold text-stone-400">—</p>
              )}
            </div>
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition-colors group-hover:bg-[#1B5E3A] group-hover:text-white dark:bg-zinc-800">
              <ArrowUpRight className="size-3.5" aria-hidden />
            </span>
          </div>
        </div>
      </button>

      <div className="flex items-center justify-between gap-2 border-t border-stone-100 px-3 py-2 dark:border-zinc-800">
        <p className="truncate font-mono text-[11px] text-stone-400">
          {variant?.sku ?? "SKU yok"}
        </p>
        <Link
          href={`/panel/urunler/${product.slug}`}
          className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-medium text-stone-500 hover:bg-stone-50 hover:text-[#1B5E3A] dark:hover:bg-zinc-800"
          onClick={(e) => e.stopPropagation()}
        >
          Düzenle
          <ArrowUpRight className="size-3" />
        </Link>
      </div>
    </article>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 dark:bg-zinc-800">
        <PackageSearch className="size-6" />
      </div>
      <p className="mt-4 text-sm font-semibold text-stone-800 dark:text-zinc-100">Katalog boş</p>
      <p className="mt-1 max-w-xs text-sm text-stone-500">
        İlk ürünü ekleyin; fotoğraf, fiyat ve stok buradan yönetilir.
      </p>
      <Button
        type="button"
        onClick={onCreate}
        className="mt-5 gap-1.5 bg-[#1B5E3A] text-white hover:bg-[#164e31]"
      >
        <Plus className="size-4" />
        Yeni ürün
      </Button>
    </div>
  );
}

function FilterEmptyState({
  title,
  description,
  onClear,
}: {
  title: string;
  description: string;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 dark:bg-zinc-800">
        <PackageSearch className="size-6" />
      </div>
      <p className="mt-4 text-sm font-semibold text-stone-800 dark:text-zinc-100">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-stone-500">{description}</p>
      <Button type="button" variant="outline" onClick={onClear} className="mt-5 gap-1.5">
        Filtreyi temizle
      </Button>
    </div>
  );
}
