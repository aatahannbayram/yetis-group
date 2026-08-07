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

function toIso(value?: Date | string | null) {
  if (!value) return undefined;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export type SitemapEntry = {
  loc: string;
  lastmod?: Date | string | null;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
};

export function urlSetXml(entries: SitemapEntry[]) {
  const body = entries
    .map((e) => {
      const last = toIso(e.lastmod);
      return `<url><loc>${xmlEscape(e.loc)}</loc>${last ? `<lastmod>${last}</lastmod>` : ""}${
        e.changefreq ? `<changefreq>${e.changefreq}</changefreq>` : ""
      }${e.priority != null ? `<priority>${e.priority.toFixed(1)}</priority>` : ""}</url>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

export function sitemapIndexXml(
  entries: { path: string; lastmod?: Date | string | null }[],
) {
  const base = getSiteUrl();
  const body = entries
    .map((e) => {
      const last = toIso(e.lastmod);
      return `<sitemap><loc>${xmlEscape(`${base}${e.path}`)}</loc>${
        last ? `<lastmod>${last}</lastmod>` : ""
      }</sitemap>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`;
}

/** Static marketing / legal pages. */
export async function buildPagesSitemap() {
  const now = new Date();
  return urlSetXml([
    { loc: absoluteUrl("/"), lastmod: now, changefreq: "weekly", priority: 1 },
    { loc: absoluteUrl("/urunler"), lastmod: now, changefreq: "daily", priority: 0.9 },
    { loc: absoluteUrl("/haberler"), lastmod: now, changefreq: "daily", priority: 0.8 },
    { loc: absoluteUrl("/tarifler"), lastmod: now, changefreq: "weekly", priority: 0.75 },
    { loc: absoluteUrl("/hakkimizda"), lastmod: now, changefreq: "monthly", priority: 0.7 },
    { loc: absoluteUrl("/iletisim"), lastmod: now, changefreq: "monthly", priority: 0.7 },
    { loc: absoluteUrl("/auth"), lastmod: now, changefreq: "monthly", priority: 0.35 },
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
      priority: 0.85,
    })),
  );
}

export async function buildCategoriesSitemap() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true },
    orderBy: { name: "asc" },
  });
  return urlSetXml(
    categories.map((c) => ({
      loc: absoluteUrl(`/urunler?kategori=${encodeURIComponent(c.slug)}`),
      lastmod: c.updatedAt,
      changefreq: "weekly",
      priority: 0.65,
    })),
  );
}

export async function buildPostsSitemap() {
  const posts = await prisma.contentPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
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
    orderBy: { publishedAt: "desc" },
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

/** Latest content touch for sitemap index lastmod. */
export async function getSitemapIndexEntries() {
  const [product, category, post, recipe] = await Promise.all([
    prisma.product.findFirst({
      where: { active: true },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
    prisma.category.findFirst({
      where: { active: true },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
    prisma.contentPost.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
    prisma.recipe.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
  ]);

  const now = new Date();
  return [
    { path: "/sitemaps/pages.xml", lastmod: now },
    { path: "/sitemaps/products.xml", lastmod: product?.updatedAt ?? now },
    { path: "/sitemaps/categories.xml", lastmod: category?.updatedAt ?? now },
    { path: "/sitemaps/haberler.xml", lastmod: post?.updatedAt ?? now },
    { path: "/sitemaps/tarifler.xml", lastmod: recipe?.updatedAt ?? now },
  ];
}
