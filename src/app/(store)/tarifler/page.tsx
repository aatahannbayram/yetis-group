import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { listPublishedRecipes } from "@/infra/db/content";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { Canvas, Slab } from "@/components/store/slab";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLdScript, breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/json-ld";

const difficultyLabel = { EASY: "Kolay", MEDIUM: "Orta", HARD: "Zor" } as const;

export const metadata: Metadata = buildPageMetadata({
  title: "Tarifler | Yetiş ürünleriyle reçeteler",
  description:
    "Yetiş Grup katalog ürünleriyle hazırlanan resmi reçeteler. HORECA ve mutfaklar için pratik tarifler.",
  path: "/tarifler",
});

export default async function RecipesIndexPage() {
  const recipes = await listPublishedRecipes();

  return (
    <Canvas>
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { name: "Ana sayfa", path: "/" },
            { name: "Tarifler", path: "/tarifler" },
          ]),
          itemListJsonLd(
            recipes.map((r) => ({
              name: r.title,
              path: `/tarifler/${r.slug}`,
              image: r.coverUrl,
            })),
            "Yetiş Grup tarifleri",
          ),
        ]}
      />
      <Slab>
        <SiteHeader />
        <div className="mkt-pad">
          <p className="mkt-label text-mkt-green-text">Mutfak</p>
          <h1 className="mkt-h2 mt-3 text-mkt-ink">Tarifler</h1>
          <p className="mkt-body mt-3 max-w-xl">
            Katalog ürünleriyle ilişkili resmi reçeteler. Maliyet hesaplayıcı köprüsü M20 ile
            açılacak.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <Link key={recipe.id} href={`/tarifler/${recipe.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-mkt-card-muted">
                  {recipe.coverUrl ? (
                    <Image
                      src={recipe.coverUrl}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width: 1024px) 30vw, 90vw"
                    />
                  ) : null}
                </div>
                <h2 className="mt-3 text-[17px] font-semibold text-mkt-ink group-hover:text-mkt-green-text">
                  {recipe.title}
                </h2>
                <p className="mkt-label mt-1 text-mkt-ink-muted">
                  {difficultyLabel[recipe.difficulty]} · {recipe.prepMinutes + recipe.cookMinutes} dk
                </p>
              </Link>
            ))}
          </div>
        </div>
      </Slab>
      <SiteFooter />
    </Canvas>
  );
}
