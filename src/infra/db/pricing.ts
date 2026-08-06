import { prisma } from "@/infra/db/client";
import { getProductBySlug, getProducts, defaultVariant } from "@/infra/db/products";
import { money } from "@/domain/money";

async function resolvePriceListId(userId: string | undefined) {
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      priceListId: true,
      dealer: { select: { priceListId: true } },
    },
  });
  return user?.dealer?.priceListId ?? user?.priceListId ?? null;
}

async function getPriceOverrides(priceListId: string | null) {
  if (!priceListId) return new Map<string, number>();
  const items = await prisma.priceListItem.findMany({
    where: { priceListId },
    select: { variantId: true, priceKurus: true },
  });
  return new Map(items.map((item) => [item.variantId, item.priceKurus]));
}

export async function getProductsWithPricing(userId?: string, categorySlug?: string) {
  const [products, priceListId] = await Promise.all([
    getProducts(categorySlug ? { categorySlug } : undefined),
    resolvePriceListId(userId),
  ]);
  const overrides = await getPriceOverrides(priceListId);

  return products.flatMap((product) => {
    const variant = defaultVariant(product);
    if (!variant) return [];
    return [
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        imageUrl: product.imageUrl,
        category: product.primaryCategory.name,
        categorySlug: product.primaryCategory.slug,
        producerName: product.producer.name,
        sku: variant.sku,
        unitLabel: variant.packSize ?? variant.packagingType,
        kgPerUnit: variant.unitFactor,
        variantId: variant.id,
        unitPrice: money(overrides.get(variant.id) ?? variant.pricePerUnitKurus),
      },
    ];
  });
}

export async function getProductBySlugWithPricing(slug: string, userId?: string) {
  const [product, priceListId] = await Promise.all([
    getProductBySlug(slug),
    resolvePriceListId(userId),
  ]);
  if (!product) return null;
  const variant = defaultVariant(product);
  if (!variant) return null;
  const overrides = await getPriceOverrides(priceListId);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    imageUrl: product.imageUrl,
    category: product.primaryCategory.name,
    categorySlug: product.primaryCategory.slug,
    producer: product.producer,
    storageCondition: product.storageCondition,
    shelfLifeDays: product.shelfLifeDays,
    requiresColdChain: product.requiresColdChain,
    usageTips: product.usageTips,
    techSheetUrl: product.techSheetUrl,
    media: product.media,
    attributeValues: product.attributeValues,
    variants: product.variants.map((v) => ({
      ...v,
      unitPrice: money(overrides.get(v.id) ?? v.pricePerUnitKurus),
    })),
    sku: variant.sku,
    unitLabel: variant.packSize ?? variant.packagingType,
    kgPerUnit: variant.unitFactor,
    variantId: variant.id,
    unitPrice: money(overrides.get(variant.id) ?? variant.pricePerUnitKurus),
  };
}

export async function getVariantUnitPrice(variantId: string, userId?: string) {
  const [variant, priceListId] = await Promise.all([
    prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } }),
    resolvePriceListId(userId),
  ]);
  const overrides = await getPriceOverrides(priceListId);
  return {
    variant,
    unitPriceKurus: overrides.get(variantId) ?? variant.pricePerUnitKurus,
  };
}

export async function getPriceListsWithItems() {
  return prisma.priceList.findMany({
    orderBy: { name: "asc" },
    include: {
      items: {
        include: { variant: { include: { product: true } } },
        orderBy: { variant: { sku: "asc" } },
      },
      users: { select: { id: true, name: true, email: true } },
      dealers: { select: { id: true, unvan: true } },
    },
  });
}

export async function upsertPriceListItem(
  priceListId: string,
  variantId: string,
  priceKurus: number,
) {
  return prisma.priceListItem.upsert({
    where: { priceListId_variantId: { priceListId, variantId } },
    update: { priceKurus },
    create: { priceListId, variantId, priceKurus },
  });
}

export async function updateVariantBasePrice(variantId: string, priceKurus: number) {
  return prisma.productVariant.update({
    where: { id: variantId },
    data: { pricePerUnitKurus: priceKurus },
  });
}
