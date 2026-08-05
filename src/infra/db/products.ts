import { prisma } from "@/infra/db/client";

export async function getProducts() {
  return prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" } });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({ where: { slug } });
}
