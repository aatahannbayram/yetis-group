import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import { requireDealerPortal } from "@/features/dealer/portal-context";
import { prisma } from "@/infra/db/client";

export default async function BayiAdreslerimPage() {
  const { dealerId } = await requireDealerPortal();
  const dealer = await prisma.dealer.findUniqueOrThrow({
    where: { id: dealerId },
    select: {
      unvan: true,
      addressLine: true,
      deliveryAddressLine: true,
      city: true,
      district: true,
      deliveryZoneCode: true,
      phone: true,
    },
  });

  const billing = [dealer.addressLine, dealer.district, dealer.city].filter(Boolean).join(", ");
  const delivery =
    dealer.deliveryAddressLine?.trim() ||
    [dealer.addressLine, dealer.district, dealer.city].filter(Boolean).join(", ");

  return (
    <div className="space-y-6 pb-24 sm:pb-6">
      <header className="border-b border-[var(--panel-border)] pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--panel-ink)]">Adreslerim</h1>
        <p className="mt-1 text-sm text-[var(--panel-ink-muted)]">
          Fatura ve teslimat adresleri
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <AddressCard
          title="Fatura adresi"
          lines={[
            dealer.unvan,
            billing || null,
            dealer.phone ? `Tel: ${dealer.phone}` : null,
          ]}
        />
        <AddressCard
          title="Teslimat adresi"
          lines={[
            delivery || null,
            dealer.deliveryZoneCode ? `Bölge kodu: ${dealer.deliveryZoneCode}` : null,
            dealer.city ? `Şehir: ${dealer.city}` : null,
          ]}
          tip="Soğuk zincir günleri bölge koduna göre kısıtlanır."
        />
      </div>

      <p className="text-sm text-[var(--panel-ink-muted)]">
        Yeni şube veya adres değişikliği için{" "}
        <Link
          href="/bayi/destek"
          className="inline-flex items-center gap-1 font-semibold text-[var(--primary-text)] hover:underline"
        >
          <MessageCircle className="size-3.5" aria-hidden />
          destek
        </Link>{" "}
        hattını kullanın.
      </p>
    </div>
  );
}

function AddressCard({
  title,
  lines,
  tip,
}: {
  title: string;
  lines: Array<string | null>;
  tip?: string;
}) {
  const filled = lines.filter(Boolean) as string[];
  return (
    <article className="rounded-xl border border-[var(--panel-border)] bg-white p-4">
      <div className="flex items-center gap-2">
        <MapPin className="size-4 text-[var(--primary-text)]" aria-hidden />
        <h2 className="text-sm font-semibold text-[var(--panel-ink)]">{title}</h2>
      </div>
      {filled.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--panel-ink-muted)]">Kayıtlı adres yok.</p>
      ) : (
        <ul className="mt-3 space-y-1 text-sm text-[var(--panel-ink)]">
          {filled.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
      {tip ? <p className="mt-3 text-xs text-[var(--panel-ink-muted)]">{tip}</p> : null}
    </article>
  );
}
