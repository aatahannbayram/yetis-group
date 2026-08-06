import { prisma } from "@/infra/db/client";

export async function listPublishedPosts() {
  return prisma.contentPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: {
      products: { include: { product: true } },
      recipes: { include: { recipe: true } },
    },
  });
}

export async function listAllPostsAdmin() {
  return prisma.contentPost.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.contentPost.findUnique({
    where: { slug },
    include: {
      products: { include: { product: { include: { variants: { where: { isActive: true }, take: 1 } } } } },
      recipes: { include: { recipe: true } },
    },
  });
}

export async function listPublishedRecipes() {
  return prisma.recipe.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { products: { include: { product: true } } },
  });
}

export async function listAllRecipesAdmin() {
  return prisma.recipe.findMany({ orderBy: { updatedAt: "desc" } });
}

export async function getRecipeBySlug(slug: string) {
  return prisma.recipe.findUnique({
    where: { slug },
    include: {
      products: { include: { product: { include: { variants: { where: { isActive: true }, take: 1 } } } } },
      posts: { include: { post: true } },
    },
  });
}

export async function listRecipesForProduct(productId: string) {
  return prisma.recipe.findMany({
    where: {
      status: "PUBLISHED",
      products: { some: { productId } },
    },
    orderBy: { publishedAt: "desc" },
  });
}

export async function setPostStatus(id: string, status: "DRAFT" | "PUBLISHED") {
  return prisma.contentPost.update({
    where: { id },
    data: {
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });
}

export async function setRecipeStatus(id: string, status: "DRAFT" | "PUBLISHED") {
  return prisma.recipe.update({
    where: { id },
    data: {
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });
}

export type RecipeIngredient = {
  name: string;
  amount: string;
  unit: string;
  productSlug?: string;
};
