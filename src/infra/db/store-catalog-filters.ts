import { unstable_cache } from "next/cache";
import { prisma } from "@/infra/db/client";
import {
  buildCatalogFilterGroups,
  type CatalogFilterGroup,
  type CategoryProductCount,
} from "@/domain/catalog/filter-groups";
import { STORE_CATALOG_TAG } from "@/lib/cache/store-catalog";

async function queryCategoryProductCounts(): Promise<CategoryProductCount[]> {
  const grouped = await prisma.product.groupBy({
    by: ["primaryCategoryId"],
    where: { active: true },
    _count: { id: true },
  });

  if (grouped.length === 0) return [];

  const categories = await prisma.category.findMany({
    where: {
      id: { in: grouped.map((g) => g.primaryCategoryId) },
      active: true,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      parent: { select: { slug: true } },
    },
  });

  const countById = new Map(grouped.map((g) => [g.primaryCategoryId, g._count.id]));

  const rows: CategoryProductCount[] = categories
    .map((cat) => ({
      slug: cat.slug,
      name: cat.name,
      parentSlug: cat.parent?.slug ?? null,
      count: countById.get(cat.id) ?? 0,
    }))
    .filter((row) => row.count > 0);

  const existing = new Set(rows.map((r) => r.slug));
  const missingParentSlugs = [
    ...new Set(rows.map((r) => r.parentSlug).filter((s): s is string => Boolean(s))),
  ].filter((slug) => !existing.has(slug));

  if (missingParentSlugs.length > 0) {
    const parents = await prisma.category.findMany({
      where: { slug: { in: missingParentSlugs }, active: true },
      select: {
        slug: true,
        name: true,
        parent: { select: { slug: true } },
      },
    });
    for (const parent of parents) {
      rows.push({
        slug: parent.slug,
        name: parent.name,
        parentSlug: parent.parent?.slug ?? null,
        count: 0,
      });
      existing.add(parent.slug);
    }
  }

  return rows;
}

async function queryStoreCatalogFilters(): Promise<{
  groups: CatalogFilterGroup[];
  total: number;
}> {
  const rows = await queryCategoryProductCounts();
  const groups = buildCatalogFilterGroups(rows);
  const total = rows.filter((r) => r.count > 0).reduce((sum, r) => sum + r.count, 0);
  return { groups, total };
}

export async function listStoreCatalogFilters() {
  const cached = unstable_cache(
    queryStoreCatalogFilters,
    ["store-catalog-filters"],
    { revalidate: 120, tags: [STORE_CATALOG_TAG] },
  );
  return cached();
}
