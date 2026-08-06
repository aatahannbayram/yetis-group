"use client";

import { useMemo, useState } from "react";
import type { ColumnDef, RowSelectionState, SortingState } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { MetricStrip } from "@/components/ui/metric-strip";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { DataTable } from "@/components/ui/data-table";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { DetailDrawer } from "@/components/ui/detail-drawer";
import { StatusPill, type StatusTone } from "@/components/ui/status-pill";
import { FilterChip } from "@/components/ui/filter-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ShippingRow } from "@/components/admin/shipping-board";
import { ShippingBoard } from "@/components/admin/shipping-board";
import { ShipmentBoard, type ShipmentRow } from "@/components/admin/shipment-board";
import { kg, sum, type Kg } from "@/domain/weight";
import { suggestFefoShipment, InventoryError } from "@/domain/inventory/fefo";
import type { Density } from "@/components/ui/density-toggle";
import type { ViewMode } from "@/components/ui/view-switcher";

const kgFmt = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 3 });
function fmtKg(value: Kg) {
  return `${kgFmt.format(value.toNumber())} kg`;
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
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([{ id: "nearestDays", desc: false }]);
  const [fefoQty, setFefoQty] = useState("");
  const [fefoResult, setFefoResult] = useState<string | null>(null);

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
      { id: "variants", label: "Varyant", value: tableRows.length },
      { id: "shippable", label: "Sevk edilebilir kg", value: Math.round(totalKg).toLocaleString("tr-TR") },
      { id: "soon", label: "SKT yaklaşan", value: soon, tone: "warn" as const },
      { id: "expired", label: "SKT geçmiş", value: expired, tone: "danger" as const },
      { id: "shipments", label: "Açık sevkiyat", value: shipments.filter((s) => s.status !== "TESLIM_EDILDI").length, tone: "info" as const },
    ];
  }, [tableRows, shipments]);

  const filtered = useMemo(() => {
    let rows = tableRows;
    if (metricFilter === "expired") rows = rows.filter((r) => r.expiredCount > 0);
    if (metricFilter === "soon") rows = rows.filter((r) => r.soonCount > 0);
    return rows;
  }, [tableRows, metricFilter]);

  const columns = useMemo<ColumnDef<VariantRow, unknown>[]>(
    () => [
      {
        accessorKey: "productName",
        header: "Ürün",
        minSize: 260,
        cell: ({ row }) => (
          <div className="min-w-0 max-w-[320px]">
            <p className="truncate font-medium" title={row.original.productName}>
              {row.original.productName}
            </p>
            <p className="text-caption text-[var(--panel-ink-muted)]">{row.original.packLabel}</p>
          </div>
        ),
      },
      {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ getValue }) => (
          <span className="font-mono text-caption whitespace-nowrap" title={String(getValue())}>
            {String(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "shippableKg",
        header: "Sevk edilebilir",
        cell: ({ getValue }) => (
          <span className="block text-right tabular-nums">{fmtKg(kg(getValue() as number))}</span>
        ),
      },
      {
        accessorKey: "lotCount",
        header: "Lot",
        cell: ({ getValue }) => (
          <span className="tabular-nums">{String(getValue())}</span>
        ),
      },
      {
        id: "nearestDays",
        accessorKey: "nearestDays",
        header: "En yakın SKT",
        sortingFn: (a, b) =>
          (a.original.nearestDays ?? 9999) - (b.original.nearestDays ?? 9999),
        cell: ({ row }) => {
          const d = row.original.nearestDays;
          const label =
            row.original.expiredCount > 0
              ? "SKT geçmiş"
              : d == null
                ? "—"
                : d < 0
                  ? "Geçmiş"
                  : `${d} gün`;
          return (
            <StatusPill
              label={label}
              tone={sktTone(d, row.original.expiredCount)}
            />
          );
        },
      },
      {
        id: "action",
        header: "Önerilen",
        cell: ({ row }) => {
          const label =
            row.original.expiredCount > 0
              ? "Kampanya / imha"
              : row.original.soonCount > 0
                ? "FEFO sevk"
                : "Stok normal";
          return (
            <span className="whitespace-nowrap text-caption" title={label}>
              {label}
            </span>
          );
        },
      },
      {
        id: "menu",
        header: "",
        size: 48,
        enableSorting: false,
        cell: () => (
          <Button type="button" variant="ghost" size="icon-sm" aria-label="İşlemler">
            <MoreHorizontal className="size-4" />
          </Button>
        ),
      },
    ],
    [],
  );

  function runFefo() {
    if (!selected) return;
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
      setFefoResult(
        allocations.map((a) => `${a.lotNumber}: ${fmtKg(a.quantityKg)}`).join(" · ") ||
          "Öneri yok",
      );
    } catch (e) {
      setFefoResult(e instanceof InventoryError ? e.message : "Hesaplanamadı");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4" data-density={density}>
      <PageHeader
        title="Sevkiyat"
        count={tableRows.length}
        actions={
          <Button
            className="bg-[var(--panel-accent-action)] hover:bg-brand-800"
            onClick={() => setActiveView("shipments")}
          >
            Yeni sevkiyat
          </Button>
        }
      />

      <MetricStrip
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

      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Ürün veya SKU ara…"
        views={[
          { id: "stock", label: "Stok & FEFO" },
          { id: "shipments", label: "Sevkiyatlar" },
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

      {activeView === "shipments" ? (
        <ShipmentBoard shipments={shipments} dealers={dealers} variants={variants} />
      ) : viewMode === "cards" ? (
        <ShippingBoard rows={filtered} />
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          getRowId={(r) => r.variantId}
          storageKey="shipping-fefo"
          search={search}
          globalFilterFn={(row, q) =>
            row.productName.toLocaleLowerCase("tr-TR").includes(q) ||
            row.sku.toLocaleLowerCase("tr-TR").includes(q)
          }
          sorting={sorting}
          onSortingChange={setSorting}
          onRowOpen={setSelected}
          enableSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          emptyTitle="Sevk edilebilir stok yok"
          emptyDescription="Aktif lot bulunamadı."
          exportColumns={[
            { id: "name", header: "Ürün", accessor: (r) => r.productName },
            { id: "sku", header: "SKU", accessor: (r) => r.sku },
            { id: "kg", header: "kg", accessor: (r) => String(r.shippableKg) },
            {
              id: "skt",
              header: "En yakın SKT (gün)",
              accessor: (r) => String(r.nearestDays ?? ""),
            },
          ]}
        />
      )}

      <BulkActionBar
        count={Object.keys(rowSelection).filter((k) => rowSelection[k]).length}
        onClear={() => setRowSelection({})}
      >
        <Button size="sm" variant="secondary">
          FEFO öner
        </Button>
        <Button size="sm" variant="secondary">
          Sevkiyat oluştur
        </Button>
        <Button size="sm" variant="secondary">
          Kampanya başlat
        </Button>
      </BulkActionBar>

      <DetailDrawer
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setFefoResult(null);
          }
        }}
        title={selected?.productName ?? "Lot detayı"}
        description={selected ? `${selected.sku} · ${selected.packLabel}` : undefined}
        wide
        footer={
          selected ? (
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[8rem] flex-1">
                <label className="text-caption text-[var(--panel-ink-muted)]" htmlFor="fefo-kg">
                  Gereken kg
                </label>
                <Input
                  id="fefo-kg"
                  value={fefoQty}
                  onChange={(e) => setFefoQty(e.target.value)}
                  className="mt-1 h-8 tabular-nums"
                  inputMode="decimal"
                />
              </div>
              <Button
                type="button"
                className="bg-[var(--panel-accent-action)] hover:bg-brand-800"
                onClick={runFefo}
              >
                FEFO öner
              </Button>
            </div>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-3">
            <p className="text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
              Lotlar en erken SKT sırasıyla listelenir.
            </p>
            <ul className="space-y-2">
              {[...selected.lots]
                .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
                .map((lot) => (
                  <li
                    key={lot.id}
                    className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-[var(--panel-border)] px-3 py-2"
                  >
                    <span className="font-mono text-caption" title={lot.lotNumber}>
                      {lot.lotNumber}
                    </span>
                    <span className="tabular-nums text-caption">
                      {fmtKg(kg(lot.availableKg))}
                    </span>
                    <StatusPill
                      label={lot.expired ? "Geçmiş" : `${lot.daysUntilExpiry} gün`}
                      tone={sktTone(lot.daysUntilExpiry, lot.expired ? 1 : 0)}
                    />
                  </li>
                ))}
            </ul>
            {fefoResult ? (
              <p className="rounded-[var(--radius-sm)] bg-neutral-50 p-3 text-[length:var(--panel-font-size)]">
                {fefoResult}
              </p>
            ) : null}
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  );
}
