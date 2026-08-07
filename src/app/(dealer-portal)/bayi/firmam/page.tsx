import Link from "next/link";
import { Building2, MessageCircle } from "lucide-react";
import { requireDealerPortal } from "@/features/dealer/portal-context";
import { prisma } from "@/infra/db/client";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  BAYI: "Market / Şarküteri",
  HORECA: "HORECA",
  ARA_TOPTANCI: "Ara toptancı",
  ZINCIR: "Zincir",
};

const STATUS_LABEL: Record<string, string> = {
  BASVURU: "Başvuru",
  INCELEME: "İnceleme",
  ONAYLI: "Onaylı",
  AKTIF: "Aktif",
  RISKLI: "Riskli",
  BLOKE: "Bloke",
  PASIF: "Pasif",
};

const TIER_LABEL: Record<string, string> = {
  STANDART: "Standart",
  PREMIUM: "Premium",
  VIP: "VIP",
};

export default async function BayiFirmamPage() {
  const { dealerId } = await requireDealerPortal();
  const dealer = await prisma.dealer.findUniqueOrThrow({
    where: { id: dealerId },
    include: {
      priceList: { select: { name: true } },
      salesRep: { select: { name: true, email: true } },
      users: {
        select: { id: true, name: true, email: true, phoneNumber: true },
        orderBy: { name: "asc" },
      },
    },
  });

  return (
    <div className="space-y-6 pb-24 sm:pb-6">
      <header className="border-b border-[var(--panel-border)] pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--panel-ink)]">Firmam</h1>
        <p className="mt-1 text-sm text-[var(--panel-ink-muted)]">
          Ticari kimlik ve hesap bilgileri (değişiklik için destek)
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border border-[var(--panel-border)] bg-white">
        <div className="flex items-start gap-3 border-b border-[var(--panel-border)] px-4 py-4">
          <span className="flex size-10 items-center justify-center rounded-lg bg-[var(--primary-subtle)] text-[var(--primary-text)]">
            <Building2 className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[var(--panel-ink)]">{dealer.unvan}</h2>
            <p className="mt-0.5 text-sm text-[var(--panel-ink-muted)]">
              {TYPE_LABEL[dealer.dealerType] ?? dealer.dealerType}
              {dealer.membershipTier ? ` · ${TIER_LABEL[dealer.membershipTier] ?? dealer.membershipTier}` : ""}
            </p>
            <span
              className={cn(
                "mt-2 inline-flex rounded border px-2 py-0.5 text-[11px] font-medium",
                dealer.status === "AKTIF" || dealer.status === "ONAYLI"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : dealer.status === "RISKLI" || dealer.status === "BLOKE"
                    ? "border-red-200 bg-red-50 text-red-800"
                    : "border-stone-200 bg-stone-50 text-stone-700",
              )}
            >
              {STATUS_LABEL[dealer.status] ?? dealer.status}
            </span>
          </div>
        </div>

        <dl className="grid gap-0 sm:grid-cols-2">
          <Field label="Vergi no" value={dealer.vergiNo} />
          <Field label="Vergi dairesi" value={dealer.vergiDairesi} />
          <Field label="E-posta" value={dealer.email} />
          <Field label="Telefon" value={dealer.phone} />
          <Field label="Şehir / ilçe" value={[dealer.district, dealer.city].filter(Boolean).join(" / ") || null} />
          <Field label="Fatura adresi" value={dealer.addressLine} />
          <Field
            label="Kredi limiti"
            value={dealer.creditLimitKurus != null ? formatMoney(money(dealer.creditLimitKurus)) : null}
          />
          <Field
            label="Vade"
            value={dealer.paymentTermDays != null ? `${dealer.paymentTermDays} gün` : null}
          />
          <Field label="Fiyat listesi" value={dealer.priceList?.name ?? null} />
          <Field
            label="Satış temsilcisi"
            value={
              dealer.salesRep
                ? `${dealer.salesRep.name}${dealer.salesRep.email ? ` · ${dealer.salesRep.email}` : ""}`
                : null
            }
          />
        </dl>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-[var(--panel-ink)]">Kullanıcılar</h2>
        {dealer.users.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--panel-border)] bg-white px-4 py-8 text-center text-sm text-[var(--panel-ink-muted)]">
            Bağlı kullanıcı yok.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--panel-border)] overflow-hidden rounded-xl border border-[var(--panel-border)] bg-white">
            {dealer.users.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--panel-ink)]">{u.name}</p>
                  <p className="text-xs text-[var(--panel-ink-muted)]">{u.email}</p>
                </div>
                {u.phoneNumber ? (
                  <p className="text-xs tabular-nums text-[var(--panel-ink-muted)]">{u.phoneNumber}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-sm text-[var(--panel-ink-muted)]">
        Unvan, vergi veya yetkili değişikliği için{" "}
        <Link href="/bayi/destek" className="inline-flex items-center gap-1 font-semibold text-[var(--primary-text)] hover:underline">
          <MessageCircle className="size-3.5" aria-hidden />
          destek
        </Link>{" "}
        üzerinden yazın.
      </p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="border-t border-[var(--panel-border)] px-4 py-3 sm:border-t-0 sm:odd:border-r sm:[&:nth-child(-n+2)]:border-t">
      <dt className="text-[11px] font-medium tracking-wide text-[var(--panel-ink-muted)] uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-[var(--panel-ink)]">{value?.trim() || "—"}</dd>
    </div>
  );
}
