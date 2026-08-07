import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { requireDealerPortal } from "@/features/dealer/portal-context";
import { prisma } from "@/infra/db/client";
import { availableKgFromMovements } from "@/infra/db/inventory";
import { formatDate } from "@/lib/format/date";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";

/** SKT'ye 21 gün kalan, sevkiyat edilebilir lotlar: bayiye "fırsat" olarak gösterilir. */
export default async function BayiFirsatlarPage() {
  await requireDealerPortal();

  const now = new Date();
  const horizon = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);

  const lots = await prisma.lot.findMany({
    where: {
      expirationDate: { gte: now, lte: horizon },
      variant: { isActive: true, product: { active: true } },
    },
    include: {
      movements: true,
      variant: {
        include: {
          product: { select: { name: true, slug: true, imageUrl: true } },
        },
      },
    },
    orderBy: { expirationDate: "asc" },
    take: 24,
  });

  const offers = lots
    .map((lot) => {
      const available = availableKgFromMovements(lot.movements);
      return {
        id: lot.id,
        lotNumber: lot.lotNumber,
        expirationDate: lot.expirationDate,
        availableKg: available.toNumber(),
        sku: lot.variant.sku,
        packSize: lot.variant.packSize,
        priceKurus: lot.variant.pricePerUnitKurus,
        productName: lot.variant.product.name,
        slug: lot.variant.product.slug,
      };
    })
    .filter((o) => o.availableKg > 0);

  const kgFmt = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 });

  return (
    <div className="space-y-6 pb-24 sm:pb-6">
      <header className="border-b border-[var(--panel-border)] pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--panel-ink)]">
          Fırsatlar
        </h1>
        <p className="mt-1 text-sm text-[var(--panel-ink-muted)]">
          Yakın SKT’li lotlar: hızlı sevkiyat için avantajlı stok
        </p>
      </header>

      {offers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--panel-border)] bg-white px-6 py-14 text-center">
          <Sparkles className="mx-auto size-8 text-[var(--panel-ink-muted)]" aria-hidden />
          <p className="mt-3 font-medium text-[var(--panel-ink)]">Şu an fırsat yok</p>
          <p className="mt-1 text-sm text-[var(--panel-ink-muted)]">
            21 gün içinde SKT’si dolacak lot bulunmuyor. Kataloğa göz atın.
          </p>
          <Link
            href="/bayi/siparis"
            className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-lg bg-[var(--panel-ink)] px-4 text-sm font-semibold text-white"
          >
            Sipariş ver <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--panel-border)] overflow-hidden rounded-xl border border-[var(--panel-border)] bg-white">
          {offers.map((o) => (
            <li
              key={o.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-[var(--panel-ink)]">{o.productName}</p>
                <p className="mt-0.5 text-xs text-[var(--panel-ink-muted)]">
                  {o.packSize ?? o.sku} · Lot {o.lotNumber} · SKT {formatDate(o.expirationDate)}
                </p>
                <p className="mt-1 text-sm text-amber-800">
                  Kalan: {kgFmt.format(o.availableKg)} kg
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold tabular-nums">
                  {formatMoney(money(o.priceKurus))}
                </p>
                <Link
                  href="/bayi/siparis"
                  className="inline-flex h-9 items-center rounded-lg bg-[var(--primary-solid)] px-3 text-xs font-semibold text-white hover:bg-[var(--primary-hover)]"
                >
                  Siparişe git
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
