import Link from "next/link";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import { ArrowRight, ClipboardList, Package } from "lucide-react";
import { auth } from "@/infra/auth/server";
import { getUserDealerId, isStaffUser } from "@/infra/db/users";
import { IMPERSONATE_COOKIE, parseImpersonationCookie } from "@/lib/impersonation";
import { listOrdersForDealer } from "@/infra/db/orders";
import { summarizeDealerOrders } from "@/domain/order/dealer-report";
import { formatMoney } from "@/lib/format/money";
import { formatDate } from "@/lib/format/date";
import { money } from "@/domain/money";
import { cn } from "@/lib/utils";
import { DealerCancelOrderButton } from "@/components/dealer/dealer-cancel-order-button";

const DEALER_CANCELABLE_STATUSES = new Set(["DRAFT", "SUBMITTED", "UNDER_REVIEW"]);

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Taslak",
  SUBMITTED: "Gönderildi",
  UNDER_REVIEW: "İnceleniyor",
  CONFIRMED: "Onaylandı",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Yolda",
  DELIVERED: "Teslim edildi",
  REJECTED: "Reddedildi",
  CANCELLED: "İptal",
};

const STATUS_TONE: Record<string, string> = {
  SUBMITTED: "bg-sky-50 text-sky-800 border-sky-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-900 border-amber-200",
  CONFIRMED: "bg-emerald-50 text-emerald-900 border-emerald-200",
  PREPARING: "bg-violet-50 text-violet-900 border-violet-200",
  SHIPPED: "bg-indigo-50 text-indigo-900 border-indigo-200",
  DELIVERED: "bg-[var(--primary-subtle)] text-[var(--primary-text)] border-[var(--primary-solid)]/20",
  REJECTED: "bg-red-50 text-red-800 border-red-200",
  CANCELLED: "bg-stone-100 text-stone-600 border-stone-200",
  DRAFT: "bg-stone-50 text-stone-600 border-stone-200",
};

export default async function BayiSiparislerimPage({
  searchParams,
}: {
  searchParams: Promise<{ yeni?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth");

  const jar = await cookies();
  const impId = parseImpersonationCookie(jar.get(IMPERSONATE_COOKIE)?.value);
  const staff = await isStaffUser(session.user.id);
  let dealerId = await getUserDealerId(session.user.id);
  if (impId && staff) dealerId = impId;
  if (!dealerId) redirect("/");

  const { yeni } = await searchParams;
  const orders = await listOrdersForDealer(dealerId);
  const report = summarizeDealerOrders(orders);

  return (
    <div className="space-y-6 pb-24 sm:pb-6">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--panel-border)] pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--panel-ink)]">
            Siparişlerim
          </h1>
          <p className="mt-1 text-sm text-[var(--panel-ink-muted)]">
            Geçmiş siparişler ve dönem özeti
          </p>
        </div>
        <Link
          href="/bayi/siparis"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[var(--primary-solid)] px-4 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
        >
          Yeni sipariş <ArrowRight className="size-4" aria-hidden />
        </Link>
      </header>

      {yeni ? (
        <p
          role="status"
          className="rounded-lg border border-[var(--primary-solid)]/25 bg-[var(--primary-subtle)] px-4 py-3 text-sm text-[var(--primary-text)]"
        >
          Siparişiniz alındı (#{yeni.slice(-6)}). Ekip incelemeye aldı.
        </p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Sipariş özeti">
        <Stat label="Bu ay" value={String(report.monthCount)} hint={formatMoney(money(report.monthKurus))} />
        <Stat label="Açık sipariş" value={String(report.openCount)} hint={formatMoney(money(report.openKurus))} />
        <Stat
          label="Teslim edilen"
          value={String(report.deliveredCount)}
          hint={formatMoney(money(report.deliveredKurus))}
        />
        <Stat label="Toplam kayıt" value={String(report.totalOrders)} hint="Tüm zamanlar" />
      </section>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--panel-border)] bg-white px-6 py-14 text-center">
          <ClipboardList className="mx-auto size-8 text-[var(--panel-ink-muted)]" aria-hidden />
          <p className="mt-3 font-medium text-[var(--panel-ink)]">Henüz sipariş yok</p>
          <p className="mt-1 text-sm text-[var(--panel-ink-muted)]">
            Katalogdan ürün seçerek ilk siparişinizi oluşturun.
          </p>
          <Link
            href="/bayi/siparis"
            className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-lg bg-[var(--panel-ink)] px-4 text-sm font-semibold text-white"
          >
            Sipariş ver
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--panel-border)] overflow-hidden rounded-xl border border-[var(--panel-border)] bg-white">
          {orders.map((order) => {
            const thumbs = order.lines
              .map((l) => l.variant.product.imageUrl)
              .filter((u): u is string => Boolean(u))
              .slice(0, 3);
            return (
              <li key={order.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex -space-x-2">
                    {thumbs.length ? (
                      thumbs.map((url) => (
                        <span
                          key={url}
                          className="relative size-10 overflow-hidden rounded-md border-2 border-white bg-[var(--surface-3)]"
                        >
                          <Image src={url} alt="" fill className="object-cover" sizes="40px" />
                        </span>
                      ))
                    ) : (
                      <span className="flex size-10 items-center justify-center rounded-md bg-[var(--surface-3)] text-[var(--panel-ink-muted)]">
                        <Package className="size-4" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[var(--panel-ink)]">#{order.id.slice(-6)}</p>
                      <span
                        className={cn(
                          "rounded border px-2 py-0.5 text-[11px] font-medium",
                          STATUS_TONE[order.status] ?? STATUS_TONE.DRAFT,
                        )}
                      >
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--panel-ink-muted)]">
                      {formatDate(order.createdAt)} · {order.lines.length} kalem
                    </p>
                    <p className="mt-1 truncate text-sm text-[var(--panel-ink-muted)]">
                      {order.lines
                        .slice(0, 3)
                        .map((l) => `${l.variant.product.name} ×${l.quantity}`)
                        .join(" · ")}
                      {order.lines.length > 3 ? "…" : ""}
                    </p>
                    {order.note ? (
                      <p className="mt-1 line-clamp-2 text-xs text-[var(--panel-ink-muted)] whitespace-pre-wrap">
                        {order.note}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {DEALER_CANCELABLE_STATUSES.has(order.status) ? (
                    <DealerCancelOrderButton orderId={order.id} />
                  ) : null}
                  <p className="text-right text-base font-semibold tabular-nums text-[var(--panel-ink)]">
                    {formatMoney(money(order.totalKurus))}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-[var(--panel-border)] bg-white px-4 py-3">
      <p className="text-[11px] font-medium tracking-wide text-[var(--panel-ink-muted)] uppercase">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-[var(--panel-ink)]">
        {value}
      </p>
      <p className="mt-0.5 text-xs tabular-nums text-[var(--panel-ink-muted)]">{hint}</p>
    </div>
  );
}
