import Link from "next/link";
import {
  ArrowUpRight,
  Newspaper,
  ShoppingCart,
  Store,
  TrendingDown,
  TrendingUp,
  Users2,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  ChannelDistributionChart,
  StageFunnelChart,
} from "@/components/admin/lead-charts";
import {
  DealerStatusChart,
  LeadsTrendChart,
  OutcomeBars,
} from "@/components/admin/analytics-charts";
import { PillButton, StatCard } from "@/components/admin/stat-card";
import { getAdminAnalyticsSnapshot } from "@/infra/db/admin-analytics";
import { getInventoryDashboardSummary } from "@/infra/db/inventory";
import { money } from "@/domain/money";
import { formatMoney } from "@/lib/format/money";
import { formatDate } from "@/lib/format/date";

export default async function AdminAnalyticsPage() {
  const [snap, inventory] = await Promise.all([
    getAdminAnalyticsSnapshot(),
    getInventoryDashboardSummary(),
  ]);

  const wow = snap.crm.weekOverWeek;
  const WowIcon = wow >= 0 ? TrendingUp : TrendingDown;

  const dealerMix = [
    { key: "active", label: "Aktif / onaylı", count: snap.dealers.active, color: "var(--chart-cat-1)" },
    { key: "basvuru", label: "Başvuru", count: snap.dealers.basvuru, color: "var(--chart-cat-2)" },
    { key: "inceleme", label: "İnceleme", count: snap.dealers.inceleme, color: "var(--chart-cat-3)" },
    { key: "other", label: "Risk / pasif", count: snap.dealers.other, color: "var(--chart-cat-6)" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Analytics"
        description="CRM hunisi, bayi dağılımı, katalog ve açık B2B sepet özeti."
        actions={
          <>
            <PillButton href="/panel/b2b/sepetler" variant="secondary">
              Açık sepetler
            </PillButton>
            <PillButton href="/panel/bayi-adaylari">CRM</PillButton>
          </>
        }
      />

      {/* KPI strip */}
      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Toplam aday"
          value={snap.crm.totalLeads}
          href="/panel/bayi-adaylari"
          featured
        />
        <StatCard label="Açık fırsat" value={snap.crm.openLeads} href="/panel/bayi-adaylari" />
        <StatCard
          label="Kazanma oranı"
          value={snap.crm.winRate}
          suffix="%"
          href="/panel/bayi-adaylari"
        />
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-body-sm font-medium text-muted-foreground">Açık sepet tutarı</p>
            <Link
              href="/panel/b2b/sepetler"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-brand-50 hover:text-brand-700"
              aria-label="Sepetlere git"
            >
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
          <p className="mt-4 tabular-nums text-h2 leading-h2 font-bold text-foreground sm:text-h1 sm:leading-h1">
            {formatMoney(money(snap.b2b.openCartValueKurus))}
          </p>
          <p className="mt-1 text-caption text-muted-foreground">
            {snap.b2b.cartsWithLines} sepet · KDV hariç birim
          </p>
        </div>
      </section>

      {/* Primary trend chart */}
      <section className="mt-4 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border/70 bg-gradient-to-br from-brand-50/80 via-card to-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-h4 leading-h4 font-semibold text-foreground">Aday giriş trendi</p>
            <p className="mt-0.5 text-caption text-muted-foreground">
              Günlük form ve başvuru hacmi
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-caption font-semibold ${
              wow >= 0
                ? "bg-brand-50 text-brand-700"
                : "bg-neutral-100 text-neutral-600"
            }`}
          >
            <WowIcon className="size-3.5" aria-hidden />
            {wow >= 0 ? "+" : ""}
            {wow}% son 7g / önceki 7g
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <LeadsTrendChart data={snap.crm.leadsByDay} />
        </div>
      </section>

      {/* Funnel + channel */}
      <section className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <ChartPanel
          title="Aşama hunisi"
          subtitle="Bayi/Müşteri adaylarının pipeline dağılımı"
          href="/panel/bayi-adaylari"
        >
          <StageFunnelChart data={snap.crm.stageCounts} />
        </ChartPanel>
        <ChartPanel
          title="Kanal dağılımı"
          subtitle="Market, HORECA ve diğer"
          href="/panel/bayi-adaylari"
        >
          <ChannelDistributionChart data={snap.crm.channelCounts} />
        </ChartPanel>
      </section>

      {/* Outcomes + dealers */}
      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <ChartPanel
          title="Kapanış sonucu"
          subtitle={`${snap.crm.wonLeads} kazanıldı · ${snap.crm.lostLeads} kaybedildi`}
          href="/panel/bayi-adaylari"
        >
          <OutcomeBars won={snap.crm.wonLeads} lost={snap.crm.lostLeads} />
        </ChartPanel>
        <ChartPanel
          title="Bayi durumu"
          subtitle={`${snap.dealers.total} kayıt`}
          href="/panel/bayiler"
        >
          <DealerStatusChart data={dealerMix} />
        </ChartPanel>
      </section>

      {/* Ops metrics */}
      <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricBlock
          icon={Users2}
          title="Bayi/Müşteriler"
          href="/panel/bayiler"
          rows={[
            { label: "Toplam", value: String(snap.dealers.total) },
            { label: "Aktif / onaylı", value: String(snap.dealers.active) },
            { label: "Başvuru", value: String(snap.dealers.basvuru) },
            { label: "İnceleme", value: String(snap.dealers.inceleme) },
          ]}
        />
        <MetricBlock
          icon={Store}
          title="Katalog"
          href="/panel/urunler"
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
          href="/panel/b2b/sepetler"
          rows={[
            { label: "Dolu sepet", value: String(snap.b2b.cartsWithLines) },
            { label: "Satır", value: String(snap.b2b.lineCount) },
            { label: "Adet", value: String(snap.b2b.unitCount) },
            {
              label: "Açık tutar",
              value: formatMoney(money(snap.b2b.openCartValueKurus)),
            },
          ]}
        />
      </section>

      <section className="mt-4">
        <MetricBlock
          icon={Newspaper}
          title="İçerik"
          href="/panel/icerikler"
          rows={[
            { label: "Yayınlı haber", value: String(snap.content.publishedPosts) },
            { label: "Taslak", value: String(snap.content.draftPosts) },
            { label: "Yayınlı tarif", value: String(snap.content.publishedRecipes) },
          ]}
        />
      </section>

      <p className="mt-6 text-caption text-muted-foreground">
        Güncellendi · {formatDate(new Date())}
      </p>
    </div>
  );
}

function ChartPanel({
  title,
  subtitle,
  href,
  children,
}: {
  title: string;
  subtitle?: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-h4 leading-h4 font-semibold text-foreground">{title}</p>
          {subtitle ? (
            <p className="mt-0.5 text-caption text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <Link
          href={href}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-brand-50 hover:text-brand-700"
          aria-label={`${title} detay`}
        >
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
      <div className="mt-4">{children}</div>
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
