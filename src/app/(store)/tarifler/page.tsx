import Image from "next/image";
import Link from "next/link";
import { listPublishedRecipes } from "@/infra/db/content";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { Canvas, Slab } from "@/components/store/slab";

const difficultyLabel = { EASY: "Kolay", MEDIUM: "Orta", HARD: "Zor" } as const;

export const metadata = {
  title: "Tarifler · Yetiş Grup",
  description: "Yetiş ürünleriyle hazırlanan resmi reçeteler.",
};

export default async function RecipesIndexPage() {
  const recipes = await listPublishedRecipes();

  return (
    <Canvas>
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
                <h2 className="mt-3 text-[1.05rem] font-medium tracking-[-0.015em] text-mkt-ink">
                  {recipe.title}
                </h2>
                <p className="mkt-label mt-2 text-mkt-ink-muted">
                  {recipe.servings} porsiyon · {recipe.prepMinutes + recipe.cookMinutes} dk ·{" "}
                  {difficultyLabel[recipe.difficulty]}
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
