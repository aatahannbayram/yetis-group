"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { ArrowRight, ChevronRight, Package } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { MetricStrip } from "@/components/ui/metric-strip";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { DataTable } from "@/components/ui/data-table";
import { DetailDrawer } from "@/components/ui/detail-drawer";
import { StatusPill, type StatusTone } from "@/components/ui/status-pill";
import { FilterChip } from "@/components/ui/filter-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ShippingRow } from "@/components/admin/shipping-board";
import { ShippingBoard } from "@/components/admin/shipping-board";
import { ShipmentBoard, type ShipmentRow } from "@/components/admin/shipment-board";
import { kg, sum, type Kg } from "@/domain/weight";
import {
  suggestFefoShipment,
  InventoryError,
  type FefoAllocation,
} from "@/domain/inventory/fefo";
import { formatDateShort } from "@/lib/format/date";
import { lotPartyLabel, lotSktLine } from "@/lib/format/lot";
import { catalogFallbackImage } from "@/content/catalog-images";
import { cn } from "@/lib/utils";
import type { Density } from "@/components/ui/density-toggle";
import type { ViewMode } from "@/components/ui/view-switcher";

const kgFmt = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 3 });
function fmtKg(value: Kg) {
  return `${kgFmt.format(value.toNumber())} kg`;
}

function ProductThumb({
  categoryName,
  imageUrl,
  className,
}: {
  categoryName: string;
  imageUrl: string | null;
  className?: string;
}) {
  const src = catalogFallbackImage(categoryName, imageUrl);
  return (
    <div
      className={cn(
        "relative size-11 shrink-0 overflow-hidden rounded-lg bg-stone-100 ring-1 ring-stone-200/80 dark:bg-zinc-800 dark:ring-zinc-700",
        className,
      )}
    >
      {src ? (
        <Image src={src} alt="" fill className="object-cover" sizes="44px" />
      ) : (
        <div className="flex size-full items-center justify-center text-stone-400">
          <Package className="size-4" aria-hidden />
        </div>
      )}
    </div>
  );
}

type VariantRow = ShippingRow & {
  shippableKg: number;
  lotCount: number;
  nearestDays: number | null;
  expiredCount: number;
  soonCount: number;
};

function sktTone(days: number | null, expired: number): StatusTone {
  if (expired > 0 || (days != null && days < 0)) return "skt-danger";
  if (days == null) return "neutral";
  if (days <= 3) return "skt-danger";
  if (days <= 14) return "skt-warn";
  if (days <= 30) return "skt-info";
  return "skt-ok";
}

function priorityOf(row: VariantRow): { label: string; tone: StatusTone } {
  if (row.expiredCount > 0) return { label: "Sevk etme", tone: "skt-danger" };
  if (row.nearestDays != null && row.nearestDays <= 3)
    return { label: "Acil", tone: "skt-danger" };
  if (row.soonCount > 0 || (row.nearestDays != null && row.nearestDays <= 14))
    return { label: "Önce sevk", tone: "skt-warn" };
  return { label: "Normal", tone: "skt-ok" };
}

function urgencyCopy(days: number, expired: boolean): { label: string; tone: StatusTone } {
  if (expired || days < 0) return { label: "Sevk etme", tone: "skt-danger" };
  if (days <= 3) return { label: "Acil", tone: "skt-danger" };
  if (days <= 14) return { label: "Yaklaşıyor", tone: "skt-warn" };
  if (days <= 30) return { label: "Takipte", tone: "skt-info" };
  return { label: "Rahat", tone: "skt-ok" };
}

function LotCard({
  lot,
  rank,
  highlight,
}: {
  lot: ShippingRow["lots"][number];
  rank: number | null;
  highlight?: boolean;
}) {
  const urgency = urgencyCopy(lot.daysUntilExpiry, lot.expired);
  return (
    <li
      className={cn(
        "rounded-xl border px-4 py-3.5 transition-colors",
        lot.expired
          ? "border-red-200 bg-red-50/60 opacity-80 dark:border-red-900/50 dark:bg-red-950/20"
          : highlight
            ? "border-[#1B5E3A]/30 bg-green-50/80 dark:border-green-800 dark:bg-green-950/30"
            : "border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {rank != null && !lot.expired ? (
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#1B5E3A] text-xs font-semibold text-white tabular-nums">
                {rank}
              </span>
            ) : null}
            <p className="font-semibold text-stone-900 dark:text-zinc-50">
              {lotPartyLabel(lot.lotNumber)}
            </p>
            <StatusPill label={urgency.label} tone={urgency.tone} />
          </div>
          <p className="mt-1 text-sm text-stone-500 dark:text-zinc-400">
            {lotSktLine({
              expirationDate: lot.expirationDate,
              daysUntilExpiry: lot.daysUntilExpiry,
              expired: lot.expired,
              formatDate: formatDateShort,
            })}
          </p>
          {highlight && !lot.expired ? (
            <p className="mt-1 text-xs font-medium text-[#1B5E3A]">Önce bu partiden çek</p>
          ) : null}
        </div>
        <p className="shrink-0 text-right">
          <span className="block text-lg font-semibold tabular-nums text-stone-900 dark:text-zinc-50">
            {kgFmt.format(Number(lot.availableKg))}
          </span>
          <span className="text-xs text-stone-500">kg</span>
        </p>
      </div>
    </li>
  );
}

export function ShippingListPage({
  lotRows,
  shipments,
  dealers,
  variants,
}: {
  lotRows: ShippingRow[];
  shipments: ShipmentRow[];
  dealers: { id: string; unvan: string }[];
  variants: { id: string; label: string }[];
}) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [density, setDensity] = useState<Density>("compact");
  const [activeView, setActiveView] = useState("stock");
  const [metricFilter, setMetricFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<VariantRow | null>(null);
  const [sorting, setSorting] = useState<SortingState>([{ id: "nearestDays", desc: false }]);
  const [fefoQty, setFefoQty] = useState("");
  const [fefoAllocations, setFefoAllocations] = useState<FefoAllocation[] | null>(null);
  const [fefoError, setFefoError] = useState<string | null>(null);

  const tableRows: VariantRow[] = useMemo(
    () =>
      lotRows.map((row) => {
        const shippable = sum(row.lots.filter((l) => !l.expired).map((l) => kg(l.availableKg)));
        const activeLots = row.lots.filter((l) => !l.expired);
        const nearest = activeLots.length
          ? Math.min(...activeLots.map((l) => l.daysUntilExpiry))
          : row.lots.length
            ? Math.min(...row.lots.map((l) => l.daysUntilExpiry))
            : null;
        return {
          ...row,
          shippableKg: shippable.toNumber(),
          lotCount: row.lots.length,
          nearestDays: nearest,
          expiredCount: row.lots.filter((l) => l.expired).length,
          soonCount: row.lots.filter((l) => l.expiringSoon).length,
        };
      }),
    [lotRows],
  );

  const metrics = useMemo(() => {
    const expired = tableRows.filter((r) => r.expiredCount > 0).length;
    const soon = tableRows.filter((r) => r.soonCount > 0 && r.expiredCount === 0).length;
    const totalKg = tableRows.reduce((s, r) => s + r.shippableKg, 0);
    return [
      { id: "variants", label: "Ürün", value: tableRows.length },
      {
        id: "shippable",
        label: "Sevk edilebilir",
        value: `${Math.round(totalKg).toLocaleString("tr-TR")} kg`,
      },
      { id: "soon", label: "SKT yaklaşan", value: soon, tone: "warn" as const },
      { id: "expired", label: "SKT geçmiş", value: expired, tone: "danger" as const },
      {
        id: "shipments",
        label: "Açık sevkiyat",
        value: shipments.filter((s) => s.status !== "TESLIM_EDILDI").length,
        tone: "info" as const,
      },
    ];
  }, [tableRows, shipments]);

  const filtered = useMemo(() => {
    let rows = tableRows;
    if (metricFilter === "expired") rows = rows.filter((r) => r.expiredCount > 0);
    if (metricFilter === "soon") rows = rows.filter((r) => r.soonCount > 0);
    return rows;
  }, [tableRows, metricFilter]);

  const sortedLots = useMemo(() => {
    if (!selected) return [];
    return [...selected.lots].sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [selected]);

  const columns = useMemo<ColumnDef<VariantRow, unknown>[]>(
    () => [
      {
        accessorKey: "productName",
        header: "Ürün",
        size: 340,
        minSize: 260,
        cell: ({ row }) => (
          <div className="flex max-w-[22rem] items-center gap-3 py-1">
            <div className="min-w-0 flex-1">
              <p
                className="truncate font-medium text-stone-900 dark:text-zinc-50"
                title={row.original.productName}
              >
                {row.original.productName}
              </p>
              <p className="mt-0.5 truncate text-xs text-stone-500 dark:text-zinc-400">
                {row.original.packLabel}
                {row.original.categoryName ? (
                  <>
                    <span className="mx-1 opacity-40">·</span>
                    {row.original.categoryName}
                  </>
                ) : null}
              </p>
            </div>
            <ProductThumb
              categoryName={row.original.categoryName}
              imageUrl={row.original.imageUrl}
            />
          </div>
        ),
      },
      {
        accessorKey: "shippableKg",
        header: "Stok",
        size: 100,
        minSize: 88,
        cell: ({ getValue }) => (
          <span className="block font-semibold tabular-nums text-stone-900 dark:text-zinc-50">
            {fmtKg(kg(getValue() as number))}
          </span>
        ),
      },
      {
        accessorKey: "lotCount",
        header: "Parti",
        size: 72,
        minSize: 64,
        cell: ({ row }) => (
          <span className="inline-flex min-w-[1.75rem] justify-center rounded-md bg-stone-100 px-2 py-1 text-sm font-medium tabular-nums text-stone-700 dark:bg-zinc-800 dark:text-zinc-300">
            {row.original.lots.filter((l) => !l.expired).length}
          </span>
        ),
      },
      {
        id: "nearestDays",
        accessorKey: "nearestDays",
        header: "SKT",
        size: 128,
        minSize: 112,
        sortingFn: (a, b) =>
          (a.original.nearestDays ?? 9999) - (b.original.nearestDays ?? 9999),
        cell: ({ row }) => {
          const d = row.original.nearestDays;
          const nearestLot = [...row.original.lots]
            .filter((l) => !l.expired)
            .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)[0];
          if (row.original.expiredCount > 0 && !nearestLot) {
            return <StatusPill label="Geçmiş" tone="skt-danger" />;
          }
          if (d == null) return <span className="text-stone-400">-</span>;
          return (
            <div className="flex flex-col items-start gap-1">
              <StatusPill
                label={d < 0 ? "Geçmiş" : d === 0 ? "Bugün" : d === 1 ? "Yarın" : `${d} gün`}
                tone={sktTone(d, row.original.expiredCount)}
              />
              {nearestLot && d >= 0 ? (
                <span className="pl-0.5 text-[11px] tabular-nums text-stone-500">
                  {formatDateShort(new Date(nearestLot.expirationDate))}
                </span>
              ) : null}
            </div>
          );
        },
      },
      {
        id: "priority",
        header: "Öncelik",
        size: 128,
        minSize: 112,
        cell: ({ row }) => {
          const p = priorityOf(row.original);
          return <StatusPill label={p.label} tone={p.tone} />;
        },
      },
      {
        id: "open",
        header: "",
        size: 44,
        minSize: 44,
        enableSorting: false,
        cell: () => (
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-stone-50 text-stone-400 dark:bg-zinc-800/80 dark:text-zinc-500">
            <ChevronRight className="size-4" aria-hidden />
          </span>
        ),
      },
    ],
    [],
  );

  function resetFefo() {
    setFefoQty("");
    setFefoAllocations(null);
    setFefoError(null);
  }

  function runFefo() {
    if (!selected) return;
    setFefoAllocations(null);
    setFefoError(null);
    try {
      const allocations = suggestFefoShipment(
        selected.lots.map((l) => ({
          id: l.id,
          lotNumber: l.lotNumber,
          expirationDate: new Date(l.expirationDate),
          availableKg: kg(l.availableKg),
        })),
        kg(fefoQty || "0"),
      );
      setFefoAllocations(allocations);
    } catch (e) {
      setFefoError(e instanceof InventoryError ? e.message : "Hesaplanamadı");
    }
  }

  function openShipments() {
    setSelected(null);
    resetFefo();
    setActiveView("shipments");
  }

  return (
    <div
      className="-mx-3 -my-4 bg-stone-50 px-3 py-4 sm:-mx-4 sm:-my-5 sm:px-4 sm:py-5 md:-m-6 md:p-6 dark:bg-zinc-950"
      data-density={density}
    >
      <div className="mx-auto max-w-5xl space-y-5">
        <PageHeader
          title="Sevkiyat"
          count={activeView === "stock" ? tableRows.length : shipments.length}
          description={
            activeView === "stock"
              ? "Satıra tıklayın: partileri görün, kg yazın, çekim sırasını alın."
              : "Hazırlanıyor → yolda → teslim."
          }
          primaryAction={
            <Button onClick={openShipments}>Yeni sevkiyat</Button>
          }
        />

        <MetricStrip
          className="xl:grid-cols-5"
          items={metrics}
          activeId={metricFilter}
          onSelect={(id) => {
            if (id === "shipments") {
              setActiveView("shipments");
              setMetricFilter(null);
              return;
            }
            setActiveView("stock");
            setMetricFilter((cur) => (cur === id ? null : id));
          }}
        />

        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_1px_2px_rgb(33_28_22/0.04)] dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-stone-200 px-3 py-2.5 dark:border-zinc-800">
            <ListToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Ürün ara…"
              views={[
                { id: "stock", label: "Stok planı" },
                { id: "shipments", label: "Sevkiyat panosu" },
              ]}
              activeViewId={activeView}
              onViewSelect={setActiveView}
              filters={
                metricFilter ? (
                  <FilterChip
                    label={metrics.find((m) => m.id === metricFilter)?.label ?? ""}
                    active
                    onClear={() => setMetricFilter(null)}
                  />
                ) : null
              }
              density={density}
              onDensityChange={setDensity}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              viewModes={["table", "cards"]}
            />
          </div>

          <div className="p-0">
            {activeView === "shipments" ? (
              <div className="p-4">
                <ShipmentBoard shipments={shipments} dealers={dealers} variants={variants} />
              </div>
            ) : viewMode === "cards" ? (
              <div className="p-4">
                <ShippingBoard rows={filtered} />
              </div>
            ) : (
              <DataTable
                data={filtered}
                columns={columns}
                getRowId={(r) => r.variantId}
                storageKey="shipping-fefo-v3"
                search={search}
                globalFilterFn={(row, q) =>
                  row.productName.toLocaleLowerCase("tr-TR").includes(q) ||
                  row.sku.toLocaleLowerCase("tr-TR").includes(q) ||
                  row.packLabel.toLocaleLowerCase("tr-TR").includes(q) ||
                  row.categoryName.toLocaleLowerCase("tr-TR").includes(q)
                }
                sorting={sorting}
                onSortingChange={setSorting}
                onRowOpen={(row) => {
                  resetFefo();
                  setSelected(row);
                }}
                emptyTitle="Sevk edilebilir stok yok"
                emptyDescription="Aktif parti bulunamadı."
                exportColumns={[
                  { id: "name", header: "Ürün", accessor: (r) => r.productName },
                  { id: "pack", header: "Paket", accessor: (r) => r.packLabel },
                  { id: "kg", header: "kg", accessor: (r) => String(r.shippableKg) },
                  {
                    id: "skt",
                    header: "En yakın SKT (gün)",
                    accessor: (r) => String(r.nearestDays ?? ""),
                  },
                ]}
              />
            )}
          </div>
        </div>
      </div>

      <DetailDrawer
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            resetFefo();
          }
        }}
        title={selected?.productName ?? "Parti detayı"}
        description={selected ? selected.packLabel : undefined}
        wide
        footer={
          selected ? (
            <div className="flex w-full flex-col gap-3">
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-[8rem] flex-1">
                  <label className="text-xs font-medium text-stone-500" htmlFor="fefo-kg">
                    Kaç kg sevk edilecek?
                  </label>
                  <Input
                    id="fefo-kg"
                    value={fefoQty}
                    onChange={(e) => {
                      setFefoQty(e.target.value);
                      setFefoAllocations(null);
                      setFefoError(null);
                    }}
                    placeholder={`Örn. ${selected.shippableKg > 0 ? Math.min(10, Math.floor(selected.shippableKg)) : 5}`}
                    className="mt-1 h-10 rounded-lg border-stone-200 tabular-nums focus-visible:border-[#1B5E3A] focus-visible:ring-[#1B5E3A]/20"
                    inputMode="decimal"
                  />
                </div>
                <Button type="button" className="h-10" onClick={runFefo}>
                  Partileri hesapla
                </Button>
              </div>
              {fefoAllocations && fefoAllocations.length > 0 ? (
                <Button type="button" variant="secondary" onClick={openShipments}>
                  Sevkiyat panosuna geç
                  <ArrowRight className="ml-1 size-4" />
                </Button>
              ) : null}
            </div>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <ProductThumb
                categoryName={selected.categoryName}
                imageUrl={selected.imageUrl}
                className="size-14 rounded-xl"
              />
              <div className="min-w-0">
                <p className="truncate font-semibold text-stone-900 dark:text-zinc-50">
                  {selected.productName}
                </p>
                <p className="mt-0.5 text-sm text-stone-500">
                  {selected.packLabel}
                  {selected.categoryName ? ` · ${selected.categoryName}` : ""}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-xs text-stone-500">Sevk edilebilir</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-[#1B5E3A]">
                  {fmtKg(kg(selected.shippableKg))}
                </p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-xs text-stone-500">Aktif parti</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-stone-900 dark:text-zinc-50">
                  {selected.lots.filter((l) => !l.expired).length}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-2.5 text-xs font-semibold tracking-wide text-stone-500 uppercase">
                Partiler · erken SKT üstte
              </p>
              <ul className="space-y-2.5">
                {sortedLots.map((lot) => {
                  const activeIndex = sortedLots
                    .filter((l) => !l.expired)
                    .findIndex((l) => l.id === lot.id);
                  const rank = lot.expired ? null : activeIndex + 1;
                  return (
                    <LotCard key={lot.id} lot={lot} rank={rank} highlight={rank === 1} />
                  );
                })}
              </ul>
            </div>

            {fefoError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {fefoError}
              </p>
            ) : null}

            {fefoAllocations ? (
              <div className="rounded-xl border border-[#1B5E3A]/25 bg-green-50 px-3.5 py-3.5 dark:border-green-800 dark:bg-green-950/30">
                <p className="font-semibold text-stone-900 dark:text-zinc-50">Depo çekim listesi</p>
                <p className="mt-1 text-xs text-stone-500">
                  Bu sırayla alın. Sevkiyat kaydı panoda oluşturulur.
                </p>
                <ol className="mt-3 space-y-2">
                  {fefoAllocations.map((a, i) => (
                    <li
                      key={a.lotId}
                      className="flex items-center gap-3 rounded-lg bg-white px-3 py-2.5 dark:bg-zinc-900"
                    >
                      <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[#1B5E3A] text-xs font-semibold text-white tabular-nums">
                        {i + 1}
                      </span>
                      <p className="min-w-0 flex-1 font-medium text-stone-900 dark:text-zinc-50">
                        {lotPartyLabel(a.lotNumber)}
                      </p>
                      <span className="shrink-0 font-semibold tabular-nums text-stone-900 dark:text-zinc-50">
                        {fmtKg(a.quantityKg)}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  );
}
