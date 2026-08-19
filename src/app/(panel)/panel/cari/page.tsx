import { PageHeader } from "@/components/ui/page-header";
import { DealerLedgerBoard, type DealerBalanceRow } from "@/components/admin/dealer-ledger-board";
import { listDealerBalances } from "@/infra/db/ledger";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { summarizeAgingPortfolio } from "@/domain/ledger/aging";

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
  const aging = summarizeAgingPortfolio(rows);
  const overLimitCount = rows.filter(
    (r) => r.creditLimitKurus != null && r.balanceKurus > r.creditLimitKurus,
  ).length;
  const totalEntries = rows.reduce((sum, r) => r.entryCount + sum, 0);

  const metrics = [
    {
      id: "receivable",
      label: "Toplam alacak",
      value: formatMoney(money(totalReceivableKurus)),
      href: "#cari-panosu",
      tone: totalReceivableKurus > 0 ? ("warn" as const) : ("neutral" as const),
    },
    {
      id: "ok",
      label: "0-30 gün",
      value: formatMoney(money(aging.okKurus)),
      href: "#cari-panosu",
      tone: "neutral" as const,
    },
    {
      id: "warn",
      label: "31-45 gün",
      value: formatMoney(money(aging.warnKurus)),
      href: "#cari-panosu",
      tone: aging.warnKurus > 0 ? ("warn" as const) : ("neutral" as const),
    },
    {
      id: "danger",
      label: "46+ gün",
      value: formatMoney(money(aging.dangerKurus)),
      href: "#cari-panosu",
      tone: aging.dangerKurus > 0 ? ("danger" as const) : ("neutral" as const),
    },
    {
      id: "over",
      label: "Limit aşan",
      value: String(overLimitCount),
      href: "#cari-panosu",
      tone: overLimitCount > 0 ? ("danger" as const) : ("neutral" as const),
    },
  ];

  return (
    <div className="-mx-3 -my-4 bg-stone-50 px-3 py-4 sm:-mx-4 sm:-my-5 sm:px-4 sm:py-5 md:-m-6 md:p-6 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl space-y-5">
        <PageHeader
          title="Cari"
          count={rows.length}
          description="Bakiyeler, limit ve vade gecikmesi (0-30 / 31-45 / 46+)."
        />

        <section
          aria-label="Özet"
          className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-stone-200 bg-stone-200 sm:grid-cols-2 lg:grid-cols-5 dark:border-zinc-800 dark:bg-zinc-800"
        >
          {metrics.map((m) => (
            <Link
              key={m.id}
              href={m.href}
              className="flex min-h-[88px] flex-col justify-between bg-white p-4 transition-colors hover:bg-stone-50 sm:p-5 dark:bg-zinc-900 dark:hover:bg-zinc-900/80"
            >
              <p className="text-xs font-medium text-stone-500 dark:text-zinc-400">{m.label}</p>
              <p
                className={cn(
                  "text-2xl font-semibold tracking-tight tabular-nums",
                  m.tone === "danger" && "text-red-600 dark:text-red-400",
                  m.tone === "warn" && "text-amber-700 dark:text-amber-400",
                  (!m.tone || m.tone === "neutral") && "text-stone-900 dark:text-zinc-50",
                )}
              >
                {m.value}
              </p>
            </Link>
          ))}
        </section>

        <div id="cari-panosu">
          <DealerLedgerBoard dealers={rows} />
        </div>

        {totalEntries === 0 ? (
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Henüz cari hareketi yok. Bir satıra tıklayıp ilk kaydı ekleyin.
          </p>
        ) : null}
      </div>
    </div>
  );
}
