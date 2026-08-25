"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { StatCard } from "@/components/yg-ops/admin/stat-card";
import { DataTable, EmptyState, PageHeader } from "@/components/yg-ops/shared";
import { formatYgMoney } from "@/lib/yg-ops/format";
import { MOCK_DEALERS, MOCK_SHIPMENTS } from "@/lib/yg-ops/mock-data";

type ShipRow = (typeof MOCK_SHIPMENTS)[number];

export function AdminShippingPage() {
  const columns = useMemo<ColumnDef<ShipRow, unknown>[]>(
    () => [
      { accessorKey: "id", header: "Sefer" },
      { accessorKey: "route", header: "Rota" },
      { accessorKey: "day", header: "Gün" },
      {
        accessorKey: "orders",
        header: "Sipariş",
        cell: ({ row }) => <span className="tabular-nums">{row.original.orders}</span>,
      },
      {
        accessorKey: "kg",
        header: "Kg",
        cell: ({ row }) => <span className="tabular-nums">{row.original.kg}</span>,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Sevkiyat" description="Haftalık soğuk zincir rotaları (mock)." />
      <DataTable data={MOCK_SHIPMENTS} columns={columns} />
    </div>
  );
}

export function AdminCariPage() {
  const receivable = MOCK_DEALERS.reduce(
    (s, d) => s + Math.max(0, d.usedKurus),
    0,
  );
  return (
    <div className="space-y-6">
      <PageHeader title="Cari" description="Alacak özeti (mock)." />
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Toplam açık bakiye" value={formatYgMoney(receivable)} />
        <StatCard label="Limit aşan bayi" value="1" hint="Karadeniz HORECA" />
      </div>
      <EmptyState
        title="Detaylı ekstresi sonraki entegrasyonda"
        description="Canlı cari /panel/cari üzerinde."
      />
    </div>
  );
}

export function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Raporlar" description="Placeholder." />
      <EmptyState
        title="Raporlar yakında"
        description="Sevk kg, ciro ve SKT riski Adım entegrasyonunda bağlanır."
      />
    </div>
  );
}

export function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Ayarlar" description="Ops UI mock ayarlar." />
      <EmptyState
        title="Ayarlar stub"
        description="Bildirim, teslimat günleri ve şablonlar canlı panelde."
      />
    </div>
  );
}
