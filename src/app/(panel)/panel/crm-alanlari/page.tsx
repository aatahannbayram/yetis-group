import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ensureDefaultLeadFields,
  listLeadFieldDefinitions,
} from "@/infra/db/lead-fields";
import { createLeadFieldAction, toggleLeadFieldAction } from "./actions";

export default async function CrmFieldsPage() {
  await ensureDefaultLeadFields();
  const fields = await listLeadFieldDefinitions();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <AdminPageHeader
        title="CRM Alanları"
        description="Lead formlarına özel alan ekleyin. Mağaza iletişim formu aktif ve formVisible alanları otomatik gösterir."
      />

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-h4 font-semibold">Yeni alan</h2>
        <form action={createLeadFieldAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-caption text-muted-foreground">Etiket</label>
            <Input name="label" placeholder="Vergi dairesi" required />
          </div>
          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">Tip</label>
            <select name="type" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="TEXT">Metin</option>
              <option value="NUMBER">Sayı</option>
              <option value="DATE">Tarih</option>
              <option value="SELECT">Seçim</option>
              <option value="MULTI_SELECT">Çoklu seçim</option>
              <option value="BOOLEAN">Evet/Hayır</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">Seçenekler (virgülle)</label>
            <Input name="options" placeholder="A, B, C" />
          </div>
          <label className="flex items-center gap-2 text-body-sm">
            <input type="checkbox" name="required" className="size-4" />
            Zorunlu
          </label>
          <label className="flex items-center gap-2 text-body-sm">
            <input type="checkbox" name="formVisible" defaultChecked className="size-4" />
            Formda göster
          </label>
          <div className="sm:col-span-2">
            <Button type="submit">Alan ekle</Button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-h4 font-semibold">Tanımlı alanlar</h2>
        <ul className="mt-4 space-y-2">
          {fields.map((field) => (
            <li
              key={field.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3 text-body-sm"
            >
              <div>
                <p className="font-medium">
                  {field.label}{" "}
                  <span className="text-muted-foreground">({field.type})</span>
                </p>
                <p className="text-caption text-muted-foreground">
                  key: {field.key}
                  {field.required ? " · zorunlu" : ""}
                  {field.formVisible ? " · formda" : " · gizli"}
                  {!field.active ? " · pasif" : ""}
                </p>
              </div>
              <form action={toggleLeadFieldAction}>
                <input type="hidden" name="id" value={field.id} />
                <input type="hidden" name="active" value={field.active ? "false" : "true"} />
                <Button type="submit" variant="outline" size="sm">
                  {field.active ? "Pasifleştir" : "Aktifleştir"}
                </Button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
