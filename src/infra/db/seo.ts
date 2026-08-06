import { prisma } from "@/infra/db/client";
import {
  categoryMetaIssues,
  postMetaIssues,
  productMetaIssues,
  recipeMetaIssues,
  type MetaIssue,
} from "@/domain/seo/meta-report";

export async function listActiveRedirectMap(): Promise<
  Record<string, { to: string; code: number }>
> {
  const rows = await prisma.seoRedirect.findMany({
    where: { active: true },
    select: { fromPath: true, toPath: true, statusCode: true },
  });
  const map: Record<string, { to: string; code: number }> = {};
  for (const row of rows) {
    map[row.fromPath] = { to: row.toPath, code: row.statusCode };
  }
  return map;
}

export async function listRedirectsAdmin() {
  return prisma.seoRedirect.findMany({ orderBy: { updatedAt: "desc" } });
}

export async function upsertRedirect(input: {
  id?: string;
  fromPath: string;
  toPath: string;
  statusCode?: number;
  note?: string;
  active?: boolean;
}) {
  const fromPath = normalizePath(input.fromPath);
  const toPath = input.toPath.startsWith("http")
    ? input.toPath.trim()
    : normalizePath(input.toPath);

  if (input.id) {
    return prisma.seoRedirect.update({
      where: { id: input.id },
      data: {
        fromPath,
        toPath,
        statusCode: input.statusCode ?? 301,
        note: input.note ?? "",
        active: input.active ?? true,
      },
    });
  }

  return prisma.seoRedirect.create({
    data: {
      fromPath,
      toPath,
      statusCode: input.statusCode ?? 301,
      note: input.note ?? "",
      active: input.active ?? true,
    },
  });
}

export async function deleteRedirect(id: string) {
  return prisma.seoRedirect.delete({ where: { id } });
}

function normalizePath(path: string) {
  const trimmed = path.trim();
  if (!trimmed) return "/";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export async function buildMissingMetaReport(): Promise<MetaIssue[]> {
  const [products, categories, posts, recipes] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      select: { id: true, slug: true, name: true, description: true, imageUrl: true },
    }),
    prisma.category.findMany({
      where: { active: true },
      select: { id: true, slug: true, name: true, metaTitle: true, metaDescription: true },
    }),
    prisma.contentPost.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, slug: true, title: true, excerpt: true, coverUrl: true },
    }),
    prisma.recipe.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, slug: true, title: true, excerpt: true, coverUrl: true },
    }),
  ]);

  const issues: MetaIssue[] = [];
  for (const p of products) {
    const issue = productMetaIssues(p);
    if (issue) issues.push(issue);
  }
  for (const c of categories) {
    const issue = categoryMetaIssues(c);
    if (issue) issues.push(issue);
  }
  for (const p of posts) {
    const issue = postMetaIssues(p);
    if (issue) issues.push(issue);
  }
  for (const r of recipes) {
    const issue = recipeMetaIssues(r);
    if (issue) issues.push(issue);
  }
  return issues;
}
