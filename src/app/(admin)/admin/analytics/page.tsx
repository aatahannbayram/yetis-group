import Link from "next/link";
import {
  ArrowUpRight,
  ChartColumn,
  Newspaper,
  ShoppingCart,
  Store,
  Users2,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PillButton, StatCard } from "@/components/admin/stat-card";
import {
  getAdminAnalyticsSnapshot,
} from "@/infra/db/admin-analytics";
import { getInventoryDashboardSummary } from "@/infra/db/inventory";
import { money } from "@/domain/money";
import { formatMoney } from "@/lib/format/money";
import { formatDate } from "@/lib/format/date";

export default async function AdminAnalyticsPage() {
  const [snap, inventory] = await Promise.all([
    getAdminAnalyticsSnapshot(),
    getInventoryDashboardSummary(),
  ]);

  const maxDay = Math.max(1, ...snap.crm.leadsByDay.map((d) => d.count));

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Analytics"
        description="CRM, bayi, katalog, içerik ve açık B2B sepetleri — sipariş FSM gelince ciro katmanı eklenecek."
        actions={
          <>
            <PillButton href="/admin/b2b/sepetler" variant="secondary">
              Açık sepetler
            </PillButton>
            <PillButton href="/admin/bayi-adaylari">CRM</PillButton>
          </>
        }
      />

      <section className="mt-6">
        <p className="text-caption font-semibold tracking-wide text-muted-foreground uppercase">
          CRM
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Toplam aday" value={snap.crm.totalLeads} href="/admin/bayi-adaylari" featured />
          <StatCard label="Açık fırsat" value={snap.crm.openLeads} href="/admin/bayi-adaylari" />
          <StatCard label="Son 14 gün" value={snap.crm.leadsLast14d} href="/admin/bayi-adaylari" />
          <StatCard
            label="Kazanma oranı"
            value={snap.crm.winRate}
            suffix="%"
            href="/admin/bayi-adaylari"
          />
        </div>
      </section>

      <section className="mt-8">
        <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-h4 leading-h4 font-semibold text-foreground">
                Son 14 gün — yeni aday
              </p>
              <p className="mt-1 text-caption text-muted-foreground">
                Günlük form / başvuru hacmi
              </p>
            </div>
            <ChartColumn className="size-5 text-muted-foreground" aria-hidden />
          </div>
          <div className="mt-6 flex h-36 items-end gap-1 sm:gap-1.5">
            {snap.crm.leadsByDay.map((day) => {
              const height = Math.max(8, Math.round((day.count / maxDay) * 100));
              return (
                <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    {day.count || ""}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-brand-500/90 transition-colors hover:bg-brand-600"
                    style={{ height: `${height}%` }}
                    title={`${day.date}: ${day.count}`}
                  />
                  <span className="hidden text-[9px] text-muted-foreground sm:block">
                    {day.date.slice(8)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricBlock
          icon={Users2}
          title="Bayiler"
          href="/admin/bayiler"
          rows={[
            { label: "Toplam", value: String(snap.dealers.total) },
            { label: "Aktif / onaylı", value: String(snap.dealers.active) },
            { label: "Başvuru", value: String(snap.dealers.basvuru) },
          ]}
        />
        <MetricBlock
          icon={Store}
          title="Katalog"
          href="/admin/urunler"
          rows={[
            { label: "Aktif ürün", value: String(snap.catalog.productsActive) },
            { label: "Aktif varyant", value: String(snap.catalog.variantsActive) },
            {
              label: "Stok",
              value: `${Math.round(inventory.totalKg.toNumber())} kg`,
            },
            {
              label: "SKT uyarı (14g)",
              value: String(inventory.expiringSoonCount),
              warn: inventory.expiringSoonCount > 0,
            },
          ]}
        />
        <MetricBlock
          icon={ShoppingCart}
          title="B2B sepet"
          href="/admin/b2b/sepetler"
          rows={[
            { label: "Dolu sepet", value: String(snap.b2b.cartsWithLines) },
            { label: "Satır", value: String(snap.b2b.lineCount) },
            { label: "Adet", value: String(snap.b2b.unitCount) },
            {
              label: "Açık tutar (KDV hariç birim)",
              value: formatMoney(money(snap.b2b.openCartValueKurus)),
            },
          ]}
        />
      </section>

      <section className="mt-8">
        <MetricBlock
          icon={Newspaper}
          title="İçerik"
          href="/admin/icerikler"
          rows={[
            { label: "Yayınlı haber", value: String(snap.content.publishedPosts) },
            { label: "Taslak", value: String(snap.content.draftPosts) },
            { label: "Yayınlı tarif", value: String(snap.content.publishedRecipes) },
          ]}
        />
      </section>

      <p className="mt-6 text-caption text-muted-foreground">
        Güncellendi · {formatDate(new Date())} · Sipariş / cari analytics M4–M7 sonrası
      </p>
    </div>
  );
}

function MetricBlock({
  icon: Icon,
  title,
  href,
  rows,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  href: string;
  rows: { label: string; value: string; warn?: boolean }[];
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Icon className="size-4" aria-hidden />
          </span>
          <p className="text-h4 leading-h4 font-semibold text-foreground">{title}</p>
        </div>
        <Link
          href={href}
          className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-brand-50 hover:text-brand-700"
          aria-label={`${title} detay`}
        >
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
      <ul className="mt-4 space-y-2.5">
        {rows.map((row) => (
          <li key={row.label} className="flex items-baseline justify-between gap-3">
            <span className="text-body-sm text-muted-foreground">{row.label}</span>
            <span
              className={`text-body-sm font-semibold tabular-nums ${
                row.warn ? "text-warning-fg" : "text-foreground"
              }`}
            >
              {row.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
