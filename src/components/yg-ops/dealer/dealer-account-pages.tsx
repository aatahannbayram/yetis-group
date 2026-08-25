"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CreditBar,
  DataTable,
  EmptyState,
  PageHeader,
  PageHeaderSlot,
  YgButton,
} from "@/components/yg-ops/shared";
import { formatYgDate, formatYgMoney } from "@/lib/yg-ops/format";
import {
  MOCK_DEALER_CREDIT,
  MOCK_LEDGER,
  MOCK_TICKETS,
} from "@/lib/yg-ops/mock-data";

type LedgerRow = (typeof MOCK_LEDGER)[number];
type TicketRow = (typeof MOCK_TICKETS)[number];

export function DealerCariPage() {
  const columns = useMemo<ColumnDef<LedgerRow, unknown>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Tarih",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatYgDate(row.original.date)}</span>
        ),
      },
      { accessorKey: "label", header: "Açıklama" },
      {
        accessorKey: "amountKurus",
        header: "Tutar",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatYgMoney(row.original.amountKurus)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Cari Hesabım" description="Bakiye ve hareketler (mock)." />
      <div className="rounded-[var(--yg-radius-lg)] bg-[var(--yg-panel-2)] p-4">
        <CreditBar
          usedKurus={MOCK_DEALER_CREDIT.usedKurus}
          limitKurus={MOCK_DEALER_CREDIT.limitKurus}
        />
      </div>
      <DataTable data={MOCK_LEDGER} columns={columns} />
    </div>
  );
}

export function DealerTicketsPage() {
  const [subject, setSubject] = useState("");
  const [sent, setSent] = useState(false);
  const columns = useMemo<ColumnDef<TicketRow, unknown>[]>(
    () => [
      { accessorKey: "id", header: "No" },
      { accessorKey: "subject", header: "Konu" },
      { accessorKey: "status", header: "Durum" },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeaderSlot title="Talepler" description="Limit ve teslimat talepleri (mock).">
        <YgButton
          variant="primary"
          disabled={!subject.trim() || sent}
          onClick={() => setSent(true)}
        >
          Gönder
        </YgButton>
      </PageHeaderSlot>

      <label className="block space-y-2">
        <span className="text-[length:var(--yg-text-13)] text-[var(--yg-text-muted)]">Konu</span>
        <input
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setSent(false);
          }}
          className="h-[var(--yg-control-h-lg)] w-full max-w-lg rounded-[var(--yg-radius-md)] border border-[color:var(--yg-border-strong)] bg-[var(--yg-panel-2)] px-3 text-[length:var(--yg-text-14)] text-[var(--yg-text)]"
          placeholder="Örn. Limit artırım talebi"
        />
      </label>
      {sent ? (
        <p className="text-[length:var(--yg-text-13)] text-[var(--yg-primary-text)]">
          Talep kaydedildi (mock).
        </p>
      ) : null}
      <DataTable data={MOCK_TICKETS} columns={columns} />
    </div>
  );
}

export function DealerProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Profil" description={MOCK_DEALER_CREDIT.dealerName} />
      <div className="rounded-[var(--yg-radius-lg)] bg-[var(--yg-panel-2)] p-4 space-y-2">
        <p className="text-[length:var(--yg-text-14)] text-[var(--yg-text)]">
          Yetkili: Ayşe Yılmaz
        </p>
        <p className="text-[length:var(--yg-text-13)] text-[var(--yg-text-muted)]">
          ayse@anadolumarket.example · 0532 000 00 00
        </p>
      </div>
      <EmptyState
        title="Firma bilgisi stub"
        description="Adres ve kullanıcı yönetimi canlı /bayi/firmam üzerinde."
      />
    </div>
  );
}
