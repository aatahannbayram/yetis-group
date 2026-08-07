import { prisma } from "@/infra/db/client";
import { getProductBySlug, getProducts, defaultVariant } from "@/infra/db/products";
import { money } from "@/domain/money";
import { slugifyTr } from "@/domain/catalog/slug";

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
        unitFactor: variant.unitFactor,
        moq: variant.moq ?? 1,
        vatRateBasisPoints: variant.vatRateBasisPoints,
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
    unitFactor: variant.unitFactor,
    moq: variant.moq ?? 1,
    vatRateBasisPoints: variant.vatRateBasisPoints,
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
  if (!Number.isFinite(priceKurus) || priceKurus < 0) {
    throw new Error("Geçerli bir fiyat girin");
  }
  return prisma.priceListItem.upsert({
    where: { priceListId_variantId: { priceListId, variantId } },
    update: { priceKurus: Math.round(priceKurus) },
    create: { priceListId, variantId, priceKurus: Math.round(priceKurus) },
  });
}

export async function updateVariantBasePrice(variantId: string, priceKurus: number) {
  if (!Number.isFinite(priceKurus) || priceKurus < 0) {
    throw new Error("Geçerli bir fiyat girin");
  }
  return prisma.productVariant.update({
    where: { id: variantId },
    data: { pricePerUnitKurus: Math.round(priceKurus) },
  });
}

export async function createPriceList(input: { name: string; slug?: string }) {
  const name = input.name.trim();
  if (!name) throw new Error("Liste adı gerekli");
  const root = slugifyTr(input.slug?.trim() || name) || "fiyat-listesi";
  let slug = root;
  let n = 0;
  while (await prisma.priceList.findUnique({ where: { slug }, select: { id: true } })) {
    n += 1;
    slug = `${root}-${n}`;
  }
  return prisma.priceList.create({ data: { name, slug } });
}

/** Group prices for product variants across all price lists (dealer / customer groups). */
export async function getGroupPricesForVariants(variantIds: string[]) {
  const [lists, items] = await Promise.all([
    prisma.priceList.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { dealers: true } },
      },
    }),
    variantIds.length === 0
      ? Promise.resolve([])
      : prisma.priceListItem.findMany({
          where: { variantId: { in: variantIds } },
          select: { priceListId: true, variantId: true, priceKurus: true },
        }),
  ]);

  const priceByKey = new Map(
    items.map((i) => [`${i.priceListId}:${i.variantId}`, i.priceKurus] as const),
  );

  return {
    lists: lists.map((l) => ({
      id: l.id,
      name: l.name,
      slug: l.slug,
      dealerCount: l._count.dealers,
    })),
    /** Returns override kuruş or null if not set (falls back to base). */
    getPrice(priceListId: string, variantId: string): number | null {
      return priceByKey.get(`${priceListId}:${variantId}`) ?? null;
    },
  };
}

/** Ensure every active variant has a row in the given price list (uses base price). */
export async function fillPriceListFromCatalog(priceListId: string) {
  const [variants, existing] = await Promise.all([
    prisma.productVariant.findMany({
      where: { isActive: true, product: { active: true } },
      select: { id: true, pricePerUnitKurus: true },
    }),
    prisma.priceListItem.findMany({
      where: { priceListId },
      select: { variantId: true },
    }),
  ]);
  const have = new Set(existing.map((e) => e.variantId));
  const missing = variants.filter((v) => !have.has(v.id));
  if (missing.length === 0) return { added: 0 };
  await prisma.priceListItem.createMany({
    data: missing.map((v) => ({
      priceListId,
      variantId: v.id,
      priceKurus: v.pricePerUnitKurus,
    })),
    skipDuplicates: true,
  });
  return { added: missing.length };
}

export async function listActiveVariantsForPicker() {
  return prisma.productVariant.findMany({
    where: { isActive: true, product: { active: true } },
    orderBy: [{ product: { name: "asc" } }, { sortOrder: "asc" }],
    select: {
      id: true,
      sku: true,
      packSize: true,
      packagingType: true,
      pricePerUnitKurus: true,
      product: { select: { name: true, imageUrl: true } },
    },
  });
}
