import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatCard } from "@/components/admin/stat-card";
import { DealerLedgerBoard, type DealerBalanceRow } from "@/components/admin/dealer-ledger-board";
import { listDealerBalances } from "@/infra/db/ledger";

export default async function AdminLedgerPage() {
  const summaries = await listDealerBalances();

  const rows: DealerBalanceRow[] = summaries.map((d) => ({
    id: d.id,
    unvan: d.unvan,
    dealerType: d.dealerType,
    creditLimitKurus: d.creditLimitKurus,
    paymentTermDays: d.paymentTermDays,
    entryCount: d.entryCount,
    balanceKurus: d.balanceKurus,
    entries: d.entries.map((e) => ({
      id: e.id,
      type: e.type,
      amountKurus: e.amountKurus,
      description: e.description,
      createdAt: e.createdAt.toISOString(),
      reversesId: e.reversesId,
    })),
  }));

  const totalReceivableKurus = rows
    .filter((r) => r.balanceKurus > 0)
    .reduce((sum, r) => sum + r.balanceKurus, 0);
  const overLimitCount = rows.filter(
    (r) => r.creditLimitKurus != null && r.balanceKurus > r.creditLimitKurus,
  ).length;
  const totalEntries = rows.reduce((sum, r) => sum + r.entryCount, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Cari"
        description="Append-only ledger — bakiye her zaman hareketlerden türetilir, düzeltme ters kayıtla yapılır."
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Toplam Bayi" value={rows.length} href="#cari-panosu" featured />
        <StatCard
          label="Toplam Alacak"
          value={Math.round(totalReceivableKurus / 100)}
          suffix=" ₺"
          href="#cari-panosu"
        />
        <StatCard
          label="Limit Aşan Bayi"
          value={overLimitCount}
          warn={overLimitCount > 0}
          href="#cari-panosu"
        />
      </div>

      <div id="cari-panosu" className="mt-6">
        <DealerLedgerBoard dealers={rows} />
      </div>

      {totalEntries === 0 ? (
        <p className="mt-4 text-caption text-muted-foreground">
          Henüz cari hareketi yok — bir bayi kartına tıklayıp ilk kaydı ekleyin.
        </p>
      ) : null}
    </div>
  );
}
