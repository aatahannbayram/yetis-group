"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { OrderTimeline } from "@/components/yg-ops/dealer/order-timeline";
import { DetailDrawer } from "@/components/yg-ops/admin/detail-drawer";
import {
  DataTable,
  PageHeader,
  StatusBadge,
  YgButton,
} from "@/components/yg-ops/shared";
import { formatYgDate, formatYgMoney, formatYgQty } from "@/lib/yg-ops/format";
import { MOCK_ORDERS, type MockOrder } from "@/lib/yg-ops/mock-data";

export function DealerOrdersPage() {
  const [selected, setSelected] = useState<MockOrder | null>(null);
  const mine = useMemo(
    () => MOCK_ORDERS.filter((o) => o.dealer === "Anadolu Market"),
    [],
  );

  const columns = useMemo<ColumnDef<MockOrder, unknown>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Sipariş",
        cell: ({ row }) => (
          <button
            type="button"
            className="font-medium text-[var(--yg-primary-text)] hover:underline"
            onClick={() => setSelected(row.original)}
          >
            {row.original.id}
          </button>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Tarih",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatYgDate(row.original.createdAt)}</span>
        ),
      },
      {
        accessorKey: "totalKurus",
        header: "Tutar",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatYgMoney(row.original.totalKurus)}</span>
        ),
      },
      {
        accessorKey: "stage",
        header: "Durum",
        cell: ({ row }) => <StatusBadge stage={row.original.stage} />,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Siparişlerim" description="Geçmiş ve aktif siparişler (mock)." />
      <DataTable data={mine} columns={columns} />

      <DetailDrawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.id ?? "Sipariş"}
        footer={
          <div className="flex justify-end">
            <YgButton variant="ghost" onClick={() => setSelected(null)}>
              Kapat
            </YgButton>
          </div>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <StatusBadge stage={selected.stage} />
            <p className="text-[length:var(--yg-text-14)] text-[var(--yg-text-secondary)]">
              {formatYgMoney(selected.totalKurus)} · {formatYgDate(selected.createdAt)}
            </p>
            <ul className="space-y-2">
              {selected.lines.map((line) => (
                <li
                  key={line.name}
                  className="rounded-[var(--yg-radius-md)] bg-[var(--yg-panel-2)] px-3 py-2 text-[length:var(--yg-text-14)] text-[var(--yg-text-secondary)]"
                >
                  {line.name}
                  <span className="mt-0.5 block text-[length:var(--yg-text-12)] text-[var(--yg-text-muted)]">
                    {formatYgQty(line.packs, line.kg, line.packLabel)}
                  </span>
                </li>
              ))}
            </ul>
            <div>
              <p className="mb-2 text-[length:var(--yg-text-13)] font-medium text-[var(--yg-text)]">
                Aşama
              </p>
              <OrderTimeline current={selected.stage} />
            </div>
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  );
}
