import { prisma } from "@/infra/db/client";
import { availableKgFromMovements } from "@/infra/db/inventory";
import { sortLotsByFefo, isLotExpired } from "@/domain/inventory/fefo";
import { packLabel } from "@/lib/format/packaging";

export async function getShippingOverview() {
  const lots = await prisma.lot.findMany({
    where: { variant: { isActive: true, product: { active: true } } },
    include: {
      movements: true,
      variant: {
        include: { product: { include: { primaryCategory: true } } },
      },
    },
    orderBy: { expirationDate: "asc" },
  });

  const now = new Date();
  const soon = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const byVariant = new Map<string, typeof lots>();
  for (const lot of lots) {
    const list = byVariant.get(lot.variantId) ?? [];
    list.push(lot);
    byVariant.set(lot.variantId, list);
  }

  const rows = [];
  for (const [variantId, variantLots] of byVariant) {
    const variant = variantLots[0]!.variant;
    const product = variant.product;

    const summarized = variantLots.map((l) => ({
      id: l.id,
      lotNumber: l.lotNumber,
      expirationDate: l.expirationDate,
      availableKg: availableKgFromMovements(l.movements),
      expired: isLotExpired(l.expirationDate, now),
    }));

    const fefoOrder = sortLotsByFefo(summarized, now);
    const fefoRank = new Map(fefoOrder.map((l, index) => [l.id, index]));

    rows.push({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      categoryName: product.primaryCategory.name,
      imageUrl: product.imageUrl,
      variantId,
      sku: variant.sku,
      packLabel: packLabel(variant.packSize, variant.packagingType),
      lots: summarized.map((l) => ({
        id: l.id,
        lotNumber: l.lotNumber,
        expirationDate: l.expirationDate.toISOString(),
        availableKg: l.availableKg.toString(),
        expired: l.expired,
        expiringSoon: !l.expired && l.expirationDate <= soon,
        daysUntilExpiry: Math.ceil(
          (l.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        ),
        fefoRank: fefoRank.get(l.id) ?? null,
      })),
    });
  }

  rows.sort((a, b) => a.productName.localeCompare(b.productName, "tr"));
  return rows;
}
