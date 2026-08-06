import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { Canvas, Slab } from "@/components/store/slab";
import { getLegalDoc, legalDocs } from "@/content/legal";

export function generateStaticParams() {
  return legalDocs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getLegalDoc(slug);
  if (!doc) return { title: "Yasal" };
  return {
    title: `${doc.title} · Yetiş Grup`,
    description: doc.summary,
  };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getLegalDoc(slug);
  if (!doc) notFound();

  return (
    <Canvas>
      <Slab>
        <SiteHeader />
        <article className="px-6 py-12 md:px-10 md:py-16 lg:px-14">
          <p className="mkt-label text-mkt-green-text">Yasal</p>
          <h1 className="mkt-h2 mt-3 max-w-3xl text-balance text-mkt-ink">{doc.title}</h1>
          <p className="mkt-body mt-4 max-w-2xl">{doc.summary}</p>
          <p className="mkt-label mt-3 text-mkt-ink-muted/70">Son güncelleme: {doc.updatedAt}</p>

          <div className="mt-12 max-w-3xl space-y-10">
            {doc.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-[1.15rem] font-medium tracking-[-0.015em] text-mkt-ink">
                  {section.heading}
                </h2>
                {section.paragraphs.map((p) => (
                  <p key={p.slice(0, 40)} className="mkt-body mt-3">
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap gap-3 border-t border-[color:var(--mkt-border)] pt-8">
            {legalDocs.map((item) => (
              <Link
                key={item.slug}
                href={`/yasal/${item.slug}`}
                className={
                  item.slug === doc.slug
                    ? "mkt-pill mkt-label bg-mkt-accent px-4 py-2 text-mkt-accent-ink"
                    : "mkt-pill mkt-label bg-mkt-card-muted px-4 py-2 text-mkt-ink-muted hover:text-mkt-ink"
                }
              >
                {item.title}
              </Link>
            ))}
          </div>

          <p className="mkt-label mt-8 text-mkt-ink-muted/60">
            Bu metinler Platform için hazırlanmış bilgilendirme taslaklarıdır; özel durumunuz için
            hukuki danışmanlık alınmasını öneririz.
          </p>
        </article>
      </Slab>
      <SiteFooter />
    </Canvas>
  );
}
