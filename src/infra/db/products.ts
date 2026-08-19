import { prisma } from "@/infra/db/client";
import { slugifyTr } from "@/domain/catalog/slug";
import type { PackagingType } from "@/generated/prisma";

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
  packagingType?: PackagingType;
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

  return prisma.product.create({
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
          packagingType: input.packagingType ?? "KOLI",
          packSize: input.packSize?.trim() || null,
          unitFactor: input.unitFactor,
          moq: input.moq && input.moq > 0 ? Math.round(input.moq) : 1,
          pricePerUnitKurus: Math.round(input.pricePerUnitKurus),
          vatRateBasisPoints: input.vatRateBasisPoints ?? 100,
        },
      },
    },
    include: { variants: true },
  });
}

export type CreateVariantInput = {
  productId: string;
  sku?: string;
  packagingType?: PackagingType;
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

  const variant = await prisma.productVariant.create({
    data: {
      productId: product.id,
      sku,
      packagingType: input.packagingType ?? "KOLI",
      packSize: input.packSize?.trim() || null,
      unitFactor: input.unitFactor,
      pricePerUnitKurus: priceKurus,
      vatRateBasisPoints: input.vatRateBasisPoints ?? 100,
      moq: input.moq && input.moq > 0 ? Math.round(input.moq) : 1,
      sortOrder: nextOrder,
    },
  });

  if (input.seedPriceLists !== false) {
    const lists = await prisma.priceList.findMany({ select: { id: true } });
    if (lists.length > 0) {
      await prisma.priceListItem.createMany({
        data: lists.map((list) => ({
          priceListId: list.id,
          variantId: variant.id,
          priceKurus,
        })),
        skipDuplicates: true,
      });
    }
  }

  return variant;
}

export type UpdateVariantPackagingInput = {
  packagingType: PackagingType;
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
  return prisma.productVariant.update({
    where: { id: variantId },
    data: {
      packagingType: input.packagingType,
      packSize: input.packSize?.trim() || null,
      unitFactor: input.unitFactor,
    },
  });
}

export type ProductWithVariants = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

export function defaultVariant(product: ProductWithVariants) {
  return product.variants[0] ?? null;
}
