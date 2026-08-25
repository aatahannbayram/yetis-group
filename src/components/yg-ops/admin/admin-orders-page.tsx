"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ConfirmDialog } from "@/components/yg-ops/admin/confirm-dialog";
import { DetailDrawer } from "@/components/yg-ops/admin/detail-drawer";
import {
  DataTable,
  ExpiryBadge,
  PageHeader,
  PillTabs,
  StatusBadge,
  YgButton,
} from "@/components/yg-ops/shared";
import { formatYgDate, formatYgMoney, formatYgQty } from "@/lib/yg-ops/format";
import { MOCK_ORDERS, type MockOrder } from "@/lib/yg-ops/mock-data";

const TABS = [
  { id: "all", label: "Tümü" },
  { id: "under_review", label: "İncelemede" },
  { id: "confirmed", label: "Onaylı" },
  { id: "preparing", label: "Hazırlık" },
  { id: "shipped", label: "Sevk" },
];

export function AdminOrdersPage() {
  const [tab, setTab] = useState("all");
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [selected, setSelected] = useState<MockOrder | null>(null);
  const [confirm, setConfirm] = useState<"approve" | "reject" | null>(null);

  const filtered = useMemo(
    () => (tab === "all" ? orders : orders.filter((o) => o.stage === tab)),
    [orders, tab],
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

  const canDecide = selected?.stage === "under_review";

  function applyDecision(next: "confirmed" | "rejected") {
    if (!selected) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === selected.id ? { ...o, stage: next } : o)),
    );
    setSelected((cur) => (cur ? { ...cur, stage: next } : null));
    setConfirm(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Siparişler"
        description="İnceleme, FEFO lot önerisi ve onay (mock)."
      />

      <PillTabs tabs={TABS} value={tab} onChange={setTab} />
      <DataTable data={filtered} columns={columns} emptyMessage="Bu filtrede sipariş yok." />

      <DetailDrawer
        open={selected !== null}
        onClose={() => {
          setSelected(null);
          setConfirm(null);
        }}
        title={selected?.id ?? "Sipariş"}
        footer={
          canDecide && !confirm ? (
            <div className="flex justify-end gap-2">
              <YgButton variant="danger-ghost" onClick={() => setConfirm("reject")}>
                Reddet
              </YgButton>
              <YgButton variant="primary" onClick={() => setConfirm("approve")}>
                Onayla
              </YgButton>
            </div>
          ) : (
            <div className="flex justify-end">
              <YgButton
                variant="ghost"
                onClick={() => {
                  setSelected(null);
                  setConfirm(null);
                }}
              >
                Kapat
              </YgButton>
            </div>
          )
        }
      >
        {selected ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <StatusBadge stage={selected.stage} />
              <p className="text-[length:var(--yg-text-14)] text-[var(--yg-text-secondary)]">
                {selected.dealer} · {formatYgMoney(selected.totalKurus)}
              </p>
              <p className="text-[length:var(--yg-text-13)] text-[var(--yg-text-muted)]">
                {formatYgDate(selected.createdAt)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-[length:var(--yg-text-13)] font-medium text-[var(--yg-text)]">
                Satırlar
              </p>
              <ul className="space-y-3">
                {selected.lines.map((line) => (
                  <li
                    key={line.name}
                    className="rounded-[var(--yg-radius-md)] bg-[var(--yg-panel-2)] p-3"
                  >
                    <p className="text-[length:var(--yg-text-14)] font-medium text-[var(--yg-text)]">
                      {line.name}
                    </p>
                    <p className="mt-0.5 text-[length:var(--yg-text-13)] text-[var(--yg-text-muted)]">
                      {formatYgQty(line.packs, line.kg, line.packLabel)}
                    </p>
                    <p className="mt-3 text-[length:var(--yg-text-12)] font-medium tracking-[0.04em] text-[var(--yg-text-muted)] uppercase">
                      FEFO lot önerisi
                    </p>
                    <ul className="mt-2 space-y-2">
                      {line.fefoLots.map((lot) => (
                        <li
                          key={lot.lotNumber}
                          className="flex flex-wrap items-center justify-between gap-2 text-[length:var(--yg-text-13)] text-[var(--yg-text-secondary)]"
                        >
                          <span className="font-mono">{lot.lotNumber}</span>
                          <span className="tabular-nums">{lot.allocateKg.toFixed(1)} kg</span>
                          <ExpiryBadge expirationDate={lot.expirationDate} />
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </DetailDrawer>

      <ConfirmDialog
        open={confirm === "approve"}
        title="Siparişi onayla?"
        description="Onay sonrası hazırlık kuyruğuna düşer. Lot rezervasyonu mock olarak işaretlenir."
        confirmLabel="Onayla"
        onCancel={() => setConfirm(null)}
        onConfirm={() => applyDecision("confirmed")}
      />
      <ConfirmDialog
        open={confirm === "reject"}
        title="Siparişi reddet?"
        description="Bayiye bildirim stub. Bu Adım 3 mock diyaloğudur."
        confirmLabel="Reddet"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => applyDecision("rejected")}
      />
    </div>
  );
}
