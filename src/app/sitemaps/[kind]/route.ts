import {
  buildCategoriesSitemap,
  buildPagesSitemap,
  buildPostsSitemap,
  buildProductsSitemap,
  buildRecipesSitemap,
} from "@/lib/seo/sitemaps";

export const dynamic = "force-dynamic";

const builders: Record<string, () => Promise<string>> = {
  "pages.xml": buildPagesSitemap,
  "products.xml": buildProductsSitemap,
  "categories.xml": buildCategoriesSitemap,
  "haberler.xml": buildPostsSitemap,
  "tarifler.xml": buildRecipesSitemap,
};

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ kind: string }> },
) {
  const { kind } = await ctx.params;
  const build = builders[kind];
  if (!build) {
    return new Response("Not found", { status: 404 });
  }
  const xml = await build();
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
