import { listAttributeDefinitions } from "@/infra/db/attributes";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { createAttributeAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function AdminAttributesPage() {
  const attrs = await listAttributeDefinitions();

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title="Nitelikler"
        description="Filtrelenebilir ürün nitelikleri: süt tipi, yöre, sertifika, alerjen vb."
      />

      <form
        action={createAttributeAction}
        className="mt-6 grid gap-3 rounded-3xl border border-border bg-card p-5 sm:grid-cols-2"
      >
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-caption font-medium text-muted-foreground">Ad</label>
          <Input name="name" required placeholder="Örn. Ambalaj tipi" />
        </div>
        <div className="space-y-1.5">
          <label className="text-caption font-medium text-muted-foreground">Tip</label>
          <select
            name="type"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            defaultValue="SELECT"
          >
            <option value="TEXT">Metin</option>
            <option value="NUMBER">Sayı</option>
            <option value="BOOLEAN">Evet/Hayır</option>
            <option value="SELECT">Tek seçim</option>
            <option value="MULTI_SELECT">Çoklu seçim</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-caption font-medium text-muted-foreground">
            Seçenekler (virgülle)
          </label>
          <Input name="options" placeholder="İnek, Koyun, Keçi" />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit">Nitelik Ekle</Button>
        </div>
      </form>

      <div className="mt-6 space-y-2 rounded-3xl border border-border bg-card p-4">
        {attrs.map((attr) => (
          <div key={attr.id} className="rounded-xl px-3 py-3 hover:bg-muted/40">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-body-sm font-medium">{attr.name}</p>
              <p className="font-mono text-caption text-muted-foreground">
                {attr.key} · {attr.type}
              </p>
            </div>
            {attr.options.length > 0 ? (
              <p className="mt-1 text-caption text-muted-foreground">
                {attr.options.map((o) => o.label).join(" · ")}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
