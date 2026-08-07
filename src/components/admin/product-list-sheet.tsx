"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Maximize2, PackageSearch, Plus } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [density, setDensity] = useState<Density>("compact");
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

  const getRowId = useCallback((r: ProductRow) => r.id, []);
  const globalFilterFn = useCallback(
    (row: ProductRow, q: string) => {
      const variant = row.variants[0];
      return (
        row.name.toLocaleLowerCase("tr-TR").includes(q) ||
        row.categoryName.toLocaleLowerCase("tr-TR").includes(q) ||
        (variant?.sku.toLocaleLowerCase("tr-TR").includes(q) ?? false)
      );
    },
    [],
  );

  const columns = useMemo<ColumnDef<ProductRow, unknown>[]>(
    () => [
      {
        id: "thumb",
        header: "",
        size: 48,
        enableSorting: false,
        cell: ({ row }) =>
          row.original.imageUrl ? (
            <Image
              src={row.original.imageUrl}
              alt=""
              width={40}
              height={40}
              className="size-10 rounded-[var(--radius-sm)] object-cover"
            />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--surface-3)] text-[var(--text-muted)]">
              <PackageSearch className="size-4" aria-hidden />
            </div>
          ),
      },
      {
        accessorKey: "name",
        header: "Ürün",
        minSize: 200,
        cell: ({ row }) => {
          const variant = row.original.variants[0];
          return (
            <div className="min-w-0 max-w-[280px]">
              <p className="truncate font-medium text-[var(--text-primary)]" title={row.original.name}>
                {row.original.name}
              </p>
              <p className="truncate text-[length:var(--text-caption)] text-[var(--text-muted)]">
                {variant?.packSize ?? variant?.packagingType ?? "-"}
              </p>
            </div>
          );
        },
      },
      {
        id: "sku",
        header: "SKU",
        cell: ({ row }) => (
          <span className="font-mono text-[length:var(--text-caption)] tabular-nums text-[var(--text-secondary)]">
            {row.original.variants[0]?.sku ?? "-"}
          </span>
        ),
      },
      {
        accessorKey: "categoryName",
        header: "Kategori",
        cell: ({ getValue }) => (
          <span className="text-[var(--text-secondary)]">{String(getValue())}</span>
        ),
      },
      {
        id: "vat",
        header: "KDV",
        cell: ({ row }) => {
          const bp = row.original.variants[0]?.vatRateBasisPoints;
          return (
            <span className="tabular-nums text-[var(--text-secondary)]">
              {bp != null ? `%${(bp / 100).toString()}` : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "stockKg",
        header: "Stok",
        cell: ({ row }) => (
          <span className="tabular-nums text-[var(--text-primary)]">
            {formatStockKg(row.original.stockKg)}
          </span>
        ),
      },
      {
        id: "price",
        header: "Baz fiyat",
        enableSorting: false,
        cell: ({ row }) => {
          const variant = row.original.variants[0];
          if (!variant) return "-";
          return (
            <div
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
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
            className="inline-flex size-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--primary-text)]"
            title="Tam ekranda aç"
            aria-label={`${row.original.name} tam ekranda aç`}
            onClick={(e) => e.stopPropagation()}
          >
            <Maximize2 className="size-3.5" />
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-3" data-density={density}>
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Ürün, SKU veya kategori ara…"
        density={density}
        onDensityChange={setDensity}
        trailing={
          <Button type="button" onClick={openCreate} className="h-8 gap-1.5">
            <Plus className="size-4" aria-hidden />
            Yeni ürün
          </Button>
        }
      />

      <DataTable
        data={products}
        columns={columns}
        getRowId={getRowId}
        storageKey="panel-products"
        search={search}
        globalFilterFn={globalFilterFn}
        onRowOpen={(row) => openDetail(row.id)}
        emptyTitle="Ürün yok"
        emptyDescription="Yeni ürün ekleyerek kataloğu doldurun."
        emptyAction={
          <Button type="button" onClick={openCreate} className="gap-1.5">
            <Plus className="size-4" aria-hidden />
            Yeni ürün
          </Button>
        }
      />

      <Sheet open={mode !== "closed"} onOpenChange={(open) => !open && close()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {mode === "create" ? (
            <>
              <SheetHeader>
                <SheetTitle>Yeni ürün</SheetTitle>
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
                  <Link href={`/panel/urunler/${selected.slug}`}>
                    <Maximize2 className="size-3.5" />
                    Tam ekranda aç &amp; düzenle
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
