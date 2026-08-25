"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { AlertTriangle, Package, ShoppingCart, Truck, Users } from "lucide-react";
import { StatCard } from "@/components/yg-ops/admin/stat-card";
import { DetailDrawer } from "@/components/yg-ops/admin/detail-drawer";
import { WeeklyVolumeChart } from "@/components/yg-ops/admin/weekly-volume-chart";
import {
  CreditBar,
  DataTable,
  ExpiryBadge,
  PageHeaderSlot,
  StatusBadge,
  YgButton,
} from "@/components/yg-ops/shared";
import { formatYgDate, formatYgMoney, formatYgQty } from "@/lib/yg-ops/format";
import {
  MOCK_ORDERS,
  MOCK_SKT_ALERTS,
  type MockOrder,
} from "@/lib/yg-ops/mock-data";

export function AdminDashboardPage() {
  const [selected, setSelected] = useState<MockOrder | null>(null);

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
      { accessorKey: "dealer", header: "Bayi" },
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

  const openCount = MOCK_ORDERS.filter((o) =>
    ["submitted", "under_review", "confirmed", "preparing"].includes(o.stage),
  ).length;
  const prepCount = MOCK_ORDERS.filter((o) => o.stage === "preparing").length;
  const shipCount = MOCK_ORDERS.filter((o) => o.stage === "shipped").length;

  return (
    <div className="space-y-6">
      <PageHeaderSlot
        title="Dashboard"
        description="Operasyon özeti: sipariş, stok riski ve bayi kredi (mock veri)."
      >
        {!selected ? (
          <Link href="/yonetim/siparisler">
            <YgButton variant="primary">Siparişler</YgButton>
          </Link>
        ) : null}
      </PageHeaderSlot>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Açık sipariş"
          value={String(openCount)}
          hint="İnceleme + hazırlık"
          icon={<ShoppingCart className="size-4" />}
        />
        <StatCard
          label="Hazırlıkta"
          value={String(prepCount)}
          hint="FEFO lot önerisi"
          icon={<Package className="size-4" />}
        />
        <StatCard
          label="Sevkiyatta"
          value={String(shipCount)}
          hint="Bugün rota"
          icon={<Truck className="size-4" />}
        />
        <StatCard
          label="Limit aşımı"
          value="2"
          hint="Bayi uyarısı"
          icon={<Users className="size-4" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="rounded-[var(--yg-radius-lg)] bg-[var(--yg-panel-2)] p-4">
          <p className="mb-3 text-[length:var(--yg-text-13)] text-[var(--yg-text-muted)]">
            Haftalık sevk (kg)
          </p>
          <WeeklyVolumeChart />
        </div>
        <div className="space-y-4">
          <div className="rounded-[var(--yg-radius-lg)] bg-[var(--yg-panel-2)] p-4">
            <p className="mb-3 text-[length:var(--yg-text-13)] text-[var(--yg-text-muted)]">
              Örnek bayi kredi
            </p>
            <CreditBar usedKurus={21550000} limitKurus={30000000} />
          </div>
          <div className="rounded-[var(--yg-radius-lg)] bg-[var(--yg-panel-2)] p-4">
            <div className="mb-3 flex items-center gap-2 text-[length:var(--yg-text-13)] text-[var(--yg-text-muted)]">
              <AlertTriangle className="size-3.5" aria-hidden />
              SKT uyarıları
            </div>
            <ul className="space-y-2">
              {MOCK_SKT_ALERTS.map((a) => (
                <li key={a.name} className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[length:var(--yg-text-13)] text-[var(--yg-text-secondary)]">
                    {a.name}
                  </span>
                  <ExpiryBadge expirationDate={a.expirationDate} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[length:var(--yg-text-16)] font-medium text-[var(--yg-text)]">
          Son siparişler
        </h2>
        <Link
          href="/yonetim/siparisler"
          className="text-[length:var(--yg-text-13)] font-medium text-[var(--yg-primary-text)] hover:underline"
        >
          Tümünü gör
        </Link>
      </div>
      <DataTable data={MOCK_ORDERS} columns={columns} pageSize={25} />

      <div className="flex flex-wrap gap-2">
        <Link href="/yonetim/sevkiyat">
          <YgButton variant="ghost">Sevkiyat</YgButton>
        </Link>
        <Link href="/yonetim/cari">
          <YgButton variant="ghost">Cari</YgButton>
        </Link>
        <Link href="/yonetim/urunler">
          <YgButton variant="ghost">Ürünler</YgButton>
        </Link>
      </div>

      <DetailDrawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.id ?? "Sipariş"}
        footer={
          <div className="flex justify-end gap-2">
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
              {selected.dealer} · {formatYgMoney(selected.totalKurus)}
            </p>
            <p className="text-[length:var(--yg-text-13)] text-[var(--yg-text-muted)]">
              {formatYgDate(selected.createdAt)}
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
            <p className="text-[length:var(--yg-text-12)] text-[var(--yg-text-muted)]">
              Lot / FEFO atama Adım 3 sipariş ekranında.
            </p>
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  );
}
