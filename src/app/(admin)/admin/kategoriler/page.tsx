import { listCategoryTreeAdmin } from "@/infra/db/categories";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { createCategoryAction, toggleCategoryAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CatRow = Awaited<ReturnType<typeof listCategoryTreeAdmin>>[number];

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
            <option value="">— Kök —</option>
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

function CategoryNode({
  category,
  all,
  depth,
}: {
  category: CatRow;
  all: CatRow[];
  depth: number;
}) {
  const children = all.filter((c) => c.parentId === category.id);

  return (
    <div>
      <div
        className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2.5 hover:bg-muted/50"
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        <div className="min-w-0">
          <p className="truncate text-body-sm font-medium text-foreground">{category.name}</p>
          <p className="text-caption text-muted-foreground">
            /{category.slug} · {category._count.primaryProducts} birincil ·{" "}
            {category._count.productLinks} bağlantı
            {!category.active ? " · pasif" : ""}
          </p>
        </div>
        <form action={toggleCategoryAction}>
          <input type="hidden" name="id" value={category.id} />
          <input type="hidden" name="active" value={String(category.active)} />
          <Button type="submit" variant="outline" size="sm">
            {category.active ? "Pasifleştir" : "Aktifleştir"}
          </Button>
        </form>
      </div>
      {children.map((child) => (
        <CategoryNode key={child.id} category={child} all={all} depth={depth + 1} />
      ))}
    </div>
  );
}
