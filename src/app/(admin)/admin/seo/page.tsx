import Link from "next/link";
import { SearchCheck } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { buildMissingMetaReport, listRedirectsAdmin } from "@/infra/db/seo";
import { createRedirectAction, deleteRedirectAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSiteUrl } from "@/lib/site";

export default async function AdminSeoPage() {
  const [issues, redirects] = await Promise.all([
    buildMissingMetaReport(),
    listRedirectsAdmin(),
  ]);
  const site = getSiteUrl();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <AdminPageHeader
        title="SEO / AEO"
        description="Sitemap, yönlendirmeler ve eksik meta raporu. Analytics kimlikleri env üzerinden; izleme çerez rızasına bağlıdır."
      />

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-h4 font-semibold">Keşif uçları</h2>
        <ul className="mt-3 space-y-1 text-body-sm text-muted-foreground">
          <li>
            <Link className="text-brand-700 hover:underline" href="/sitemap.xml">
              {site}/sitemap.xml
            </Link>
          </li>
          <li>
            <Link className="text-brand-700 hover:underline" href="/robots.txt">
              {site}/robots.txt
            </Link>
          </li>
          <li>
            <Link className="text-brand-700 hover:underline" href="/llms.txt">
              {site}/llms.txt
            </Link>
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <SearchCheck className="size-5 text-brand-700" />
          <h2 className="text-h4 font-semibold">Eksik meta raporu</h2>
        </div>
        <p className="mt-1 text-body-sm text-muted-foreground">
          {issues.length} kayıtta iyileştirme önerisi var.
        </p>
        {issues.length === 0 ? (
          <p className="mt-4 text-body-sm text-muted-foreground">Kritik eksik meta bulunamadı.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-body-sm">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3 font-medium">Tür</th>
                  <th className="py-2 pr-3 font-medium">Başlık</th>
                  <th className="py-2 font-medium">Sorunlar</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={`${issue.entityType}-${issue.id}`} className="border-b border-border/70">
                    <td className="py-2.5 pr-3 tabular-nums">{issue.entityType}</td>
                    <td className="py-2.5 pr-3">
                      <span className="font-medium text-foreground">{issue.title}</span>
                      <span className="mt-0.5 block text-caption text-muted-foreground">
                        /{issue.slug}
                      </span>
                    </td>
                    <td className="py-2.5 text-muted-foreground">{issue.issues.join(" · ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-h4 font-semibold">301 / 302 yönlendirmeler</h2>
        <form action={createRedirectAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">Kaynak yol</label>
            <Input name="fromPath" placeholder="/eski-urun" required />
          </div>
          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">Hedef yol</label>
            <Input name="toPath" placeholder="/urunler/yeni-slug" required />
          </div>
          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">Kod</label>
            <Input name="statusCode" defaultValue="301" />
          </div>
          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">Not</label>
            <Input name="note" placeholder="Opsiyonel" />
          </div>
          <label className="flex items-center gap-2 text-body-sm sm:col-span-2">
            <input type="checkbox" name="active" defaultChecked className="size-4" />
            Aktif
          </label>
          <div className="sm:col-span-2">
            <Button type="submit">Yönlendirme ekle</Button>
          </div>
        </form>

        <ul className="mt-6 space-y-2">
          {redirects.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3 text-body-sm"
            >
              <div>
                <p className="font-medium">
                  {r.fromPath} → {r.toPath}{" "}
                  <span className="text-muted-foreground">({r.statusCode})</span>
                </p>
                <p className="text-caption text-muted-foreground">
                  {r.active ? "Aktif" : "Pasif"}
                  {r.note ? ` · ${r.note}` : ""}
                </p>
              </div>
              <form action={deleteRedirectAction}>
                <input type="hidden" name="id" value={r.id} />
                <Button type="submit" variant="outline" size="sm">
                  Sil
                </Button>
              </form>
            </li>
          ))}
          {redirects.length === 0 ? (
            <li className="text-body-sm text-muted-foreground">Henüz yönlendirme yok.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
