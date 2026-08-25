import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/infra/db/client";
import {
  PRODUCT_PAGE_SIZE,
  decodeProductCursor,
  paginateByCursor,
  type ProductListPage,
} from "@/domain/catalog/pagination";
import type { ProductListItem } from "@/components/store/product-card";
import type { ProductRow } from "@/components/admin/product-list-sheet";
import type { DealerOrderListProduct } from "@/infra/db/dealer-catalog";
import { mapListProduct, priceOverridesForDealer } from "@/infra/db/dealer-catalog";
import { getShippableStockByVariant, getStockSummaryByProduct } from "@/infra/db/inventory";
import { packLabel } from "@/lib/format/packaging";
import { zeroKg } from "@/domain/weight";
import { catalogSelect } from "@/infra/db/store-catalog";

export type ProductListQuery = {
  cursor?: string | null;
  limit?: number;
  q?: string;
  categorySlug?: string;
  categoryName?: string;
};

function resolveLimit(limit?: number) {
  const n = limit ?? PRODUCT_PAGE_SIZE;
  return Math.min(Math.max(1, n), 100);
}

function cursorWhere(cursor: ReturnType<typeof decodeProductCursor>): Prisma.ProductWhereInput {
  if (!cursor) return {};
  return {
    OR: [{ name: { gt: cursor.name } }, { AND: [{ name: cursor.name }, { id: { gt: cursor.id } }] }],
  };
}

function searchWhere(q?: string): Prisma.ProductWhereInput {
  const term = q?.trim();
  if (!term) return {};
  return {
    OR: [
      { name: { contains: term, mode: "insensitive" } },
      { primaryCategory: { name: { contains: term, mode: "insensitive" } } },
      { variants: { some: { sku: { contains: term, mode: "insensitive" } } } },
    ],
  };
}

function storeCategoryWhere(categorySlug?: string): Prisma.ProductWhereInput {
  if (!categorySlug) return {};
  return {
    OR: [
      { primaryCategory: { slug: categorySlug } },
      { primaryCategory: { parent: { slug: categorySlug } } },
      { categories: { some: { category: { slug: categorySlug } } } },
      { categories: { some: { category: { parent: { slug: categorySlug } } } } },
    ],
  };
}

function categoryNameWhere(categoryName?: string): Prisma.ProductWhereInput {
  if (!categoryName) return {};
  return { primaryCategory: { name: categoryName } };
}

function activeProductWhere(extra?: Prisma.ProductWhereInput): Prisma.ProductWhereInput {
  return {
    active: true,
    variants: { some: { isActive: true } },
    ...extra,
  };
}

function buildWhere(input: ProductListQuery, extra?: Prisma.ProductWhereInput): Prisma.ProductWhereInput {
  return activeProductWhere({
    AND: [
      cursorWhere(decodeProductCursor(input.cursor)),
      searchWhere(input.q),
      extra ?? {},
    ],
  });
}

type StoreCatalogRow = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  primaryCategory: { name: string; slug: string };
  variants: Array<{
    id: string;
    sku: string;
    packagingType: string;
    packSize: string | null;
    unitFactor: { toString(): string };
    moq: number | null;
    vatRateBasisPoints: number;
  }>;
};

function mapStoreRow(product: StoreCatalogRow): ProductListItem | null {
  const variant = product.variants[0];
  if (!variant) return null;
  return {
    id: product.id,
    variantId: variant.id,
    sku: variant.sku,
    slug: product.slug,
    name: product.name,
    category: product.primaryCategory.name,
    imageUrl: product.imageUrl,
    unitLabel: packLabel(variant.packSize, variant.packagingType),
    packagingType: variant.packagingType,
    packSize: variant.packSize,
    kgPerUnit: variant.unitFactor.toString(),
    moq: variant.moq ?? 1,
    vatRateBasisPoints: variant.vatRateBasisPoints,
    cins: product.variants.map((v) => ({
      id: v.id,
      packagingType: v.packagingType,
      packSize: v.packSize,
      unitFactor: v.unitFactor.toString(),
      packLabel: packLabel(v.packSize, v.packagingType),
    })),
  };
}

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
    orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }],
    select: { id: true, url: true, alt: true, isPrimary: true },
  },
} satisfies Prisma.ProductSelect;

const dealerOrderListSelect = {
  id: true,
  name: true,
  slug: true,
  imageUrl: true,
  requiresColdChain: true,
  primaryCategory: { select: { name: true, slug: true } },
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
} satisfies Prisma.ProductSelect;

export async function getStoreCatalogProductsPage(
  input: ProductListQuery = {},
): Promise<ProductListPage<ProductListItem>> {
  const limit = resolveLimit(input.limit);
  const where = buildWhere(input, storeCategoryWhere(input.categorySlug));

  const [rows, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      take: limit + 1,
      select: catalogSelect,
    }),
    prisma.product.count({ where }),
  ]);

  const { items, nextCursor } = paginateByCursor(
    rows.flatMap((row) => {
      const item = mapStoreRow(row);
      return item ? [item] : [];
    }),
    limit,
  );

  return { items, nextCursor, totalCount };
}

export async function getAdminProductsPage(
  input: ProductListQuery = {},
): Promise<ProductListPage<ProductRow>> {
  const limit = resolveLimit(input.limit);
  const where = buildWhere(input, categoryNameWhere(input.categoryName));

  const [rows, totalCount, stockByProduct] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      take: limit + 1,
      select: adminListSelect,
    }),
    prisma.product.count({ where }),
    getStockSummaryByProduct(),
  ]);

  const mapped = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    imageUrl: p.imageUrl,
    categoryName: p.primaryCategory.name,
    stockKg: (stockByProduct.get(p.id) ?? zeroKg).toNumber(),
    variants: p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      packSize: v.packSize,
      packagingType: v.packagingType,
      baseUnit: v.baseUnit,
      unitFactor: v.unitFactor.toString(),
      vatRateBasisPoints: v.vatRateBasisPoints,
      pricePerUnitKurus: v.pricePerUnitKurus,
    })),
    media: p.media.map((m) => ({ id: m.id, url: m.url, alt: m.alt, isPrimary: m.isPrimary })),
  }));

  const { items, nextCursor } = paginateByCursor(mapped, limit);
  return { items, nextCursor, totalCount };
}

export async function getDealerOrderProductsPage(
  dealerId: string,
  input: ProductListQuery = {},
): Promise<ProductListPage<DealerOrderListProduct>> {
  const limit = resolveLimit(input.limit);
  const where = buildWhere(input, categoryNameWhere(input.categoryName));

  const [rows, totalCount, overrides, stockByVariant] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      take: limit + 1,
      select: dealerOrderListSelect,
    }),
    prisma.product.count({ where }),
    priceOverridesForDealer(dealerId),
    getShippableStockByVariant(),
  ]);

  const mapped = rows.map((row) => mapListProduct(row, overrides, stockByVariant));
  const { items, nextCursor } = paginateByCursor(mapped, limit);
  return { items, nextCursor, totalCount };
}

export async function countActiveProducts() {
  return prisma.product.count({
    where: activeProductWhere(),
  });
}

export async function countActiveVariants() {
  return prisma.productVariant.count({
    where: { isActive: true, product: { active: true } },
  });
}
