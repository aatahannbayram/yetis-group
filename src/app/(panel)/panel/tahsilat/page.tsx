import Link from "next/link";
import { ArrowUpRight, Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/admin/stat-card";
import { PaymentForm } from "@/components/admin/payment-form";
import { listDealerBalances, listRecentPayments } from "@/infra/db/ledger";
import { formatMoney } from "@/lib/format/money";
import { formatDateTime } from "@/lib/format/date";
import { money } from "@/domain/money";

export default async function TahsilatPage() {
  const [balances, payments] = await Promise.all([
    listDealerBalances(),
    listRecentPayments(30),
  ]);

  const dealerOptions = balances
    .map((d) => ({ id: d.id, unvan: d.unvan, balanceKurus: d.balanceKurus }))
    .sort((a, b) => b.balanceKurus - a.balanceKurus);

  const totalOutstandingKurus = balances
    .filter((d) => d.balanceKurus > 0)
    .reduce((sum, d) => sum + d.balanceKurus, 0);

  const now = new Date();
  const thisMonthPaymentsKurus = payments
    .filter(
      (p) =>
        p.createdAt.getFullYear() === now.getFullYear() &&
        p.createdAt.getMonth() === now.getMonth(),
    )
    .reduce((sum, p) => sum + p.amountKurus, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Tahsilat"
        description="Bayiden gelen ödemeyi cariye ödeme kaydı olarak işleyin."
        count={payments.length}
      />

      <section aria-label="Özet" className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Bu ay tahsilat"
          value={formatMoney(money(thisMonthPaymentsKurus))}
          tone="success"
        />
        <StatCard
          label="Toplam açık borç"
          value={formatMoney(money(totalOutstandingKurus))}
          tone={totalOutstandingKurus > 0 ? "warning" : "neutral"}
          href="/panel/cari"
        />
        <StatCard label="Borçlu hesap" value={balances.filter((d) => d.balanceKurus > 0).length} href="/panel/cari" />
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <PaymentForm dealers={dealerOptions} />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-body-lg font-semibold text-[var(--text-primary)]">Son tahsilatlar</h2>
            <Link
              href="/panel/cari"
              className="inline-flex items-center gap-1 text-[length:var(--text-caption)] font-medium text-[var(--primary-text)] hover:underline"
            >
              Cariye git
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          {payments.length > 0 ? (
            <div className="divide-y divide-[var(--border)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[var(--text-primary)]" title={p.dealer.unvan}>
                      {p.dealer.unvan}
                    </p>
                    <p className="truncate text-[length:var(--text-caption)] text-[var(--text-muted)]">
                      {p.description} · {formatDateTime(p.createdAt)}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums text-[var(--success-text)]">
                    {formatMoney(money(p.amountKurus))}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Wallet}
              title="Henüz tahsilat yok"
              description="Kaydedilen ödemeler burada listelenir."
            />
          )}
        </div>
      </div>
    </div>
  );
}
