import { listPublishedPosts } from "@/infra/db/content";

export async function GET() {
  const posts = await listPublishedPosts();
  const base = process.env.BETTER_AUTH_URL ?? "https://yetisgrup.com";

  const items = posts
    .map(
      (p) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${base}/haberler/${p.slug}</link>
      <guid>${base}/haberler/${p.slug}</guid>
      <description><![CDATA[${p.excerpt}]]></description>
      <pubDate>${(p.publishedAt ?? p.createdAt).toUTCString()}</pubDate>
    </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Yetiş Grup Haberler</title>
    <link>${base}/haberler</link>
    <description>Yöresel ve kırsal gıda, B2B tedarik ve HORECA yazıları</description>
    <language>tr</language>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
