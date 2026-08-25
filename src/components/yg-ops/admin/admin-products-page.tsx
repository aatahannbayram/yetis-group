"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  DataTable,
  ExpiryBadge,
  PageHeader,
} from "@/components/yg-ops/shared";
import { formatYgQty, formatYgMoney } from "@/lib/yg-ops/format";
import { MOCK_CATALOG, type MockSku } from "@/lib/yg-ops/mock-data";

export function AdminProductsPage() {
  const columns = useMemo<ColumnDef<MockSku, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Ürün",
        cell: ({ row }) => (
          <span className="font-medium text-[var(--yg-text)]">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "packLabel",
        header: "Paket",
      },
      {
        id: "stock",
        header: "Stok",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatYgQty(row.original.packCount, row.original.stockKg, row.original.packLabel)}
          </span>
        ),
      },
      {
        accessorKey: "priceKurus",
        header: "Liste",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatYgMoney(row.original.priceKurus)}</span>
        ),
      },
      {
        accessorKey: "expirationDate",
        header: "SKT (örnek lot)",
        cell: ({ row }) => <ExpiryBadge expirationDate={row.original.expirationDate} />,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ürünler"
        description="Katalog özeti ve SKT (mock). Lot yönetimi canlı panelde."
      />
      <DataTable data={MOCK_CATALOG} columns={columns} />
    </div>
  );
}
