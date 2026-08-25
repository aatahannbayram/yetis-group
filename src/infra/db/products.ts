import { prisma } from "@/infra/db/client";
import type { Prisma } from "@/generated/prisma";
import { slugifyTr } from "@/domain/catalog/slug";
import { assertValidPackagingType } from "@/infra/db/attributes";

const adminListSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  imageUrl: true,
  primaryCategory: { select: { name: true } },
  variants: {
    where: { isActive: true },
    orderBy: { sortOrder: "asc" as const },
    select: {
      id: true,
      sku: true,
      packSize: true,
      packagingType: true,
      baseUnit: true,
      unitFactor: true,
      vatRateBasisPoints: true,
      pricePerUnitKurus: true,
    },
  },
  media: {
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
    select: { id: true, url: true, alt: true, isPrimary: true },
  },
} satisfies Prisma.ProductSelect;

const dealerCatalogSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  requiresColdChain: true,
  storageCondition: true,
  shelfLifeDays: true,
  usageTips: true,
  primaryCategory: { select: { name: true, slug: true } },
  producer: { select: { name: true, region: true, story: true } },
  media: {
    orderBy: { sortOrder: "asc" as const },
    select: { id: true, url: true, kind: true },
  },
  variants: {
    where: { isActive: true },
    orderBy: { sortOrder: "asc" as const },
    select: {
      id: true,
      sku: true,
      packagingType: true,
      packSize: true,
      unitFactor: true,
      moq: true,
      vatRateBasisPoints: true,
      pricePerUnitKurus: true,
    },
  },
  attributeValues: {
    include: {
      attribute: { select: { key: true, name: true, type: true, unit: true } },
      selectedOptions: { include: { option: { select: { label: true } } } },
    },
  },
} satisfies Prisma.ProductSelect;

export type AdminListProduct = Awaited<ReturnType<typeof getProductsForAdminList>>[number];
export type DealerCatalogRow = Awaited<ReturnType<typeof getProductsForDealerCatalog>>[number];

/** Panel ürün listesi: nitelik yok, hafif select. */
export async function getProductsForAdminList() {
  return prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: adminListSelect,
  });
}

/** Bayi katalog: fiyat/stok ayrı birleştirilir. */
export async function getProductsForDealerCatalog() {
  return prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: dealerCatalogSelect,
  });
}

export async function getProducts(filters?: { categorySlug?: string }) {
  return prisma.product.findMany({
    where: {
      active: true,
      ...(filters?.categorySlug
        ? {
            OR: [
              { primaryCategory: { slug: filters.categorySlug } },
              { categories: { some: { category: { slug: filters.categorySlug } } } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    include: {
      primaryCategory: true,
      producer: true,
      variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      media: { orderBy: [{ sortOrder: "asc" }] },
      attributeValues: {
        include: {
          attribute: true,
          selectedOptions: { include: { option: true } },
        },
      },
    },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      primaryCategory: true,
      producer: true,
      variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      media: { orderBy: [{ sortOrder: "asc" }] },
      attributeValues: {
        include: {
          attribute: true,
          selectedOptions: { include: { option: true } },
        },
      },
    },
  });
}

export async function updateProductDescription(productId: string, description: string) {
  return prisma.product.update({
    where: { id: productId },
    data: { description },
  });
}

export type CreateProductInput = {
  name: string;
  description?: string;
  primaryCategoryId: string;
  producerId: string;
  sku?: string;
  barcode?: string | null;
  packSize?: string | null;
  packagingType?: string;
  unitFactor: number;
  moq?: number;
  pricePerUnitKurus: number;
  vatRateBasisPoints?: number;
  storageCondition?: string | null;
  shelfLifeDays?: number | null;
  requiresColdChain?: boolean;
  usageTips?: string;
  techSheetUrl?: string | null;
};

async function uniqueSlug(base: string): Promise<string> {
  const root = slugifyTr(base) || "urun";
  let slug = root;
  let n = 0;
  while (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
    n += 1;
    slug = `${root}-${n}`;
  }
  return slug;
}

async function uniqueSku(preferred: string): Promise<string> {
  const root = preferred.trim().toUpperCase() || `YG-${Date.now().toString(36).toUpperCase()}`;
  let sku = root;
  let n = 0;
  while (await prisma.productVariant.findUnique({ where: { sku }, select: { id: true } })) {
    n += 1;
    sku = `${root}-${n}`;
  }
  return sku;
}

/** Creates product + primary category link + default variant. */
export async function createProduct(input: CreateProductInput) {
  const name = input.name.trim();
  if (!name) throw new Error("Ürün adı gerekli");
  if (!input.primaryCategoryId) throw new Error("Kategori gerekli");
  if (!input.producerId) throw new Error("Üretici gerekli");
  if (!Number.isFinite(input.pricePerUnitKurus) || input.pricePerUnitKurus < 0) {
    throw new Error("Geçerli bir fiyat girin");
  }
  if (!Number.isFinite(input.unitFactor) || input.unitFactor <= 0) {
    throw new Error("Birim katsayısı 0'dan büyük olmalı");
  }

  const slug = await uniqueSlug(name);
  const skuBase =
    input.sku?.trim() ||
    `YG-${slugifyTr(name).slice(0, 12).toUpperCase() || "SKU"}`;
  const sku = await uniqueSku(skuBase);
  const priceKurus = Math.round(input.pricePerUnitKurus);
  const packagingType = await assertValidPackagingType(input.packagingType ?? "KOLI");

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description: input.description?.trim() ?? "",
      producerId: input.producerId,
      primaryCategoryId: input.primaryCategoryId,
      storageCondition: input.storageCondition?.trim() || null,
      shelfLifeDays: input.shelfLifeDays ?? null,
      requiresColdChain: input.requiresColdChain ?? true,
      usageTips: input.usageTips?.trim() ?? "",
      techSheetUrl: input.techSheetUrl?.trim() || null,
      categories: { create: { categoryId: input.primaryCategoryId } },
      variants: {
        create: {
          sku,
          barcode: input.barcode?.trim() || null,
          packagingType,
          packSize: input.packSize?.trim() || null,
          unitFactor: input.unitFactor,
          moq: input.moq && input.moq > 0 ? Math.round(input.moq) : 1,
          pricePerUnitKurus: priceKurus,
          vatRateBasisPoints: input.vatRateBasisPoints ?? 100,
        },
      },
    },
    include: { variants: true },
  });

  const variant = product.variants[0];
  if (variant) {
    await seedVariantIntoPriceLists(variant.id, variant.pricePerUnitKurus);
  }
  return product;
}

async function seedVariantIntoPriceLists(variantId: string, priceKurus: number) {
  const lists = await prisma.priceList.findMany({ select: { id: true } });
  if (lists.length === 0) return;
  await prisma.priceListItem.createMany({
    data: lists.map((list) => ({
      priceListId: list.id,
      variantId,
      priceKurus,
    })),
    skipDuplicates: true,
  });
}

export type CreateVariantInput = {
  productId: string;
  sku?: string;
  packagingType?: string;
  packSize?: string | null;
  unitFactor: number;
  pricePerUnitKurus: number;
  vatRateBasisPoints?: number;
  moq?: number;
  /** When true (default), seed base price into every price list. */
  seedPriceLists?: boolean;
};

/** Adds an active variant (SKU / pack) to an existing product. */
export async function createVariant(input: CreateVariantInput) {
  if (!input.productId) throw new Error("Ürün gerekli");
  if (!Number.isFinite(input.pricePerUnitKurus) || input.pricePerUnitKurus < 0) {
    throw new Error("Geçerli bir fiyat girin");
  }
  if (!Number.isFinite(input.unitFactor) || input.unitFactor <= 0) {
    throw new Error("Birim katsayısı 0'dan büyük olmalı");
  }

  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    select: {
      id: true,
      slug: true,
      name: true,
      variants: { select: { sortOrder: true }, orderBy: { sortOrder: "desc" }, take: 1 },
    },
  });
  if (!product) throw new Error("Ürün bulunamadı");

  const nextOrder = (product.variants[0]?.sortOrder ?? -1) + 1;
  const skuBase =
    input.sku?.trim() ||
    `YG-${slugifyTr(product.name).slice(0, 10).toUpperCase() || "SKU"}-${nextOrder + 1}`;
  const sku = await uniqueSku(skuBase);
  const priceKurus = Math.round(input.pricePerUnitKurus);
  const packagingType = await assertValidPackagingType(input.packagingType ?? "KOLI");

  const variant = await prisma.productVariant.create({
    data: {
      productId: product.id,
      sku,
      packagingType,
      packSize: input.packSize?.trim() || null,
      unitFactor: input.unitFactor,
      pricePerUnitKurus: priceKurus,
      vatRateBasisPoints: input.vatRateBasisPoints ?? 100,
      moq: input.moq && input.moq > 0 ? Math.round(input.moq) : 1,
      sortOrder: nextOrder,
    },
  });

  if (input.seedPriceLists !== false) {
    await seedVariantIntoPriceLists(variant.id, priceKurus);
  }

  return variant;
}

export type UpdateVariantPackagingInput = {
  packagingType: string;
  packSize: string | null;
  unitFactor: number;
};

/** Kayıttan sonra ambalaj/paket boyutu/birim katsayısını düzeltmek için. */
export async function updateVariantPackaging(
  variantId: string,
  input: UpdateVariantPackagingInput,
) {
  if (!Number.isFinite(input.unitFactor) || input.unitFactor <= 0) {
    throw new Error("Birim katsayısı 0'dan büyük olmalı");
  }
  const packagingType = await assertValidPackagingType(input.packagingType);
  return prisma.productVariant.update({
    where: { id: variantId },
    data: {
      packagingType,
      packSize: input.packSize?.trim() || null,
      unitFactor: input.unitFactor,
    },
  });
}

/**
 * Yanlışlıkla eklenen bir cinsi kaldırır. Sipariş/lot geçmişi olabileceği
 * için gerçek silme değil, pasife alma: storefront ve panel listelerinde
 * artık görünmez (isActive filtresi), geçmiş veriler bozulmaz.
 */
export async function deactivateVariant(variantId: string) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { productId: true },
  });
  if (!variant) throw new Error("Cins bulunamadı");

  const activeCount = await prisma.productVariant.count({
    where: { productId: variant.productId, isActive: true },
  });
  if (activeCount <= 1) {
    throw new Error("Bir ürünün en az bir aktif cinsi olmalı");
  }

  return prisma.productVariant.update({
    where: { id: variantId },
    data: { isActive: false },
  });
}

export type ProductWithVariants = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

export function defaultVariant(product: ProductWithVariants) {
  return product.variants[0] ?? null;
}
