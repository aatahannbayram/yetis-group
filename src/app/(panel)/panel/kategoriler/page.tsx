import { listCategoryTreeAdmin } from "@/infra/db/categories";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CategoryNode } from "@/components/admin/category-node";
import { createCategoryAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function AdminCategoriesPage() {
  const categories = await listCategoryTreeAdmin();
  const roots = categories.filter((c) => !c.parentId);

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title="Kategoriler"
        description="Sınırsız derinlikte kategori ağacı. Birincil kategori ürün breadcrumb’ında kullanılır."
      />

      <form
        action={createCategoryAction}
        className="mt-6 flex flex-col gap-3 rounded-3xl border border-border bg-card p-5 sm:flex-row sm:items-end"
      >
        <div className="flex-1 space-y-1.5">
          <label htmlFor="name" className="text-caption font-medium text-muted-foreground">
            Yeni kategori
          </label>
          <Input id="name" name="name" required placeholder="Örn. Zeytinyağı" />
        </div>
        <div className="space-y-1.5 sm:w-56">
          <label htmlFor="parentId" className="text-caption font-medium text-muted-foreground">
            Üst kategori
          </label>
          <select
            id="parentId"
            name="parentId"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            defaultValue=""
          >
            <option value="">Kök kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit">Ekle</Button>
      </form>

      <div className="mt-6 space-y-1 rounded-3xl border border-border bg-card p-4">
        {roots.length === 0 ? (
          <p className="p-4 text-body-sm text-muted-foreground">Henüz kategori yok.</p>
        ) : (
          roots.map((root) => (
            <CategoryNode key={root.id} category={root} all={categories} depth={0} />
          ))
        )}
      </div>
    </div>
  );
}
