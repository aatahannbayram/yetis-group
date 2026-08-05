import { prisma } from "@/infra/db/client";
import { getProductBySlug, getProducts } from "@/infra/db/products";
import { money } from "@/domain/money";

async function getUserPriceListId(userId: string | undefined) {
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { priceListId: true },
  });
  return user?.priceListId ?? null;
}

async function getPriceOverrides(priceListId: string | null) {
  if (!priceListId) return new Map<string, number>();
  const items = await prisma.priceListItem.findMany({
    where: { priceListId },
    select: { productId: true, priceKurus: true },
  });
  return new Map(items.map((item) => [item.productId, item.priceKurus]));
}

export async function getProductsWithPricing(userId?: string) {
  const [products, priceListId] = await Promise.all([
    getProducts(),
    getUserPriceListId(userId),
  ]);
  const overrides = await getPriceOverrides(priceListId);

  return products.map((product) => ({
    ...product,
    unitPrice: money(overrides.get(product.id) ?? product.pricePerUnitKurus),
  }));
}

export async function getProductBySlugWithPricing(slug: string, userId?: string) {
  const [product, priceListId] = await Promise.all([
    getProductBySlug(slug),
    getUserPriceListId(userId),
  ]);
  if (!product) return null;

  const overrides = await getPriceOverrides(priceListId);
  return {
    ...product,
    unitPrice: money(overrides.get(product.id) ?? product.pricePerUnitKurus),
  };
}

// ---- Admin: fiyat listesi yönetimi ----

export async function getPriceListsWithItems() {
  return prisma.priceList.findMany({
    orderBy: { name: "asc" },
    include: {
      items: { include: { product: true }, orderBy: { product: { name: "asc" } } },
      users: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function upsertPriceListItem(
  priceListId: string,
  productId: string,
  priceKurus: number,
) {
  return prisma.priceListItem.upsert({
    where: { priceListId_productId: { priceListId, productId } },
    update: { priceKurus },
    create: { priceListId, productId, priceKurus },
  });
}

export async function updateProductBasePrice(productId: string, priceKurus: number) {
  return prisma.product.update({ where: { id: productId }, data: { pricePerUnitKurus: priceKurus } });
}
