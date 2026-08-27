import { prisma } from "@/infra/db/client";
import { slugifyTr } from "@/domain/catalog/slug";
import { unstable_cache } from "next/cache";
import { STORE_CATALOG_TAG } from "@/lib/cache/store-catalog";

export async function listCategories() {
  return prisma.category.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      children: {
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
      _count: { select: { primaryProducts: true, productLinks: true } },
    },
  });
}

/** Store katalog chip'leri: yalnızca kök kategoriler, cache'li. */
export async function listStoreRootCategories() {
  return unstable_cache(
    () =>
      prisma.category.findMany({
        where: { active: true, parentId: null },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { slug: true, name: true },
      }),
    ["store-root-categories"],
    { revalidate: 300, tags: [STORE_CATALOG_TAG] },
  )();
}

export async function listCategoryTreeAdmin() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      children: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] },
      _count: { select: { primaryProducts: true, productLinks: true } },
    },
  });
}

/** Kategori paneli: bu kategoriye birincil veya ikincil bağlı tüm ürünler. */
export async function getCategoryProducts(categoryId: string) {
  const [primary, linked] = await Promise.all([
    prisma.product.findMany({
      where: { primaryCategoryId: categoryId },
      select: { id: true, name: true, slug: true, active: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { categories: { some: { categoryId } }, primaryCategoryId: { not: categoryId } },
      select: { id: true, name: true, slug: true, active: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return [
    ...primary.map((p) => ({ ...p, isPrimary: true as const })),
    ...linked.map((p) => ({ ...p, isPrimary: false as const })),
  ];
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: { where: { active: true }, orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function createCategory(input: {
  name: string;
  parentId?: string | null;
  sortOrder?: number;
}) {
  const base = slugifyTr(input.name);
  let slug = base;
  let n = 1;
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }
  return prisma.category.create({
    data: {
      name: input.name.trim(),
      slug,
      parentId: input.parentId || null,
      sortOrder: input.sortOrder ?? 0,
    },
  });
}

export async function updateCategory(
  id: string,
  input: { name?: string; active?: boolean; sortOrder?: number; parentId?: string | null },
) {
  return prisma.category.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.parentId !== undefined ? { parentId: input.parentId || null } : {}),
    },
  });
}

/** Sürükle-bırak: kategoriyi taşı ve yeni üst kategori altındaki sırayı uygula. */
export async function moveCategory(input: {
  id: string;
  parentId: string | null;
  orderedSiblingIds: string[];
}) {
  if (input.parentId) {
    let cursor: string | null = input.parentId;
    while (cursor) {
      if (cursor === input.id) {
        throw new Error("Bir kategori kendi alt kategorisinin altına taşınamaz");
      }
      const parent: { parentId: string | null } | null = await prisma.category.findUnique({
        where: { id: cursor },
        select: { parentId: true },
      });
      cursor = parent?.parentId ?? null;
    }
  }

  return prisma.$transaction([
    prisma.category.update({ where: { id: input.id }, data: { parentId: input.parentId } }),
    ...input.orderedSiblingIds.map((sid, index) =>
      prisma.category.update({ where: { id: sid }, data: { sortOrder: index } }),
    ),
  ]);
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUniqueOrThrow({
    where: { id },
    include: {
      children: { select: { id: true } },
      _count: { select: { primaryProducts: true, productLinks: true } },
    },
  });

  if (category.children.length > 0) {
    throw new Error("Bu kategorinin alt kategorileri var. Önce onları silin veya taşıyın.");
  }
  if (category._count.primaryProducts > 0 || category._count.productLinks > 0) {
    throw new Error("Bu kategoriye bağlı ürünler var. Önce onları başka bir kategoriye taşıyın.");
  }

  await prisma.category.delete({ where: { id } });
}
