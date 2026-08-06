import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, Clock3 } from "lucide-react";
import { getPostBySlug, listPublishedPosts } from "@/infra/db/content";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { Canvas, Slab } from "@/components/store/slab";
import { PillCta } from "@/components/store/pill-cta";
import { Reveal } from "@/components/store/reveal";
import { renderMarkdown } from "@/lib/content/markdown";
import {
  JsonLdScript,
  breadcrumbJsonLd,
  faqPageJsonLd,
  organizationJsonLd,
} from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, SITE } from "@/lib/site";
import { formatDate } from "@/lib/format/date";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "PUBLISHED") {
    return { title: "Yazı bulunamadı" };
  }
  return buildPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/haberler/${post.slug}`,
    image: post.coverUrl,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "PUBLISHED") notFound();

  const siblings = (await listPublishedPosts())
    .filter((p) => p.id !== post.id)
    .slice(0, 3);

  const faqMatches = [...post.body.matchAll(/### (.+)\n([\s\S]*?)(?=\n### |\n## |$)/g)].slice(
    0,
    6,
  );

  const jsonLdBlocks: object[] = [
    organizationJsonLd(),
    breadcrumbJsonLd([
      { name: "Ana sayfa", path: "/" },
      { name: "Haberler", path: "/haberler" },
      { name: post.title, path: `/haberler/${post.slug}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.excerpt,
      image: post.coverUrl ? [absoluteUrl(post.coverUrl)] : undefined,
      datePublished: post.publishedAt?.toISOString(),
      dateModified: post.updatedAt?.toISOString(),
      author: { "@type": "Organization", name: post.authorName || SITE.name },
      publisher: {
        "@type": "Organization",
        name: SITE.name,
        logo: absoluteUrl("/brand/logo-light.png"),
      },
      mainEntityOfPage: absoluteUrl(`/haberler/${post.slug}`),
    },
  ];
  if (faqMatches.length > 0) {
    jsonLdBlocks.push(
      faqPageJsonLd(
        faqMatches.map((m) => ({
          question: m[1]?.trim() ?? "",
          answer: m[2]?.trim().slice(0, 500) ?? "",
        })),
      ),
    );
  }

  return (
    <Canvas>
      <JsonLdScript data={jsonLdBlocks} />

      {/* Hero */}
      <Slab className="relative min-h-[44vh] overflow-hidden !p-0 md:min-h-[52vh]">
        {post.coverUrl ? (
          <Image
            src={post.coverUrl}
            alt=""
            fill
            priority
            quality={75}
            className="scale-105 object-cover object-center"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-[#0f1f17]" />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/50 to-black/75"
        />
        <div className="absolute inset-x-0 top-0 z-20">
          <SiteHeader variant="overlay" />
        </div>
        <div className="relative z-10 flex min-h-[44vh] flex-col justify-end px-5 pb-10 pt-24 md:min-h-[52vh] md:px-10 md:pb-14 lg:px-14">
          <Reveal>
            <Link
              href="/haberler"
              className="mkt-label inline-flex items-center gap-2 text-white/75 hover:text-white"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              Haberler
            </Link>
            <span className="mkt-pill mkt-label mt-5 inline-flex bg-white/15 px-3.5 py-1.5 text-white backdrop-blur-md">
              {post.category}
            </span>
            <h1 className="mkt-display mt-4 max-w-3xl text-balance text-white md:text-[clamp(2.25rem,4.5vw,3.5rem)]">
              {post.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-white/75">
              <span>{post.authorName || SITE.name}</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5" aria-hidden />
                {post.readingMins} dk
              </span>
              {post.publishedAt ? (
                <time dateTime={post.publishedAt.toISOString()}>
                  {formatDate(post.publishedAt)}
                </time>
              ) : null}
            </div>
          </Reveal>
        </div>
      </Slab>

      {/* Lead + body */}
      <Slab className="mkt-pad">
        <Reveal>
          <p className="mx-auto max-w-2xl text-[1.125rem] leading-relaxed font-medium tracking-[-0.015em] text-mkt-ink md:text-[1.25rem]">
            {post.excerpt}
          </p>
        </Reveal>
        <Reveal delay={40}>
          <div className="mx-auto mt-10 max-w-2xl">{renderMarkdown(post.body)}</div>
        </Reveal>
      </Slab>

      {/* Related products */}
      {post.products.length > 0 ? (
        <Slab className="mkt-pad !bg-[var(--mkt-card-muted)]">
          <Reveal>
            <span className="mkt-pill mkt-label inline-flex bg-white px-3.5 py-1.5 text-mkt-ink-muted">
              Katalog
            </span>
            <h2 className="mkt-h2 mt-4 text-balance text-mkt-ink">İlgili ürünler</h2>
            <p className="mkt-body mt-2 max-w-lg">
              Bu yazıdaki konularla bağlantılı SKU’lar — listeden inceleyin.
            </p>
          </Reveal>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {post.products.map(({ product }, i) => (
              <Reveal key={product.id} delay={i * 50}>
                <li>
                  <Link
                    href={`/urunler/${product.slug}`}
                    className="group flex h-full items-center justify-between gap-3 rounded-[1.15rem] bg-white px-5 py-4 shadow-[0_1px_0_rgba(10,10,10,0.04)] transition-colors hover:bg-mkt-ink hover:text-white"
                  >
                    <span className="text-[15px] font-medium tracking-[-0.01em]">
                      {product.name}
                    </span>
                    <ArrowUpRight
                      className="size-4 shrink-0 opacity-40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                      aria-hidden
                    />
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>
        </Slab>
      ) : null}

      {/* More posts */}
      {siblings.length > 0 ? (
        <Slab className="mkt-pad">
          <Reveal>
            <span className="mkt-pill mkt-label inline-flex bg-mkt-card-muted px-3.5 py-1.5 text-mkt-ink-muted">
              Devam
            </span>
            <h2 className="mkt-h2 mt-4 text-balance text-mkt-ink">Başka yazılar</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {siblings.map((item, i) => (
              <Reveal key={item.id} delay={i * 50}>
                <Link
                  href={`/haberler/${item.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-mkt-card-muted"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {item.coverUrl ? (
                      <Image
                        src={item.coverUrl}
                        alt=""
                        fill
                        quality={65}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(min-width: 640px) 30vw, 90vw"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="mkt-label text-mkt-ink-muted">{item.category}</p>
                    <h3 className="mt-2 text-[1rem] leading-snug font-medium tracking-[-0.015em] text-mkt-ink">
                      {item.title}
                    </h3>
                    <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[13px] font-semibold text-mkt-green-text">
                      Oku
                      <ArrowUpRight className="size-3.5" aria-hidden />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Slab>
      ) : null}

      {/* CTA */}
      <Slab className="relative overflow-hidden !bg-[#0f1f17] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(48,163,105,0.2),transparent_50%)]"
        />
        <div className="mkt-pad relative grid items-center gap-8 py-10 md:py-14 lg:grid-cols-[1fr_auto] lg:py-16">
          <Reveal>
            <p className="mkt-label text-mkt-accent">Birlikte çalışalım</p>
            <h2 className="mkt-h2 mt-3 max-w-lg text-balance text-white">
              Bayilik veya numune için yazın.
            </h2>
            <p className="mt-3 max-w-md text-[15px] text-white/65">
              Talebiniz CRM’e düşer; satış ekibi dönüş yapar.
            </p>
          </Reveal>
          <Reveal delay={60}>
            <div className="flex w-full flex-col gap-2.5 sm:flex-row lg:w-auto">
              <PillCta href="/auth?tab=uye" className="w-full justify-center sm:w-auto">
                Bayi ol
              </PillCta>
              <Link
                href="/iletisim"
                className="mkt-pill mkt-label inline-flex h-[3.25rem] w-full items-center justify-center gap-2 border border-white/25 px-6 text-[15px] text-white hover:bg-white/10 sm:w-auto"
              >
                İletişim
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </div>
          </Reveal>
        </div>
      </Slab>

      <SiteFooter />
    </Canvas>
  );
}
