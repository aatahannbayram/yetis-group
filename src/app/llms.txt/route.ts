import { SITE, getSiteUrl, absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const base = getSiteUrl();
  const body = `# Yetiş Grup: LLMs / AI assistants

> ${SITE.description}

Site: ${base}
Contact: ${SITE.email}
Phone: ${SITE.phoneDisplay}

## Primary pages
- Home: ${absoluteUrl("/")}
- Product catalog: ${absoluteUrl("/urunler")}
- News / guides: ${absoluteUrl("/haberler")}
- Recipes: ${absoluteUrl("/tarifler")}
- Dealer login: ${absoluteUrl("/auth")}
- About: ${absoluteUrl("/hakkimizda")}
- Contact: ${absoluteUrl("/iletisim")}
- Cookie policy: ${absoluteUrl("/yasal/cerez-politikasi")}

## Positioning
Yetiş Grup is a B2B solution partner for regional and rural food products in Türkiye
(market, delicatessen, HORECA, wholesale). Not a consumer marketplace.

## Sitemaps
- ${absoluteUrl("/sitemap.xml")}
- ${absoluteUrl("/sitemaps/products.xml")}
- ${absoluteUrl("/sitemaps/haberler.xml")}
- ${absoluteUrl("/sitemaps/tarifler.xml")}

## Optional
- RSS: ${absoluteUrl("/haberler/rss.xml")}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
