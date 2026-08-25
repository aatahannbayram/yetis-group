"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CreditBar, DataTable, PageHeader } from "@/components/yg-ops/shared";
import { formatYgMoney } from "@/lib/yg-ops/format";
import { MOCK_DEALERS, MOCK_PRICE_LISTS } from "@/lib/yg-ops/mock-data";

type DealerRow = (typeof MOCK_DEALERS)[number];
type PriceRow = (typeof MOCK_PRICE_LISTS)[number];

export function AdminDealersPage() {
  const columns = useMemo<ColumnDef<DealerRow, unknown>[]>(
    () => [
      {
        accessorKey: "unvan",
        header: "Unvan",
        cell: ({ row }) => (
          <span className="font-medium text-[var(--yg-text)]">{row.original.unvan}</span>
        ),
      },
      { accessorKey: "city", header: "Şehir" },
      {
        id: "credit",
        header: "Kredi",
        cell: ({ row }) => (
          <div className="min-w-[180px] py-2">
            <CreditBar
              usedKurus={row.original.usedKurus}
              limitKurus={row.original.limitKurus}
            />
          </div>
        ),
      },
      {
        id: "remaining",
        header: "Kalan",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatYgMoney(row.original.limitKurus - row.original.usedKurus)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Bayiler" description="Kredi kullanımı özeti (mock)." />
      <DataTable data={MOCK_DEALERS} columns={columns} />
    </div>
  );
}

export function AdminPricesPage() {
  const columns = useMemo<ColumnDef<PriceRow, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Liste",
        cell: ({ row }) => (
          <span className="font-medium text-[var(--yg-text)]">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "dealerCount",
        header: "Bayi",
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.dealerCount}</span>
        ),
      },
      {
        accessorKey: "itemCount",
        header: "Kalem",
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.itemCount}</span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Fiyatlar" description="Fiyat listeleri (mock)." />
      <DataTable data={MOCK_PRICE_LISTS} columns={columns} />
    </div>
  );
}
