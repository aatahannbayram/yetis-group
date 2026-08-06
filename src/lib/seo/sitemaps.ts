import { absoluteUrl, getSiteUrl } from "@/lib/site";
import { prisma } from "@/infra/db/client";

function xmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function urlSetXml(
  entries: { loc: string; lastmod?: Date | string | null; changefreq?: string; priority?: number }[],
) {
  const body = entries
    .map((e) => {
      const last =
        e.lastmod instanceof Date
          ? e.lastmod.toISOString()
          : e.lastmod
            ? new Date(e.lastmod).toISOString()
            : undefined;
      return `<url><loc>${xmlEscape(e.loc)}</loc>${last ? `<lastmod>${last}</lastmod>` : ""}${
        e.changefreq ? `<changefreq>${e.changefreq}</changefreq>` : ""
      }${e.priority != null ? `<priority>${e.priority}</priority>` : ""}</url>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

export function sitemapIndexXml(paths: string[]) {
  const base = getSiteUrl();
  const body = paths
    .map((p) => `<sitemap><loc>${xmlEscape(`${base}${p}`)}</loc></sitemap>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`;
}

export async function buildPagesSitemap() {
  const now = new Date();
  return urlSetXml([
    { loc: absoluteUrl("/"), lastmod: now, changefreq: "weekly", priority: 1 },
    { loc: absoluteUrl("/urunler"), lastmod: now, changefreq: "daily", priority: 0.9 },
    { loc: absoluteUrl("/haberler"), lastmod: now, changefreq: "daily", priority: 0.8 },
    { loc: absoluteUrl("/tarifler"), lastmod: now, changefreq: "weekly", priority: 0.7 },
    { loc: absoluteUrl("/auth"), lastmod: now, changefreq: "monthly", priority: 0.4 },
    { loc: absoluteUrl("/yasal/kullanim-kosullari"), lastmod: now, changefreq: "yearly", priority: 0.2 },
    { loc: absoluteUrl("/yasal/cerez-politikasi"), lastmod: now, changefreq: "yearly", priority: 0.2 },
    { loc: absoluteUrl("/yasal/kvkk-aydinlatma"), lastmod: now, changefreq: "yearly", priority: 0.2 },
  ]);
}

export async function buildProductsSitemap() {
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
  return urlSetXml(
    products.map((p) => ({
      loc: absoluteUrl(`/urunler/${p.slug}`),
      lastmod: p.updatedAt,
      changefreq: "weekly",
      priority: 0.8,
    })),
  );
}

export async function buildCategoriesSitemap() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true },
  });
  return urlSetXml(
    categories.map((c) => ({
      loc: absoluteUrl(`/urunler?kategori=${encodeURIComponent(c.slug)}`),
      lastmod: c.updatedAt,
      changefreq: "weekly",
      priority: 0.6,
    })),
  );
}

export async function buildPostsSitemap() {
  const posts = await prisma.contentPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true, publishedAt: true },
  });
  return urlSetXml(
    posts.map((p) => ({
      loc: absoluteUrl(`/haberler/${p.slug}`),
      lastmod: p.updatedAt ?? p.publishedAt,
      changefreq: "monthly",
      priority: 0.7,
    })),
  );
}

export async function buildRecipesSitemap() {
  const recipes = await prisma.recipe.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true, publishedAt: true },
  });
  return urlSetXml(
    recipes.map((r) => ({
      loc: absoluteUrl(`/tarifler/${r.slug}`),
      lastmod: r.updatedAt ?? r.publishedAt,
      changefreq: "monthly",
      priority: 0.65,
    })),
  );
}
