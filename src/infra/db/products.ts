import { prisma } from "@/infra/db/client";

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
      media: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
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

export type ProductWithVariants = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

export function defaultVariant(product: ProductWithVariants) {
  return product.variants[0] ?? null;
}
