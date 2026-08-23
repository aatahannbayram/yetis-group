import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Clock, Wallet } from "lucide-react";
import { auth } from "@/infra/auth/server";
import { getUserDealerId, isStaffUser } from "@/infra/db/users";
import { prisma } from "@/infra/db/client";
import { availableCreditKurus, calculateBalance } from "@/domain/ledger";
import { getDealerCreditExposure, listOrdersForDealer } from "@/infra/db/orders";
import { IMPERSONATE_COOKIE, parseImpersonationCookie } from "@/lib/impersonation";
import { formatMoney } from "@/lib/format/money";
import { formatDate } from "@/lib/format/date";
import { money } from "@/domain/money";
import { cn } from "@/lib/utils";

const OPEN_STATUSES = new Set(["DRAFT", "SUBMITTED", "UNDER_REVIEW", "CONFIRMED", "PREPARING", "SHIPPED"]);

const PAYMENT_LABEL: Record<string, string> = {
  HAVALE: "Havale / EFT",
  CARI: "Cari hesap",
  ONLINE: "Online ödeme",
  KAPIDA_NAKIT: "Kapıda nakit",
  KAPIDA_POS: "Kapıda kart (POS)",
};

export default async function BayiCariPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth");

  const jar = await cookies();
  const impId = parseImpersonationCookie(jar.get(IMPERSONATE_COOKIE)?.value);
  const staff = await isStaffUser(session.user.id);
  let dealerId = await getUserDealerId(session.user.id);
  if (impId && staff) dealerId = impId;
  if (!dealerId) redirect("/");

  const [dealer, orders, exposureKurus] = await Promise.all([
    prisma.dealer.findUniqueOrThrow({
      where: { id: dealerId },
      select: {
        unvan: true,
        creditLimitKurus: true,
        paymentTermDays: true,
        ledgerEntries: { orderBy: { createdAt: "desc" } },
      },
    }),
    listOrdersForDealer(dealerId),
    getDealerCreditExposure(dealerId),
  ]);

  const pendingOrders = orders.filter((o) => OPEN_STATUSES.has(o.status));

  const balanceKurus = calculateBalance(dealer.ledgerEntries);
  const recent = dealer.ledgerEntries.slice(0, 40);
  const limit = dealer.creditLimitKurus;
  const available = availableCreditKurus(limit, exposureKurus);

  return (
    <div className="space-y-6 pb-24 sm:pb-6">
      <header className="border-b border-[var(--panel-border)] pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--panel-ink)]">
          Cari hesabım
        </h1>
        <p className="mt-1 text-sm text-[var(--panel-ink-muted)]">{dealer.unvan}</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface)] p-4 sm:col-span-1">
          <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-[var(--panel-ink-muted)] uppercase">
            <Wallet className="size-3.5" aria-hidden />
            Bakiye
          </p>
          <p
            className={cn(
              "mt-2 text-2xl font-semibold tabular-nums",
              balanceKurus > 0 ? "text-[var(--danger-text)]" : "text-[var(--panel-ink)]",
            )}
          >
            {formatMoney(money(balanceKurus))}
          </p>
          <p className="mt-1 text-xs text-[var(--panel-ink-muted)]">
            {balanceKurus > 0 ? "Borç (bizden alacak)" : balanceKurus < 0 ? "Alacak" : "Kapalı"}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface)] p-4">
          <p className="text-[11px] font-medium tracking-wide text-[var(--panel-ink-muted)] uppercase">
            Kredi limiti
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--panel-ink)]">
            {limit != null ? formatMoney(money(limit)) : "Tanımsız"}
          </p>
          {available != null ? (
            <p className="mt-1 text-xs text-[var(--panel-ink-muted)]">
              Kullanılabilir: {formatMoney(money(available))}
              <span className="mt-0.5 block">Açık cari siparişler dahil</span>
            </p>
          ) : null}
        </div>
        <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface)] p-4">
          <p className="text-[11px] font-medium tracking-wide text-[var(--panel-ink-muted)] uppercase">
            Vade
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--panel-ink)]">
            {dealer.paymentTermDays != null ? `${dealer.paymentTermDays} gün` : "—"}
          </p>
          <Link
            href="/bayi/siparis"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary-text)] hover:underline"
          >
            Sipariş ver <ArrowRight className="size-3" />
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-[var(--panel-ink)]">Bekleyen siparişler</h2>
        {pendingOrders.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--panel-border)] bg-[var(--panel-surface)] px-4 py-10 text-center text-sm text-[var(--panel-ink-muted)]">
            Bekleyen (henüz teslim edilmemiş) sipariş yok.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--panel-border)] overflow-hidden rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface)]">
            {pendingOrders.map((order) => {
              const awaitingPayment = order.paymentMethod !== "CARI" && !order.paidAt;
              return (
                <li key={order.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--panel-ink)]">
                      Sipariş #{order.id.slice(-6)}
                    </p>
                    <p className="text-xs text-[var(--panel-ink-muted)]">
                      {formatDate(order.createdAt)} ·{" "}
                      {order.paymentMethod ? PAYMENT_LABEL[order.paymentMethod] : "Ödeme belirtilmemiş"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {awaitingPayment ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--warning-subtle)] px-2 py-0.5 text-[11px] font-medium text-[var(--warning-text)]">
                        <Clock className="size-3" aria-hidden />
                        Ödeme bekleniyor
                      </span>
                    ) : order.paidAt ? (
                      <span className="inline-flex items-center rounded-full bg-[var(--success-subtle)] px-2 py-0.5 text-[11px] font-medium text-[var(--success-text)]">
                        Ödendi
                      </span>
                    ) : null}
                    <p className="text-sm font-semibold tabular-nums text-[var(--panel-ink)]">
                      {formatMoney(money(order.totalKurus))}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-[var(--panel-ink)]">Hareketler</h2>
        {recent.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--panel-border)] bg-[var(--panel-surface)] px-4 py-10 text-center text-sm text-[var(--panel-ink-muted)]">
            Henüz cari hareket yok.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--panel-border)] overflow-hidden rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface)]">
            {recent.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--panel-ink)]">
                    {entry.description || entry.type}
                  </p>
                  <p className="text-xs text-[var(--panel-ink-muted)]">
                    {formatDate(entry.createdAt)} · {entry.type === "BORC" ? "Borç" : "Ödeme"}
                  </p>
                </div>
                <p
                  className={cn(
                    "shrink-0 text-sm font-semibold tabular-nums",
                    entry.type === "BORC" ? "text-[var(--danger-text)]" : "text-[var(--primary-text)]",
                  )}
                >
                  {entry.type === "BORC" ? "+" : "−"}
                  {formatMoney(money(entry.amountKurus))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
