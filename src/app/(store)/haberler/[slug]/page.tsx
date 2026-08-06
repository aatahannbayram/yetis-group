import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/infra/db/content";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { Canvas, Slab } from "@/components/store/slab";
import { PillCta } from "@/components/store/pill-cta";
import { renderMarkdown } from "@/lib/content/markdown";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "PUBLISHED") return { title: "Yazı" };
  return {
    title: `${post.title} · Yetiş Grup`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverUrl ? [post.coverUrl] : [],
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "PUBLISHED") notFound();

  const faqMatches = [...post.body.matchAll(/### (.+)\n([\s\S]*?)(?=\n### |\n## |$)/g)].slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: post.title,
        description: post.excerpt,
        image: post.coverUrl ? [post.coverUrl] : undefined,
        datePublished: post.publishedAt?.toISOString(),
        author: { "@type": "Organization", name: post.authorName },
        publisher: { "@type": "Organization", name: "Yetiş Grup" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Ana sayfa", item: "/" },
          { "@type": "ListItem", position: 2, name: "Haberler", item: "/haberler" },
          { "@type": "ListItem", position: 3, name: post.title },
        ],
      },
      faqMatches.length
        ? {
            "@type": "FAQPage",
            mainEntity: faqMatches.map((m) => ({
              "@type": "Question",
              name: m[1]?.trim(),
              acceptedAnswer: { "@type": "Answer", text: m[2]?.trim().slice(0, 500) },
            })),
          }
        : null,
    ].filter(Boolean),
  };

  return (
    <Canvas>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Slab>
        <SiteHeader />
        <article className="mkt-pad">
          <nav className="mkt-label flex flex-wrap gap-2 text-mkt-ink-muted">
            <Link href="/haberler" className="hover:text-mkt-ink">
              Haberler
            </Link>
            <span>/</span>
            <span className="text-mkt-ink">{post.category}</span>
          </nav>

          <p className="mkt-label mt-6 text-mkt-green-text">{post.category}</p>
          <h1 className="mkt-h2 mt-3 max-w-3xl text-balance text-mkt-ink">{post.title}</h1>
          <p className="mkt-body mt-4 max-w-2xl">{post.excerpt}</p>
          <p className="mkt-label mt-3 text-mkt-ink-muted/70">
            {post.authorName} · {post.readingMins} dk ·{" "}
            {post.publishedAt?.toLocaleDateString("tr-TR")}
          </p>

          {post.coverUrl ? (
            <div className="relative mt-8 aspect-[21/9] overflow-hidden rounded-[1.25rem]">
              <Image src={post.coverUrl} alt="" fill className="object-cover" sizes="100vw" priority />
            </div>
          ) : null}

          <div className="mx-auto mt-10 max-w-3xl">{renderMarkdown(post.body)}</div>

          {post.products.length > 0 ? (
            <div className="mx-auto mt-14 max-w-3xl border-t border-[color:var(--mkt-border)] pt-10">
              <p className="mkt-label text-mkt-green-text">İlgili ürünler</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {post.products.map(({ product }) => (
                  <li key={product.id}>
                    <Link
                      href={`/urunler/${product.slug}`}
                      className="mkt-pill mkt-label inline-flex bg-mkt-card-muted px-4 py-2 text-mkt-ink hover:bg-mkt-accent hover:text-mkt-accent-ink"
                    >
                      {product.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mx-auto mt-10 max-w-3xl">
            <PillCta href="/auth">Bayilik için başvur</PillCta>
          </div>
        </article>
      </Slab>
      <SiteFooter />
    </Canvas>
  );
}
