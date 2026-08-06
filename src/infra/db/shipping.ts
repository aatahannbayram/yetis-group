import { prisma } from "@/infra/db/client";
import { getLotsForVariant } from "@/infra/db/inventory";
import { sortLotsByFefo } from "@/domain/inventory/fefo";

export async function getShippingOverview() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: {
      primaryCategory: true,
      variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  const now = new Date();
  const soon = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const rows = [];
  for (const product of products) {
    for (const variant of product.variants) {
      const lots = await getLotsForVariant(variant.id);
      if (lots.length === 0) continue;

      const fefoOrder = sortLotsByFefo(
        lots.map((l) => ({ id: l.id, lotNumber: l.lotNumber, expirationDate: l.expirationDate, availableKg: l.availableKg })),
      );
      const fefoRank = new Map(fefoOrder.map((l, index) => [l.id, index]));

      rows.push({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        categoryName: product.primaryCategory.name,
        variantId: variant.id,
        sku: variant.sku,
        packLabel: variant.packSize ?? variant.packagingType,
        lots: lots.map((l) => ({
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
  }

  return rows;
}
