import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { requireDealerPortal } from "@/features/dealer/portal-context";
import { prisma } from "@/infra/db/client";
import { availableKgFromMovements } from "@/infra/db/inventory";
import { formatDate } from "@/lib/format/date";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { DealerOffersList, type DealerOffer } from "@/components/dealer/dealer-offers-list";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

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

  const kgFmt = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 });

  const offers: DealerOffer[] = [];
  for (const lot of lots) {
    const availableKg = availableKgFromMovements(lot.movements).toNumber();
    if (availableKg <= 0) continue;
    const daysLeft = Math.max(
      0,
      Math.ceil((lot.expirationDate.getTime() - now.getTime()) / MS_PER_DAY),
    );
    offers.push({
      id: lot.id,
      productName: lot.variant.product.name,
      slug: lot.variant.product.slug,
      imageUrl: lot.variant.product.imageUrl,
      packLabel: lot.variant.packSize ?? lot.variant.sku,
      lotNumber: lot.lotNumber,
      sku: lot.variant.sku,
      expiryLabel: formatDate(lot.expirationDate),
      daysLeft,
      remainingKgLabel: kgFmt.format(availableKg),
      priceLabel: formatMoney(money(lot.variant.pricePerUnitKurus)),
    });
  }

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
        <DealerOffersList offers={offers} />
      )}
    </div>
  );
}
