"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/ui/page-header";
import { MetricStrip } from "@/components/ui/metric-strip";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { DataTable } from "@/components/ui/data-table";
import { DetailDrawer } from "@/components/ui/detail-drawer";
import { formatMoney } from "@/lib/format/money";
import { formatDateTime } from "@/lib/format/date";
import { money } from "@/domain/money";
import type { Density } from "@/components/ui/density-toggle";
import Link from "next/link";

export type CartListRow = {
  id: string;
  ownerLabel: string;
  ownerSub: string;
  lineCount: number;
  unitCount: number;
  subtotalKurus: number;
  updatedAt: string;
  lines: { name: string; qty: number; lineTotalKurus: number }[];
};

export function CartsListPage({ carts }: { carts: CartListRow[] }) {
  const [search, setSearch] = useState("");
  const [density, setDensity] = useState<Density>("compact");
  const [selected, setSelected] = useState<CartListRow | null>(null);

  const metrics = useMemo(() => {
    const totalValue = carts.reduce((s, c) => s + c.subtotalKurus, 0);
    const totalUnits = carts.reduce((s, c) => s + c.unitCount, 0);
    return [
      { id: "count", label: "Dolu sepet", value: carts.length },
      { id: "units", label: "Toplam adet", value: totalUnits },
      {
        id: "value",
        label: "Açık tutar",
        value: `${Math.round(totalValue / 100).toLocaleString("tr-TR")} ₺`,
      },
    ];
  }, [carts]);

  const columns = useMemo<ColumnDef<CartListRow, unknown>[]>(
    () => [
      {
        accessorKey: "ownerLabel",
        header: "Sahip",
        minSize: 200,
        cell: ({ row }) => (
          <div className="min-w-0 max-w-[240px]">
            <p className="truncate font-medium" title={row.original.ownerLabel}>
              {row.original.ownerLabel}
            </p>
            <p className="truncate text-caption text-[var(--panel-ink-muted)]" title={row.original.ownerSub}>
              {row.original.ownerSub}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "lineCount",
        header: "Satır",
        cell: ({ getValue }) => <span className="tabular-nums">{String(getValue())}</span>,
      },
      {
        accessorKey: "unitCount",
        header: "Adet",
        cell: ({ getValue }) => <span className="tabular-nums">{String(getValue())}</span>,
      },
      {
        accessorKey: "subtotalKurus",
        header: "Tutar",
        cell: ({ getValue }) => (
          <span className="block text-right tabular-nums font-medium">
            {formatMoney(money(getValue() as number))}
          </span>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Güncelleme",
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-caption">
            {formatDateTime(new Date(String(getValue())))}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-4" data-density={density}>
      <PageHeader
        title="Açık sepetler"
        count={carts.length}
        actions={
          <>
            <Link
              href="/panel/b2b/katalog"
              className="inline-flex h-9 items-center rounded-[var(--radius-sm)] border border-[var(--panel-border)] px-3 text-[length:var(--panel-font-size)] font-medium"
            >
              B2B katalog
            </Link>
            <Link
              href="/panel/siparisler"
              className="inline-flex h-9 items-center rounded-[var(--radius-sm)] bg-[var(--panel-accent-action)] px-3 text-[length:var(--panel-font-size)] font-semibold text-white hover:bg-brand-800"
            >
              Siparişler
            </Link>
          </>
        }
      />
      <MetricStrip items={metrics} />
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Bayi veya kullanıcı ara…"
        density={density}
        onDensityChange={setDensity}
        viewMode="table"
        onViewModeChange={() => undefined}
        viewModes={["table"]}
      />
      <DataTable
        data={carts}
        columns={columns}
        getRowId={(r) => r.id}
        storageKey="open-carts"
        search={search}
        globalFilterFn={(row, q) =>
          row.ownerLabel.toLocaleLowerCase("tr-TR").includes(q) ||
          row.ownerSub.toLocaleLowerCase("tr-TR").includes(q)
        }
        onRowOpen={setSelected}
        emptyTitle="Açık sepet yok"
        emptyDescription="Bayiler ürün ekledikçe sepetler burada listelenir."
      />
      <DetailDrawer
        open={Boolean(selected)}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.ownerLabel ?? "Sepet"}
        description={selected?.ownerSub}
      >
        {selected ? (
          <ul className="space-y-2">
            {selected.lines.map((line, i) => (
              <li
                key={`${selected.id}-${i}`}
                className="flex justify-between gap-2 border-b border-[var(--panel-border)] py-2 text-[length:var(--panel-font-size)]"
              >
                <span className="min-w-0 truncate" title={line.name}>
                  {line.name} × {line.qty}
                </span>
                <span className="shrink-0 tabular-nums">
                  {formatMoney(money(line.lineTotalKurus))}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </DetailDrawer>
    </div>
  );
}
