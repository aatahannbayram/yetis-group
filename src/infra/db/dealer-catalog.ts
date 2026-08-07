import { prisma } from "@/infra/db/client";
import { getProducts } from "@/infra/db/products";
import { getShippableStockByVariant } from "@/infra/db/inventory";
import { money, type Money } from "@/domain/money";

export type DealerCatalogVariant = {
  id: string;
  sku: string;
  packagingType: string;
  packSize: string | null;
  unitFactor: string;
  moq: number;
  vatRateBasisPoints: number;
  priceKurus: number;
  unitPrice: Money;
  stockKg: number;
};

export type DealerCatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  categoryName: string;
  categorySlug: string;
  variants: DealerCatalogVariant[];
};

async function priceOverridesForDealer(dealerId: string) {
  const dealer = await prisma.dealer.findUnique({
    where: { id: dealerId },
    select: { priceListId: true },
  });
  if (!dealer?.priceListId) return new Map<string, number>();
  const items = await prisma.priceListItem.findMany({
    where: { priceListId: dealer.priceListId },
    select: { variantId: true, priceKurus: true },
  });
  return new Map(items.map((i) => [i.variantId, i.priceKurus]));
}

/** Active catalog with every variant, dealer list price, and shippable stock kg. */
export async function getDealerCatalog(dealerId: string): Promise<DealerCatalogProduct[]> {
  const [products, overrides, stockByVariant] = await Promise.all([
    getProducts(),
    priceOverridesForDealer(dealerId),
    getShippableStockByVariant(),
  ]);

  return products
    .map((product) => {
      const variants: DealerCatalogVariant[] = product.variants.map((v) => {
        const priceKurus = overrides.get(v.id) ?? v.pricePerUnitKurus;
        const stock = stockByVariant.get(v.id);
        return {
          id: v.id,
          sku: v.sku,
          packagingType: v.packagingType,
          packSize: v.packSize,
          unitFactor: v.unitFactor.toString(),
          moq: v.moq ?? 1,
          vatRateBasisPoints: v.vatRateBasisPoints,
          priceKurus,
          unitPrice: money(priceKurus),
          stockKg: stock ? stock.toNumber() : 0,
        };
      });
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        imageUrl: product.imageUrl,
        categoryName: product.primaryCategory.name,
        categorySlug: product.primaryCategory.slug,
        variants,
      };
    })
    .filter((p) => p.variants.length > 0);
}
