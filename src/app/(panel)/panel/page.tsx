import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Package,
  ShoppingCart,
  Target,
  Truck,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, PillButton } from "@/components/admin/stat-card";
import {
  ChartPanel,
  DashboardChannelBars,
  DashboardLeadTrend,
  DashboardOutcomeDonut,
  DashboardPipelineBars,
  DashboardReceivables,
  DashboardStockDonut,
} from "@/components/admin/dashboard-charts";
import { getLeads } from "@/infra/db/leads";
import { getInventoryDashboardSummary } from "@/infra/db/inventory";
import {
  getAdminAnalyticsSnapshot,
  listActiveCartsForAdmin,
} from "@/infra/db/admin-analytics";
import { listDealerBalances } from "@/infra/db/ledger";
import { getShippingOverview } from "@/infra/db/shipping";
import { listDealerOptions } from "@/infra/db/dealers";
import { leadStaleDays } from "@/features/staff/leads/staleness";
import { formatMoney } from "@/lib/format/money";
import { formatKg } from "@/lib/format/weight";
import { money } from "@/domain/money";
import { isReadyHref } from "@/components/admin/panel-nav";

type ActionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  cta: string;
  tone: "default" | "warn" | "danger" | "info";
  icon: React.ComponentType<{ className?: string }>;
};

const QUICK_LINKS = [
  { href: "/panel/bayi-adaylari", label: "Bayi adayları", icon: UserPlus },
  { href: "/panel/urunler", label: "Ürünler", icon: Package },
  { href: "/panel/sevkiyat", label: "Sevkiyat", icon: Truck },
  { href: "/panel/bayiler", label: "Bayiler", icon: Users },
  { href: "/panel/b2b/sepetler", label: "Sepetler", icon: ShoppingCart },
  { href: "/panel/cari", label: "Cari", icon: Wallet },
].filter((l) => isReadyHref(l.href));

export default async function PanelDashboardPage() {
  const [leads, inventory, carts, balances, shipping, dealers, analytics] =
    await Promise.all([
      getLeads(),
      getInventoryDashboardSummary(),
      listActiveCartsForAdmin(),
      listDealerBalances(),
      getShippingOverview(),
      listDealerOptions(),
      getAdminAnalyticsSnapshot(),
    ]);

  const openLeadsCount = analytics.crm.openLeads;

  const staleLeadRows = leads.filter(
    (l) =>
      l.stage !== "KAZANILDI" &&
      l.stage !== "KAYBEDILDI" &&
      leadStaleDays(l.updatedAt) >= 4,
  );

  const expiredVariants = shipping.filter((r) => r.lots.some((l) => l.expired)).length;
  const soonVariants = shipping.filter(
    (r) => r.lots.some((l) => l.expiringSoon) && !r.lots.every((l) => l.expired),
  ).length;

  const overLimit = balances.filter(
    (b) => b.creditLimitKurus != null && b.balanceKurus > b.creditLimitKurus,
  );
  const overdueish = balances.filter((b) => b.balanceKurus > 0).slice(0, 5);

  const receivableChart = balances
    .filter((b) => b.balanceKurus > 0)
    .sort((a, b) => b.balanceKurus - a.balanceKurus)
    .slice(0, 6)
    .map((b) => ({
      name: b.unvan,
      balanceKurus: b.balanceKurus,
      overLimit: b.creditLimitKurus != null && b.balanceKurus > b.creditLimitKurus,
    }));

  const stockSlices = [
    {
      key: "healthy",
      label: "Sağlıklı",
      value: inventory.healthyCount,
      color: "#30a369",
    },
    {
      key: "soon",
      label: "SKT eşiği",
      value: inventory.expiringSoonCount,
      color: "#b4650a",
    },
    {
      key: "expired",
      label: "SKT geçmiş",
      value: inventory.expiredCount,
      color: "#b42318",
    },
  ];

  const actions: ActionItem[] = [];

  if (carts.length > 0) {
    actions.push({
      id: "carts",
      title: `${carts.length} açık sepet`,
      detail: `Toplam ${formatMoney(money(analytics.b2b.openCartValueKurus))} tutarında takip bekliyor.`,
      href: "/panel/b2b/sepetler",
      cta: "Sepetleri gör",
      tone: "info",
      icon: ShoppingCart,
    });
  }

  if (staleLeadRows.length > 0) {
    actions.push({
      id: "stale-leads",
      title: `${staleLeadRows.length} bayatlayan aday`,
      detail: "4 günden uzun süredir aynı aşamada bekleyen başvurular.",
      href: "/panel/bayi-adaylari",
      cta: "Adaylara git",
      tone: "warn",
      icon: Target,
    });
  }

  if (inventory.expiringSoonCount > 0 || soonVariants > 0) {
    actions.push({
      id: "skt",
      title: `${inventory.expiringSoonCount} lot SKT eşiğinde`,
      detail: `${soonVariants} ürün varyantında yaklaşan SKT.`,
      href: "/panel/sevkiyat",
      cta: "FEFO planı",
      tone: "warn",
      icon: Truck,
    });
  }

  if (expiredVariants > 0 || inventory.expiredCount > 0) {
    actions.push({
      id: "expired",
      title: `${Math.max(expiredVariants, inventory.expiredCount)} SKT geçmiş kayıt`,
      detail: "Bu lotlar sevk edilemez.",
      href: "/panel/sevkiyat",
      cta: "Stoku incele",
      tone: "danger",
      icon: AlertTriangle,
    });
  }

  if (overLimit.length > 0) {
    actions.push({
      id: "credit",
      title: `${overLimit.length} bayi kredi limitini aştı`,
      detail: "Yeni sipariş öncesi limit veya tahsilat kontrolü gerekir.",
      href: "/panel/cari",
      cta: "Cariyi aç",
      tone: "danger",
      icon: Wallet,
    });
  } else if (overdueish.length > 0) {
    actions.push({
      id: "receivable",
      title: `${overdueish.length} bayide açık alacak`,
      detail: `Örnek: ${overdueish[0]!.unvan} · ${formatMoney(money(overdueish[0]!.balanceKurus))}`,
      href: "/panel/cari",
      cta: "Cariyi aç",
      tone: "default",
      icon: Wallet,
    });
  }

  if (openLeadsCount > 0) {
    actions.push({
      id: "new-leads",
      title: `${openLeadsCount} açık bayi başvurusu`,
      detail: "Pipeline'da bekleyen adaylar.",
      href: "/panel/bayi-adaylari",
      cta: "İncele",
      tone: "default",
      icon: ClipboardList,
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: "clear",
      title: "Şu an bekleyen kritik iş yok",
      detail: "Sepet, aday ve stok kuyrukları sakin.",
      href: "/panel/analytics",
      cta: "Analytics",
      tone: "info",
      icon: ClipboardList,
    });
  }

  const toneClass = {
    default: "border-[var(--border)]",
    warn: "border-[var(--warning-border)]",
    danger: "border-[var(--danger-border)]",
    info: "border-[var(--info-border)]",
  } as const;

  const totalReceivable = balances
    .filter((b) => b.balanceKurus > 0)
    .reduce((s, b) => s + b.balanceKurus, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Pano"
        description="Operasyon nabzı: CRM, stok, cari ve açık sepetler."
        primaryAction={
          <div className="flex flex-wrap gap-2">
            <PillButton href="/panel/analytics" variant="secondary">
              Analytics
            </PillButton>
            <PillButton href="/panel/bayi-adaylari">Adaylar</PillButton>
          </div>
        }
      />

      {/* Pulse KPIs */}
      <section aria-label="Özet metrikler" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Açık aday"
          value={openLeadsCount}
          href="/panel/bayi-adaylari"
          tone={openLeadsCount > 0 ? "info" : "neutral"}
          hint={`Son 14g: ${analytics.crm.leadsLast14d}`}
        />
        <StatCard
          label="Bayatlayan"
          value={staleLeadRows.length}
          href="/panel/bayi-adaylari"
          tone={staleLeadRows.length > 0 ? "warning" : "neutral"}
        />
        <StatCard
          label="Açık sepet"
          value={carts.length}
          href="/panel/b2b/sepetler"
          tone={carts.length > 0 ? "info" : "neutral"}
          hint={formatMoney(money(analytics.b2b.openCartValueKurus))}
        />
        <StatCard
          label="SKT eşiği"
          value={inventory.expiringSoonCount}
          href="/panel/sevkiyat"
          tone={inventory.expiringSoonCount > 0 ? "warning" : "neutral"}
          hint={`${formatKg(inventory.totalKg)} stok`}
        />
        <StatCard
          label="Bayi"
          value={dealers.length}
          href="/panel/bayiler"
          hint={`${analytics.dealers.active} aktif`}
        />
        <StatCard
          label="Limit aşımı"
          value={overLimit.length}
          href="/panel/cari"
          tone={overLimit.length > 0 ? "danger" : "neutral"}
          hint={totalReceivable > 0 ? formatMoney(money(totalReceivable)) : undefined}
        />
      </section>

      {/* Charts row 1 */}
      <section aria-label="CRM grafikleri" className="grid gap-4 lg:grid-cols-12">
        <ChartPanel
          className="lg:col-span-7"
          title="Aday girişi"
          subtitle="Son 14 gün · günlük yeni başvurular"
          aside={
            <span
              className={
                analytics.crm.weekOverWeek >= 0
                  ? "rounded-full bg-[var(--success-subtle)] px-2.5 py-1 text-[length:var(--text-caption)] font-semibold tabular-nums text-[var(--success-text)]"
                  : "rounded-full bg-[var(--danger-subtle)] px-2.5 py-1 text-[length:var(--text-caption)] font-semibold tabular-nums text-[var(--danger-text)]"
              }
            >
              {analytics.crm.weekOverWeek >= 0 ? "+" : ""}
              {analytics.crm.weekOverWeek}% Hf/Hf
            </span>
          }
        >
          <DashboardLeadTrend
            data={analytics.crm.leadsByDay}
            weekOverWeek={analytics.crm.weekOverWeek}
          />
        </ChartPanel>

        <ChartPanel
          className="lg:col-span-5"
          title="Pipeline"
          subtitle="Açık aşama dağılımı"
        >
          <DashboardPipelineBars data={analytics.crm.stageCounts} />
        </ChartPanel>
      </section>

      {/* Charts row 2 */}
      <section aria-label="Cari ve stok" className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
        <ChartPanel
          className="xl:col-span-5"
          title="Açık alacaklar"
          subtitle="En yüksek bakiyeli bayiler"
          aside={
            totalReceivable > 0 ? (
              <p className="text-right text-[length:var(--text-caption)] text-[var(--text-muted)]">
                Toplam
                <span className="mt-0.5 block font-semibold tabular-nums text-[var(--text-primary)]">
                  {formatMoney(money(totalReceivable))}
                </span>
              </p>
            ) : null
          }
        >
          <DashboardReceivables
            data={receivableChart}
            formatValue={(k) => formatMoney(money(k))}
          />
        </ChartPanel>

        <ChartPanel
          className="xl:col-span-3"
          title="Lot sağlığı"
          subtitle="SKT durumuna göre"
        >
          <DashboardStockDonut data={stockSlices} />
        </ChartPanel>

        <ChartPanel
          className="xl:col-span-4"
          title="Kazanma oranı"
          subtitle="Kapanmış fırsatlar"
        >
          <DashboardOutcomeDonut
            won={analytics.crm.wonLeads}
            lost={analytics.crm.lostLeads}
          />
        </ChartPanel>
      </section>

      {/* Channel + actions */}
      <section aria-label="Kanal ve aksiyonlar" className="grid gap-4 lg:grid-cols-12">
        <ChartPanel
          className="lg:col-span-5"
          title="Kanal dağılımı"
          subtitle="Aday kaynak kanalları"
        >
          <DashboardChannelBars data={analytics.crm.channelCounts} />
        </ChartPanel>

        <div className="flex flex-col gap-4 lg:col-span-7">
          <section aria-label="Aksiyon kuyruğu">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-[length:var(--text-body)] font-semibold text-[var(--text-primary)]">
                Şu an ne yapmalıyım?
              </h2>
              <span className="text-[length:var(--text-caption)] tabular-nums text-[var(--text-muted)]">
                {actions.length} madde
              </span>
            </div>
            <ol className="space-y-2">
              {actions.slice(0, 4).map((item) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.id}
                    className={`relative overflow-hidden rounded-[var(--radius-md)] border bg-[var(--surface)] p-3.5 shadow-[var(--shadow-sm)] ${toneClass[item.tone]}`}
                  >
                    {item.tone !== "default" ? (
                      <span
                        aria-hidden
                        className={
                          item.tone === "warn"
                            ? "absolute inset-y-0 left-0 w-[3px] bg-[var(--warning-solid)]"
                            : item.tone === "danger"
                              ? "absolute inset-y-0 left-0 w-[3px] bg-[var(--danger-solid)]"
                              : "absolute inset-y-0 left-0 w-[3px] bg-[var(--info-solid)]"
                        }
                      />
                    ) : null}
                    <div className="flex items-start gap-3 pl-0.5">
                      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--surface-3)] text-[var(--text-primary)]">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[var(--text-primary)]">{item.title}</p>
                        <p className="mt-0.5 text-[length:var(--text-caption)] text-[var(--text-secondary)]">
                          {item.detail}
                        </p>
                        <Link
                          href={item.href}
                          className="mt-2 inline-flex items-center gap-1 text-[length:var(--text-body)] font-semibold text-[var(--primary-text)] hover:underline"
                        >
                          {item.cta}
                          <ArrowRight className="size-3.5" aria-hidden />
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section aria-label="Hızlı erişim">
            <h2 className="mb-3 text-[length:var(--text-body)] font-semibold text-[var(--text-primary)]">
              Hızlı erişim
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 transition-[border-color,box-shadow,background-color] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] hover:shadow-[var(--shadow-sm)]"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary-subtle)] text-[var(--primary-text)]">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="text-[length:var(--text-body)] font-medium text-[var(--text-primary)]">
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
