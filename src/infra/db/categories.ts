import { prisma } from "@/infra/db/client";
import { slugifyTr } from "@/domain/catalog/slug";

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

export async function listCategoryTreeAdmin() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      children: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] },
      _count: { select: { primaryProducts: true, productLinks: true } },
    },
  });
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
