import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/panel/",
          "/bayi/",
          "/api/",
          "/sepet",
          "/sepet/",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/urunler", "/haberler", "/tarifler", "/hakkimizda", "/iletisim", "/llms.txt"],
        disallow: ["/panel/", "/bayi/", "/api/", "/sepet"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
