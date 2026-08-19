import {
  PanoAction,
  PanoActionList,
  PanoChannel,
  PanoDonut,
  PanoHeader,
  PanoKpi,
  PanoKpiRow,
  PanoLeadTrend,
  PanoPanel,
  PanoPipeline,
  PanoQuickNav,
  PanoReceivables,
  PanoShell,
  type PanoIconName,
} from "@/components/admin/pano-ui";
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
import { formatDate } from "@/lib/format/date";

const QUICK_LINKS = (
  [
    { href: "/panel/bayi-adaylari", label: "Bayi/Müşteri adayları", icon: "userPlus" },
    { href: "/panel/urunler", label: "Ürünler", icon: "package" },
    { href: "/panel/sevkiyat", label: "Sevkiyat", icon: "truck" },
    { href: "/panel/bayiler", label: "Bayi/Müşteriler", icon: "users" },
    { href: "/panel/b2b/sepetler", label: "Sepetler", icon: "cart" },
    { href: "/panel/cari", label: "Cari", icon: "wallet" },
  ] as const satisfies readonly { href: string; label: string; icon: PanoIconName }[]
).filter((l) => isReadyHref(l.href));

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
    { key: "healthy", label: "Sağlıklı", value: inventory.healthyCount, color: "#00693e" },
    { key: "soon", label: "SKT eşiği", value: inventory.expiringSoonCount, color: "#c47a1a" },
    { key: "expired", label: "SKT geçmiş", value: inventory.expiredCount, color: "#c02626" },
  ];

  const outcomeSlices = [
    { key: "won", label: "Kazanıldı", value: analytics.crm.wonLeads, color: "#30a369" },
    { key: "lost", label: "Kaybedildi", value: analytics.crm.lostLeads, color: "#c9c2b4" },
  ].filter((s) => s.value > 0);

  const actions: {
    id: string;
    title: string;
    detail: string;
    href: string;
    cta: string;
    tone: "default" | "warn" | "danger" | "info";
    icon: PanoIconName;
  }[] = [];

  if (carts.length > 0) {
    actions.push({
      id: "carts",
      title: `${carts.length} açık sepet`,
      detail: `Toplam ${formatMoney(money(analytics.b2b.openCartValueKurus))} tutarında takip bekliyor.`,
      href: "/panel/b2b/sepetler",
      cta: "Sepetleri gör",
      tone: "info",
      icon: "cart",
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
      icon: "target",
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
      icon: "truck",
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
      icon: "alert",
    });
  }
  if (overLimit.length > 0) {
    actions.push({
      id: "credit",
      title: `${overLimit.length} bayi/müşteri kredi limitini aştı`,
      detail: "Yeni sipariş öncesi limit veya tahsilat kontrolü gerekir.",
      href: "/panel/cari",
      cta: "Cariyi aç",
      tone: "danger",
      icon: "wallet",
    });
  } else if (overdueish.length > 0) {
    actions.push({
      id: "receivable",
      title: `${overdueish.length} bayide açık alacak`,
      detail: `Örnek: ${overdueish[0]!.unvan} · ${formatMoney(money(overdueish[0]!.balanceKurus))}`,
      href: "/panel/cari",
      cta: "Cariyi aç",
      tone: "default",
      icon: "wallet",
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
      icon: "clipboard",
    });
  }
  if (actions.length === 0) {
    actions.push({
      id: "clear",
      title: "Kritik iş yok",
      detail: "Sepet, aday ve stok kuyrukları sakin.",
      href: "/panel/analytics",
      cta: "Analytics",
      tone: "info",
      icon: "clipboard",
    });
  }

  const totalReceivable = balances
    .filter((b) => b.balanceKurus > 0)
    .reduce((s, b) => s + b.balanceKurus, 0);

  const closed = analytics.crm.wonLeads + analytics.crm.lostLeads;
  const winRate =
    closed > 0 ? Math.round((analytics.crm.wonLeads / closed) * 100) : 0;

  return (
    <PanoShell>
      <PanoHeader
        title="Pano"
        dateLabel={formatDate(new Date())}
        description="CRM, stok, cari ve sepetler: sadece kritik sinyaller ve net grafikler."
        actions={
          <>
            <PanoAction href="/panel/analytics">Analytics</PanoAction>
            <PanoAction href="/panel/bayi-adaylari" variant="primary">
              Adaylar
            </PanoAction>
          </>
        }
      />

      <PanoKpiRow>
        <PanoKpi
          label="Açık aday"
          value={openLeadsCount}
          hint={`14g · ${analytics.crm.leadsLast14d}`}
          href="/panel/bayi-adaylari"
          tone={openLeadsCount > 0 ? "info" : "neutral"}
        />
        <PanoKpi
          label="SKT geçmiş"
          value={inventory.expiredCount}
          hint={formatKg(inventory.expiredOnHandKg)}
          href="/panel/stok"
          tone={inventory.expiredCount > 0 ? "danger" : "neutral"}
        />
        <PanoKpi
          label="Açık sepet"
          value={carts.length}
          hint={formatMoney(money(analytics.b2b.openCartValueKurus))}
          href="/panel/b2b/sepetler"
          tone={carts.length > 0 ? "info" : "neutral"}
        />
        <PanoKpi
          label="SKT eşiği"
          value={inventory.expiringSoonCount}
          hint={formatKg(inventory.totalKg)}
          href="/panel/sevkiyat"
          tone={inventory.expiringSoonCount > 0 ? "warn" : "neutral"}
        />
        <PanoKpi
          label="Bayi"
          value={dealers.length}
          hint={`${analytics.dealers.active} aktif`}
          href="/panel/bayiler"
        />
        <PanoKpi
          label="Limit aşımı"
          value={overLimit.length}
          hint={totalReceivable > 0 ? formatMoney(money(totalReceivable)) : undefined}
          href="/panel/cari"
          tone={overLimit.length > 0 ? "danger" : "neutral"}
        />
      </PanoKpiRow>

      <div className="grid gap-4 lg:grid-cols-12">
        <PanoPanel
          className="lg:col-span-8"
          title="Aday girişi"
          subtitle="Son 14 gün"
        >
          <PanoLeadTrend
            data={analytics.crm.leadsByDay}
            weekOverWeek={analytics.crm.weekOverWeek}
          />
        </PanoPanel>
        <PanoPanel className="lg:col-span-4" title="Pipeline" subtitle="Açık aşamalar">
          <PanoPipeline data={analytics.crm.stageCounts} />
        </PanoPanel>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <PanoPanel
          title="Alacaklar"
          subtitle={
            totalReceivable > 0
              ? `Toplam ${formatMoney(money(totalReceivable))}`
              : "Açık bakiye yok"
          }
        >
          <PanoReceivables data={receivableChart} />
        </PanoPanel>
        <PanoPanel title="Lot sağlığı" subtitle="SKT durumu">
          <PanoDonut data={stockSlices} centerLabel="lot" />
        </PanoPanel>
        <PanoPanel title="Kazanma" subtitle={closed > 0 ? `%${winRate} kapanan` : "Henüz kapanış yok"}>
          {outcomeSlices.length > 0 ? (
            <PanoDonut data={outcomeSlices} centerLabel={`%${winRate}`} />
          ) : (
            <p className="flex h-44 items-center justify-center text-[13px] text-[var(--text-muted)]">
              Kapanmış fırsat yok
            </p>
          )}
        </PanoPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <PanoPanel className="lg:col-span-5" title="Kanallar" subtitle="Aday kaynakları">
          <PanoChannel data={analytics.crm.channelCounts} />
        </PanoPanel>
        <PanoPanel
          className="lg:col-span-7"
          title="Şimdi yap"
          subtitle={`${Math.min(actions.length, 4)} öncelik`}
        >
          <PanoActionList items={actions.slice(0, 4)} />
        </PanoPanel>
      </div>

      <section aria-label="Hızlı erişim" className="space-y-3">
        <h2 className="text-[13px] font-medium text-[var(--text-muted)]">Hızlı erişim</h2>
        <PanoQuickNav links={QUICK_LINKS} />
      </section>
    </PanoShell>
  );
}
