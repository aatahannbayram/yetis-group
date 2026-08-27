"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ComponentType,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ChevronDown,
  ImagePlus,
  Info,
  Layers,
  Loader2,
  Maximize2,
  Minimize2,
  Package,
  PackageSearch,
  Plus,
  Boxes,
  Search,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cinsLine, packLabel, type PackagingOption } from "@/lib/format/packaging";
import { catalogFallbackImage } from "@/content/catalog-images";
import { CatalogImage } from "@/components/store/catalog-image";
import { DataTable } from "@/components/ui/data-table";
import { EditablePrice } from "@/components/admin/editable-price";
import { EditableTextarea } from "@/components/admin/editable-textarea";
import {
  createProductAction,
  updateVariantPriceAction,
  updateProductDescriptionAction,
  uploadProductImageAction,
  loadAdminProductsPageAction,
} from "@/app/(panel)/panel/urunler/actions";
import { DensityToggle, type Density } from "@/components/ui/density-toggle";
import { ViewSwitcher, type ViewMode } from "@/components/ui/view-switcher";
import { cn } from "@/lib/utils";
import { ProductExcelToolbar } from "@/components/admin/product-excel-toolbar";
import { ProductLoadMore } from "@/components/ui/product-load-more";

const kgFormatter = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});
function formatStockKg(kg: number) {
  return `${kgFormatter.format(kg)} kg`;
}

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

function isAcceptedImageFile(file: File): boolean {
  if (ACCEPTED_IMAGE_TYPES.includes(file.type.toLowerCase())) return true;
  return /\.(jpe?g|png|webp|avif|gif)$/i.test(file.name);
}

const selectClass =
  "h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none transition-shadow placeholder:text-[var(--text-muted)] focus-visible:border-[var(--primary-solid)] focus-visible:ring-4 focus-visible:ring-[var(--primary-solid)]/15";

const fieldLabelClass = "text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]";

export type ProductRowVariant = {
  id: string;
  sku: string;
  packSize: string | null;
  packagingType: string;
  baseUnit: string;
  unitFactor: string;
  moq: number;
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
  initialProducts,
  initialNextCursor,
  totalProductCount,
  categories,
  producers,
  packagingOptions,
}: {
  initialProducts: ProductRow[];
  initialNextCursor: string | null;
  totalProductCount: number;
  categories: { id: string; name: string }[];
  producers: { id: string; name: string }[];
  packagingOptions: PackagingOption[];
}) {
  const [mode, setMode] = useState<"closed" | "create" | "detail">("closed");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [density, setDensity] = useState<Density>("comfortable");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [fullScreen, setFullScreen] = useState(false);
  const [isCreating, startCreateTransition] = useTransition();
  const [products, setProducts] = useState(initialProducts);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loadingMore, startLoadMore] = useTransition();
  const [filtering, startFilter] = useTransition();
  const deferredSearch = useDeferredValue(search);
  const selected = products.find((p) => p.id === selectedId) ?? null;

  useEffect(() => {
    setProducts(initialProducts);
    setNextCursor(initialNextCursor);
  }, [initialProducts, initialNextCursor]);

  useEffect(() => {
    const q = deferredSearch.trim();
    if (!q && !categoryFilter) {
      setProducts(initialProducts);
      setNextCursor(initialNextCursor);
      return;
    }
    startFilter(async () => {
      const page = await loadAdminProductsPageAction({
        q: q || undefined,
        categoryName: categoryFilter ?? undefined,
      });
      setProducts(page.items);
      setNextCursor(page.nextCursor);
    });
  }, [deferredSearch, categoryFilter, initialProducts, initialNextCursor]);

  function openCreate() {
    setSelectedId(null);
    setMode("create");
  }

  function openDetail(id: string) {
    setSelectedId(id);
    setMode("detail");
  }

  function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startCreateTransition(async () => {
      try {
        await createProductAction(formData);
        toast.success("Ürün oluşturuldu");
        close();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Ürün oluşturulamadı");
      }
    });
  }

  function close() {
    setMode("closed");
    setSelectedId(null);
    setFullScreen(false);
  }

  const loadMore = useCallback(() => {
    if (!nextCursor || loadingMore) return;
    startLoadMore(async () => {
      const page = await loadAdminProductsPageAction({
        cursor: nextCursor,
        q: deferredSearch.trim() || undefined,
        categoryName: categoryFilter ?? undefined,
      });
      setProducts((prev) => [...prev, ...page.items]);
      setNextCursor(page.nextCursor);
    });
  }, [nextCursor, loadingMore, deferredSearch, categoryFilter]);

  const categoryNames = useMemo(
    () => categories.map((c) => c.name).sort((a, b) => a.localeCompare(b, "tr")),
    [categories],
  );

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateCategoryScrollEdges = useCallback(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateCategoryScrollEdges();
    const el = categoryScrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateCategoryScrollEdges, { passive: true });
    const ro = new ResizeObserver(updateCategoryScrollEdges);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateCategoryScrollEdges);
      ro.disconnect();
    };
  }, [updateCategoryScrollEdges, categoryNames]);

  const hasActiveFilters = Boolean(categoryFilter || search.trim());
  const filtered = products;

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
          return (
            <div className="min-w-0 max-w-[280px]">
              <p className="truncate font-medium text-[var(--text-primary)]" title={row.original.name}>
                {row.original.name}
              </p>
              <p className="truncate text-xs text-[var(--text-muted)]">
                {row.original.variants.length
                  ? cinsLine(
                      row.original.variants.map((v) => ({
                        packSize: v.packSize,
                        packagingType: v.packagingType,
                        unitFactor: v.unitFactor,
                      })),
                    )
                  : "-"}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "categoryName",
        header: "Kategori",
        cell: ({ getValue }) => (
          <span className="rounded-full bg-[var(--surface-3)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">
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
            className="inline-flex size-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--primary-text)]"
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
      className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
      data-density={density}
    >
      <div className="space-y-3 border-b border-[var(--border)] px-3 py-3 sm:px-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1 lg:max-w-md">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün, SKU veya kategori ara…"
              className="h-9 rounded-xl pl-9 text-sm shadow-none"
              aria-label="Ürün, SKU veya kategori ara"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-[var(--text-muted)]"
                onClick={() => {
                  setCategoryFilter(null);
                  setSearch("");
                }}
              >
                <X className="size-3.5" aria-hidden />
                Temizle
              </Button>
            ) : null}
            <ViewSwitcher value={viewMode} onChange={setViewMode} modes={["cards", "table"]} />
            <DensityToggle value={density} onChange={setDensity} />
            <ProductExcelToolbar />
            <Button
              type="button"
              onClick={openCreate}
              className="h-8 gap-1.5 bg-[#1B5E3A] text-white hover:bg-[#164e31]"
            >
              <Plus className="size-4" aria-hidden />
              <span className="hidden sm:inline">Yeni ürün</span>
              <span className="sm:hidden">Yeni</span>
            </Button>
          </div>
        </div>

        <div className="relative">
          {canScrollLeft ? (
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-4 bg-gradient-to-r from-[var(--surface)] to-transparent"
              aria-hidden
            />
          ) : null}
          {canScrollRight ? (
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-[var(--surface)] to-transparent"
              aria-hidden
            />
          ) : null}
          <div
            ref={categoryScrollRef}
            className="flex gap-1.5 overflow-x-auto px-0.5 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <FilterChip
              label="Tümü"
              count={totalProductCount}
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
        </div>

        <div className="flex items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
          <p className="flex items-center gap-1.5">
            {hasActiveFilters ? (
              <>
                <span className="font-medium tabular-nums text-[var(--text-primary)]">
                  {filtered.length}
                </span>
                {" / "}
                {totalProductCount} ürün
              </>
            ) : (
              <>
                <span className="font-medium tabular-nums text-[var(--text-primary)]">
                  {products.length}
                </span>
                {" / "}
                {totalProductCount} ürün
              </>
            )}
            {filtering ? <Loader2 className="size-3 animate-spin" aria-hidden /> : null}
          </p>
          {categoryFilter ? (
            <p className="truncate">
              Kategori: <span className="font-medium text-[var(--text-primary)]">{categoryFilter}</span>
            </p>
          ) : null}
        </div>
      </div>

      {viewMode === "cards" ? (
        <div className="bg-[var(--surface-2)] p-3 sm:p-4">
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpen={() => openDetail(product.id)}
                />
              ))}
            </div>
          )}
          <ProductLoadMore
            loadedCount={filtered.length}
            totalCount={totalProductCount}
            hasMore={Boolean(nextCursor)}
            loading={loadingMore}
            onLoadMore={loadMore}
            className="bg-[var(--surface-2)]"
          />
        </div>
      ) : (
        <>
        <DataTable
          data={filtered}
          columns={columns}
          getRowId={getRowId}
          storageKey="panel-products"
          search=""
          globalFilterFn={globalFilterFn}
          initialPageSize={32}
          pageSizeOptions={[32, 64, 100]}
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
        <ProductLoadMore
          loadedCount={filtered.length}
          totalCount={totalProductCount}
          hasMore={Boolean(nextCursor)}
          loading={loadingMore}
          onLoadMore={loadMore}
        />
        </>
      )}

      <Sheet open={mode !== "closed"} onOpenChange={(open) => !open && close()}>
        <SheetContent
          className={cn(
            "flex w-full flex-col overflow-hidden border-[var(--border)] bg-[var(--surface)] p-0",
            fullScreen ? "sm:max-w-full" : "sm:max-w-lg",
          )}
          style={fullScreen ? { width: "100vw", maxWidth: "100vw" } : undefined}
        >
                  <button
                    type="button"
            onClick={() => setFullScreen((v) => !v)}
            className="absolute top-3 right-12 inline-flex size-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--primary-text)]"
            title={fullScreen ? "Daralt" : "Tam ekran"}
            aria-label={fullScreen ? "Daralt" : "Tam ekran"}
          >
            {fullScreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                  </button>

          {mode === "create" ? (
            <>
              <SheetHeader className="border-b border-[var(--border)] pb-4">
                <SheetTitle>Yeni ürün</SheetTitle>
                <SheetDescription>
                  Ürün, görseli ve varsayılan paketi tek seferde oluşturun. Lotu daha sonra ekleyebilirsiniz.
                </SheetDescription>
              </SheetHeader>

              <form onSubmit={submitCreate} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
                  <div className={cn(fullScreen ? "grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2 lg:items-start" : "space-y-6")}>
                    <div className="space-y-6">
                      <FormSection icon={Info} title="Temel bilgiler">
                        <div className="space-y-1.5">
                          <label className={fieldLabelClass}>Ürün adı</label>
                          <Input
                            name="name"
                            required
                            placeholder="Örn. Beyaz Peynir 17 kg Teneke"
                            className={selectClass}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className={fieldLabelClass}>Açıklama</label>
                          <textarea
                            name="description"
                            rows={3}
                            className={cn(selectClass, "min-h-[5rem] py-2")}
                            placeholder="Mağazada görünecek kısa açıklama"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className={fieldLabelClass}>Kategori</label>
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
                          <div className="space-y-1.5">
                            <label className={fieldLabelClass}>Üretici</label>
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
                      </FormSection>

                      <FormSection icon={ImagePlus} title="Görsel">
                        <CreateImageDropzone />
                      </FormSection>
                    </div>

                    <div className="space-y-6">
                      <FormSection icon={Package} title="Paket & fiyat">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className={fieldLabelClass}>SKU</label>
                            <Input name="sku" placeholder="Boş = otomatik" className={selectClass} />
                          </div>
                          <div className="space-y-1.5">
                            <label className={fieldLabelClass}>Barkod</label>
                            <Input name="barcode" placeholder="Örn. 8690000000000" className={selectClass} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className={fieldLabelClass}>Ambalaj</label>
                            <select name="packagingType" className={selectClass} defaultValue="KOLI">
                              {packagingOptions.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className={fieldLabelClass}>Paket boyutu</label>
                            <Input name="packSize" placeholder="Örn. 17 kg teneke" className={selectClass} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className={fieldLabelClass}>Birim (kg)</label>
                            <Input
                              name="unitFactor"
                              type="number"
                              step="0.001"
                              min="0.001"
                              defaultValue="1"
                              required
                              className={cn(selectClass, "tabular-nums")}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className={fieldLabelClass}>Min. sipariş adedi</label>
                            <Input
                              name="moq"
                              type="number"
                              step="1"
                              min="1"
                              defaultValue="1"
                              className={cn(selectClass, "tabular-nums")}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className={fieldLabelClass}>Fiyat (₺)</label>
                            <Input
                              name="priceTl"
                              type="number"
                              step="0.01"
                              min="0"
                              required
                              placeholder="0,00"
                              className={cn(selectClass, "tabular-nums")}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className={fieldLabelClass}>KDV %</label>
                            <Input
                              name="vatPercent"
                              type="number"
                              step="0.01"
                              min="0"
                              defaultValue="1"
                              className={cn(selectClass, "tabular-nums")}
                            />
                          </div>
                        </div>
                      </FormSection>

                      <CollapsibleSection icon={Layers} title="Derinlik" subtitle="Opsiyonel">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className={fieldLabelClass}>Saklama koşulu</label>
                            <Input
                              name="storageCondition"
                              placeholder="Örn. +4°C soğuk zincir"
                              className={selectClass}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className={fieldLabelClass}>Raf ömrü (gün)</label>
                            <Input name="shelfLifeDays" type="number" step="1" min="0" className={selectClass} />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                          <input
                            type="checkbox"
                            name="requiresColdChain"
                            defaultChecked
                            className="size-4 rounded border-[var(--border-strong)] text-[var(--primary-solid)] focus:ring-[var(--primary-solid)]/30"
                          />
                          Soğuk zincir gerekli
                        </label>
                        <div className="space-y-1.5">
                          <label className={fieldLabelClass}>Kullanım önerisi</label>
                          <textarea
                            name="usageTips"
                            rows={2}
                            className={cn(selectClass, "min-h-[3.5rem] py-2")}
                            placeholder="Örn. Açıldıktan sonra 5 gün içinde tüketin"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={fieldLabelClass}>Teknik föy URL</label>
                          <Input name="techSheetUrl" type="url" placeholder="https://…" className={selectClass} />
                        </div>
                      </CollapsibleSection>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[var(--border)] bg-[var(--surface)] p-4">
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="h-11 w-full gap-1.5 rounded-full bg-[var(--primary-solid)] text-white hover:bg-[var(--primary-hover)]"
                  >
                    {isCreating ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <Plus className="size-4" aria-hidden />
                    )}
                    {isCreating ? "Oluşturuluyor…" : "Ürünü oluştur"}
                  </Button>
                </div>
              </form>
            </>
          ) : null}

          {mode === "detail" && selected ? (
            <>
              <SheetHeader className="border-b border-[var(--border)] pb-4">
                <div className="flex items-start gap-3">
                  <ProductThumb product={selected} size={56} className="rounded-xl" />
                  <div className="min-w-0">
                    <SheetTitle className="truncate">{selected.name}</SheetTitle>
                    <SheetDescription>{selected.categoryName}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-5 sm:px-5">
                <div className="flex flex-wrap gap-2">
                  <StockBadge kg={selected.stockKg} />
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-3)] px-2.5 py-1 text-xs text-[var(--text-secondary)]">
                    <Boxes className="size-3" />
                    {selected.variants.length} cins
                  </span>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-medium text-[var(--text-muted)]">Açıklama</p>
                  <EditableTextarea
                    value={selected.description}
                    placeholder="Ürün açıklaması eklenmemiş. Mağazada gösterilecek metni yazmak için tıklayın"
                    onSave={(value) =>
                      updateProductDescriptionAction(selected.id, selected.slug, value)
                    }
                  />
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-medium text-[var(--text-muted)]">Cinsler / fiyat</p>
                  <div className="space-y-2">
                    {selected.variants.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)]">
                            {packLabel(v.packSize, v.packagingType)}
                          </p>
                          <p className="truncate font-mono text-[11px] text-[var(--text-muted)]">{v.sku}</p>
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
                    <p className="mb-1.5 text-xs font-medium text-[var(--text-muted)]">Görseller</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.media.map((m) => (
                        <div
                          key={m.id}
                          className="relative size-16 overflow-hidden rounded-xl bg-[var(--surface-3)]"
                        >
                          <CatalogImage src={m.url} alt={m.alt ?? ""} className="object-cover" sizes="64px" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <SheetImageUpload productId={selected.id} slug={selected.slug} />

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
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={cn(
        "inline-flex max-w-[9.5rem] shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors",
        active
          ? "border-[var(--primary-solid)] bg-[var(--primary-solid)] text-white shadow-sm"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]",
      )}
    >
      <span className="truncate">{label}</span>
      {count !== undefined ? (
        <span
          className={cn(
            "shrink-0 rounded px-1 py-px text-[10px] tabular-nums",
            active ? "bg-white/15 text-white" : "bg-[var(--surface-3)] text-[var(--text-muted)]",
          )}
        >
          {count}
        </span>
      ) : null}
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
        tone === "empty" && "bg-[var(--surface-3)] text-[var(--text-muted)]",
      )}
    >
      {formatStockKg(kg)}
    </span>
  );
}

function productCoverSrc(product: ProductRow): string | null {
  const uploaded =
    product.imageUrl ?? product.media.find((m) => m.isPrimary)?.url ?? product.media[0]?.url ?? null;
  return catalogFallbackImage(product.categoryName, uploaded);
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
  const src = productCoverSrc(product);
  return (
    <div
      style={{ width: size, height: size }}
      className={cn("relative shrink-0 overflow-hidden rounded-xl bg-[var(--surface-3)]", className)}
    >
      <CatalogImage src={src} alt="" className="object-cover" sizes={`${size}px`} />
    </div>
  );
}

function ProductCard({ product, onOpen }: { product: ProductRow; onOpen: () => void }) {
  const variant = product.variants[0];
  const cover = productCoverSrc(product);
  const categorySrc = catalogFallbackImage(product.categoryName, null);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]",
        "shadow-sm transition-[box-shadow,border-color] duration-200 ease-out",
        "hover:border-[var(--border-strong)] hover:shadow-md",
      )}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        className="block w-full cursor-pointer text-left"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-3)]">
          <CatalogImage
            src={cover}
            fallbackSrc={categorySrc === cover ? null : categorySrc}
            alt={product.name}
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 90vw"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
            <span className="rounded-full bg-[var(--surface)]/90 px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)] shadow-sm backdrop-blur-sm">
              {product.categoryName}
            </span>
            <StockBadge kg={product.stockKg} />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3.5">
          <div className="min-w-0">
            <h3
              className="line-clamp-2 text-[15px] leading-snug font-semibold tracking-[-0.01em] text-[var(--text-primary)] transition-colors duration-200 group-hover:text-[var(--primary-text)]"
              title={product.name}
            >
              {product.name}
            </h3>
            <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
              {product.variants.length
                ? cinsLine(
                    product.variants.map((v) => ({
                      packSize: v.packSize,
                      packagingType: v.packagingType,
                      unitFactor: v.unitFactor,
                    })),
                  )
                : "Cins yok"}
            </p>
          </div>

          <div className="mt-auto pt-1">
            <div
              className="min-w-0"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <p className="text-[10px] font-medium tracking-wide text-[var(--text-muted)] uppercase">
                Baz fiyat
              </p>
              {variant ? (
                <EditablePrice
                  priceKurus={variant.pricePerUnitKurus}
                  onSave={(kurus) => updateVariantPriceAction(variant.id, kurus)}
                />
              ) : (
                <p className="text-base font-semibold text-[var(--text-muted)]">—</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] px-3 py-2">
        <p className="truncate font-mono text-[11px] text-[var(--text-muted)]">
          {variant?.sku ?? "SKU yok"}
        </p>
        <Link
          href={`/panel/urunler/${product.slug}`}
          className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--primary-text)]"
          onClick={(e) => e.stopPropagation()}
        >
          Düzenle
          <ArrowUpRight className="size-3" />
        </Link>
      </div>
    </article>
  );
}

function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--primary-subtle)] text-[var(--primary-text)]">
          <Icon className="size-3.5" aria-hidden />
        </span>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function CollapsibleSection({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 p-4 text-left sm:p-5"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--surface-3)] text-[var(--text-muted)]">
            <Icon className="size-3.5" aria-hidden />
          </span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">{title}</span>
          {subtitle ? (
            <span className="text-[length:var(--text-caption)] text-[var(--text-muted)]">{subtitle}</span>
          ) : null}
        </span>
        <ChevronDown
          className={cn("size-4 text-[var(--text-muted)] transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open ? <div className="space-y-4 border-t border-[var(--border)] p-4 sm:p-5">{children}</div> : null}
    </section>
  );
}

function SheetImageUpload({ productId, slug }: { productId: string; slug: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  function onPick(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!isAcceptedImageFile(file)) {
      toast.error("Desteklenmeyen dosya türü. JPG, PNG, WEBP, AVIF veya GIF kullanın");
      return;
    }
    const fd = new FormData();
    fd.set("productId", productId);
    fd.set("slug", slug);
    fd.set("file", file);
    startTransition(async () => {
      try {
        await uploadProductImageAction(fd);
        toast.success("Görsel kaydedildi");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Görsel yüklenemedi");
      }
    });
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-[var(--text-muted)]">Kapak görseli</p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => onPick(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        className="h-10 w-full gap-1.5 rounded-xl"
        onClick={() => inputRef.current?.click()}
      >
        {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ImagePlus className="size-4" aria-hidden />}
        {isPending ? "Yükleniyor…" : "JPG / PNG yükle"}
      </Button>
      <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">
        Kayıtlı kapak yoksa kartta kategori görseli görünür. Bu yükleme ürüne bağlanır.
      </p>
    </div>
  );
}

function CreateImageDropzone() {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  function clearFile() {
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function applyFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!isAcceptedImageFile(file)) {
      setError("Desteklenmeyen dosya türü. JPG, PNG, WEBP, AVIF veya GIF kullanın");
      return;
    }
    setError(null);
    const dt = new DataTransfer();
    dt.items.add(file);
    if (inputRef.current) inputRef.current.files = dt.files;
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setFileName(file.name);
  }

  return (
    <div>
      {preview ? (
        <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-2)] p-3">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-3)]">
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview before upload */}
            <img src={preview} alt="" className="size-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">{fileName}</p>
            <p className="text-[length:var(--text-caption)] text-[var(--text-muted)]">Kapak görseli</p>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--danger-subtle)] hover:text-[var(--danger-text)]"
            aria-label="Görseli kaldır"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ) : (
        <div
          className={cn(
            "relative flex flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed p-6 text-center transition-colors duration-[var(--motion-hover)]",
            dragActive
              ? "border-[var(--primary-solid)] bg-[var(--primary-subtle)]"
              : "border-[var(--border-strong)] bg-[var(--surface-2)] hover:border-[var(--primary-solid)]/60",
          )}
          onDragEnter={(e) => {
            e.preventDefault();
            dragCounter.current += 1;
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            dragCounter.current -= 1;
            if (dragCounter.current <= 0) setDragActive(false);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            dragCounter.current = 0;
            applyFiles(e.dataTransfer.files);
          }}
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--primary-text)] shadow-[var(--shadow-sm)]">
            <ImagePlus className="size-5" aria-hidden />
          </span>
          <p className="text-sm font-medium text-[var(--text-primary)]">Görseli buraya sürükleyip bırakın</p>
          <p className="text-[length:var(--text-caption)] text-[var(--text-muted)]">
            veya{" "}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="font-medium text-[var(--primary-text)] underline-offset-2 hover:underline"
            >
              bilgisayardan seçin
            </button>{" "}
            · JPG, PNG, WEBP, AVIF, GIF · en fazla 8 MB
          </p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        name="image"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => applyFiles(e.target.files)}
      />
      {error ? <p className="mt-1.5 text-[length:var(--text-caption)] text-[var(--danger-text)]">{error}</p> : null}
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--surface-3)] text-[var(--text-muted)]">
        <PackageSearch className="size-6" />
      </div>
      <p className="mt-4 text-sm font-semibold text-[var(--text-primary)]">Katalog boş</p>
      <p className="mt-1 max-w-xs text-sm text-[var(--text-muted)]">
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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--surface-3)] text-[var(--text-muted)]">
        <PackageSearch className="size-6" />
      </div>
      <p className="mt-4 text-sm font-semibold text-[var(--text-primary)]">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-[var(--text-muted)]">{description}</p>
      <Button type="button" variant="outline" onClick={onClear} className="mt-5 gap-1.5">
        Filtreyi temizle
      </Button>
    </div>
  );
}
