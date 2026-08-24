import { prisma } from "@/infra/db/client";
import { packLabel } from "@/lib/format/packaging";
import type { ProductListItem } from "@/components/store/product-card";

const catalogSelect = {
  id: true,
  name: true,
  slug: true,
  imageUrl: true,
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
    },
  },
} as const;

type CatalogRow = {
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

function categoryFilter(categorySlug: string) {
  return {
    OR: [
      { primaryCategory: { slug: categorySlug } },
      { categories: { some: { category: { slug: categorySlug } } } },
    ],
  };
}

function mapCatalogRow(product: CatalogRow): ProductListItem | null {
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

/** Lightweight catalog rows for the public store (no pricing, stock, media, or attributes). */
export async function getStoreCatalogProducts(categorySlug?: string) {
  const rows = await prisma.product.findMany({
    where: {
      active: true,
      ...(categorySlug ? categoryFilter(categorySlug) : {}),
    },
    orderBy: { name: "asc" },
    select: catalogSelect,
  });

  return rows.flatMap((row) => {
    const item = mapCatalogRow(row);
    return item ? [item] : [];
  });
}

/** Related products for PDP without loading the full catalog. */
export async function getRelatedStoreProducts(
  categorySlug: string,
  excludeProductId: string,
  limit = 3,
) {
  const rows = await prisma.product.findMany({
    where: {
      active: true,
      id: { not: excludeProductId },
      ...categoryFilter(categorySlug),
    },
    orderBy: { name: "asc" },
    take: limit,
    select: catalogSelect,
  });

  return rows.flatMap((row) => {
    const item = mapCatalogRow(row);
    return item ? [item] : [];
  });
}
