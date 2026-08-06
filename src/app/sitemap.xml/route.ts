import { sitemapIndexXml } from "@/lib/seo/sitemaps";

export const dynamic = "force-dynamic";

export async function GET() {
  const xml = sitemapIndexXml([
    "/sitemaps/pages.xml",
    "/sitemaps/products.xml",
    "/sitemaps/categories.xml",
    "/sitemaps/haberler.xml",
    "/sitemaps/tarifler.xml",
  ]);
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
