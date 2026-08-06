import Link from "next/link";
import { listAllRecipesAdmin } from "@/infra/db/content";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createRecipeAction,
  toggleRecipeStatusAction,
} from "@/app/(panel)/panel/icerikler/actions";

export default async function AdminRecipesPage() {
  const recipes = await listAllRecipesAdmin();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        title="Tarifler"
        description="Yetiş resmi reçeteleri. Yayınlananlar /tarifler altında görünür."
        actions={
          <Button asChild variant="outline">
            <Link href="/panel/icerikler">Haberler</Link>
          </Button>
        }
      />

      <form
        action={createRecipeAction}
        className="mt-6 space-y-3 rounded-3xl border border-border bg-card p-5"
      >
        <p className="text-body-sm font-medium">Yeni tarif taslağı</p>
        <Input name="title" required placeholder="Başlık" />
        <Input name="excerpt" placeholder="Özet" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Input name="servings" type="number" defaultValue={4} placeholder="Porsiyon" />
          <Input name="prepMinutes" type="number" defaultValue={15} placeholder="Hazırlık dk" />
          <Input name="cookMinutes" type="number" defaultValue={30} placeholder="Pişirme dk" />
        </div>
        <textarea
          name="steps"
          rows={4}
          placeholder="Adımlar (her satır bir adım)"
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        />
        <Input name="tips" placeholder="İpuçları" />
        <Button type="submit">Taslak Oluştur</Button>
      </form>

      <div className="mt-6 space-y-2 rounded-3xl border border-border bg-card p-4">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-3 py-3 hover:bg-muted/40"
          >
            <div className="min-w-0">
              <p className="truncate text-body-sm font-medium">{recipe.title}</p>
              <p className="text-caption text-muted-foreground">
                /{recipe.slug} · {recipe.status} · {recipe.servings} porsiyon
              </p>
            </div>
            <div className="flex gap-2">
              {recipe.status === "PUBLISHED" ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/tarifler/${recipe.slug}`} target="_blank">
                    Görüntüle
                  </Link>
                </Button>
              ) : null}
              <form action={toggleRecipeStatusAction}>
                <input type="hidden" name="id" value={recipe.id} />
                <input type="hidden" name="status" value={recipe.status} />
                <Button type="submit" size="sm" variant="secondary">
                  {recipe.status === "PUBLISHED" ? "Taslağa al" : "Yayınla"}
                </Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
