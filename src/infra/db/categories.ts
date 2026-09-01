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
      select: { id: true, name: true, slug: true, active: true, imageUrl: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { categories: { some: { categoryId } }, primaryCategoryId: { not: categoryId } },
      select: { id: true, name: true, slug: true, active: true, imageUrl: true },
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
  input: {
    name?: string;
    active?: boolean;
    sortOrder?: number;
    parentId?: string | null;
    slug?: string;
    metaTitle?: string | null;
    metaDescription?: string | null;
  },
) {
  let slug: string | undefined;
  if (input.slug !== undefined) {
    const base = slugifyTr(input.slug) || slugifyTr(input.name ?? "");
    if (!base) throw new Error("Geçerli bir URL gerekli");
    const existing = await prisma.category.findUnique({ where: { slug: base }, select: { id: true } });
    if (existing && existing.id !== id) throw new Error(`«/${base}» başka bir kategoride kullanılıyor`);
    slug = base;
  }

  return prisma.category.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.parentId !== undefined ? { parentId: input.parentId || null } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(input.metaTitle !== undefined ? { metaTitle: input.metaTitle?.trim() || null } : {}),
      ...(input.metaDescription !== undefined
        ? { metaDescription: input.metaDescription?.trim() || null }
        : {}),
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

export async function deleteCategory(id: string, opts?: { reassignToId?: string }) {
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

  const hasProducts = category._count.primaryProducts > 0 || category._count.productLinks > 0;
  if (hasProducts && !opts?.reassignToId) {
    throw new Error("Bu kategoriye bağlı ürünler var. Önce onları başka bir kategoriye taşıyın.");
  }

  if (hasProducts && opts?.reassignToId) {
    const targetId = opts.reassignToId;
    if (targetId === id) {
      throw new Error("Hedef kategori, silinecek kategoriyle aynı olamaz.");
    }
    await prisma.$transaction(async (tx) => {
      await tx.product.updateMany({
        where: { primaryCategoryId: id },
        data: { primaryCategoryId: targetId },
      });
      // Move secondary links; drop any that would collide with an existing link to the target.
      const links = await tx.productCategory.findMany({ where: { categoryId: id } });
      for (const link of links) {
        const duplicate = await tx.productCategory.findUnique({
          where: { productId_categoryId: { productId: link.productId, categoryId: targetId } },
        });
        if (duplicate) {
          await tx.productCategory.delete({ where: { id: link.id } });
        } else {
          await tx.productCategory.update({ where: { id: link.id }, data: { categoryId: targetId } });
        }
      }
      await tx.category.delete({ where: { id } });
    });
    return;
  }

  await prisma.category.delete({ where: { id } });
}
