import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecipeBySlug, type RecipeIngredient } from "@/infra/db/content";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { Canvas, Slab } from "@/components/store/slab";
import { PillCta } from "@/components/store/pill-cta";

const difficultyLabel = { EASY: "Kolay", MEDIUM: "Orta", HARD: "Zor" } as const;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe || recipe.status !== "PUBLISHED") return { title: "Tarif" };
  return {
    title: `${recipe.title} · Yetiş Grup`,
    description: recipe.excerpt,
  };
}

export default async function RecipeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe || recipe.status !== "PUBLISHED") notFound();

  const ingredients = recipe.ingredients as RecipeIngredient[];
  const steps = recipe.steps as string[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.excerpt,
    image: recipe.coverUrl ? [recipe.coverUrl] : undefined,
    author: { "@type": "Organization", name: recipe.authorName },
    prepTime: `PT${recipe.prepMinutes}M`,
    cookTime: `PT${recipe.cookMinutes}M`,
    totalTime: `PT${recipe.prepMinutes + recipe.cookMinutes}M`,
    recipeYield: `${recipe.servings} porsiyon`,
    recipeIngredient: ingredients.map((i) => `${i.amount} ${i.unit} ${i.name}`),
    recipeInstructions: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: s,
    })),
  };

  return (
    <Canvas>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Slab>
        <SiteHeader />
        <article className="mkt-pad">
          <nav className="mkt-label flex gap-2 text-mkt-ink-muted">
            <Link href="/tarifler" className="hover:text-mkt-ink">
              Tarifler
            </Link>
            <span>/</span>
            <span className="text-mkt-ink">{recipe.title}</span>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-mkt-card-muted">
              {recipe.coverUrl ? (
                <Image src={recipe.coverUrl} alt="" fill className="object-cover" sizes="50vw" priority />
              ) : null}
            </div>
            <div>
              <h1 className="mkt-h2 text-balance text-mkt-ink">{recipe.title}</h1>
              <p className="mkt-body mt-4">{recipe.excerpt}</p>
              <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Porsiyon", String(recipe.servings)],
                  ["Hazırlık", `${recipe.prepMinutes} dk`],
                  ["Pişirme", `${recipe.cookMinutes} dk`],
                  ["Zorluk", difficultyLabel[recipe.difficulty]],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-[1rem] bg-mkt-card-muted px-3 py-3">
                    <dt className="mkt-label text-mkt-ink-muted">{k}</dt>
                    <dd className="mt-1 text-[15px] font-medium text-mkt-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 flex flex-wrap gap-3">
                <PillCta href="/urunler">Ürünleri Gör</PillCta>
                <span className="mkt-pill mkt-label inline-flex border border-[color:var(--mkt-border)] px-4 py-3 text-mkt-ink-muted">
                  Maliyetlendir (yakında · M20)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-[1.25rem] font-medium text-mkt-ink">Malzemeler</h2>
              <ul className="mt-4 space-y-2">
                {ingredients.map((ing) => (
                  <li
                    key={`${ing.name}-${ing.amount}`}
                    className="flex flex-wrap items-baseline justify-between gap-2 rounded-[1rem] bg-mkt-card-muted px-4 py-3"
                  >
                    <span className="text-[15px] text-mkt-ink">{ing.name}</span>
                    <span className="mkt-label text-mkt-ink-muted">
                      {ing.amount} {ing.unit}
                      {ing.productSlug ? (
                        <>
                          {" · "}
                          <Link
                            href={`/urunler/${ing.productSlug}`}
                            className="text-mkt-green-text hover:underline"
                          >
                            katalog
                          </Link>
                        </>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-[1.25rem] font-medium text-mkt-ink">Adımlar</h2>
              <ol className="mt-4 space-y-3">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mkt-label flex size-8 shrink-0 items-center justify-center rounded-full bg-mkt-accent text-mkt-accent-ink">
                      {i + 1}
                    </span>
                    <p className="mkt-body pt-1">{step}</p>
                  </li>
                ))}
              </ol>
              {recipe.tips ? (
                <p className="mkt-body mt-6 rounded-[1.25rem] bg-mkt-card-muted p-4">
                  <span className="text-mkt-ink">İpucu: </span>
                  {recipe.tips}
                </p>
              ) : null}
            </div>
          </div>

          {recipe.products.length > 0 ? (
            <div className="mt-12 border-t border-[color:var(--mkt-border)] pt-8">
              <p className="mkt-label text-mkt-green-text">Bu tarifte Yetiş ürünleri</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {recipe.products.map(({ product }) => (
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
        </article>
      </Slab>
      <SiteFooter />
    </Canvas>
  );
}
