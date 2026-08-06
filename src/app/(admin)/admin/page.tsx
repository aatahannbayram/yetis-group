import Link from "next/link";
import { ArrowRight, Building2, Package, AlertTriangle } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CardLink, PillButton, StatCard } from "@/components/admin/stat-card";
import { StageFunnelChart, ChannelDistributionChart } from "@/components/admin/lead-charts";
import { getLeadDashboardData, getLeads } from "@/infra/db/leads";
import { getInventoryDashboardSummary } from "@/infra/db/inventory";
import { LEAD_ACTIVITY_TYPE_LABELS, LEAD_CHANNEL_LABELS } from "@/domain/leads";
import { formatDate } from "@/lib/format/date";

function ChartCard({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-h4 leading-h4 font-semibold text-foreground">{title}</p>
        <CardLink href={href} />
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [
    { totalLeads, openLeadsCount, wonLeadsCount, openVolumeKg, stageCounts, channelCounts },
    { totalKg, expiringSoonCount },
    leads,
  ] = await Promise.all([getLeadDashboardData(), getInventoryDashboardSummary(), getLeads()]);

  const recentLeads = leads.slice(0, 5);
  const recentActivities = leads
    .flatMap((lead) =>
      lead.activities.map((activity) => ({
        ...activity,
        companyName: lead.companyName,
        leadId: lead.id,
      })),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Pano"
        description="Bayi adayı (CRM) ve envanter canlı veriden; sipariş ve cari verileri girildikçe aşağısı dolacak."
        actions={
          <>
            <PillButton href="/admin/bayi-adaylari">Bayi Adaylarını Gör</PillButton>
            <PillButton href="/admin/urunler" variant="secondary">
              Envanteri Gör
            </PillButton>
          </>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Toplam Bayi Adayı"
          value={totalLeads}
          href="/admin/bayi-adaylari"
          featured
        />
        <StatCard label="Açık Fırsat" value={openLeadsCount} href="/admin/bayi-adaylari" />
        <StatCard label="Kazanılan" value={wonLeadsCount} href="/admin/bayi-adaylari" />
        <StatCard
          label="Açık Fırsat Hacmi"
          value={Math.round(openVolumeKg)}
          suffix=" kg"
          href="/admin/bayi-adaylari"
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <StatCard
          label="Toplam Stok"
          value={Math.round(totalKg.toNumber())}
          suffix=" kg"
          href="/admin/urunler"
        />
        <StatCard
          label="SKT Yaklaşan (14 gün)"
          value={expiringSoonCount}
          warn={expiringSoonCount > 0}
          href="/admin/urunler"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <ChartCard title="Aşamaya Göre Bayi Adayları" href="/admin/bayi-adaylari">
          <StageFunnelChart data={stageCounts} />
        </ChartCard>
        <ChartCard title="Kanala Göre Dağılım" href="/admin/bayi-adaylari">
          <ChannelDistributionChart data={channelCounts} />
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-800 p-5 text-white shadow-sm">
          <div>
            <p className="flex items-center gap-1.5 text-body-sm font-medium text-white/70">
              <AlertTriangle className="size-3.5" aria-hidden />
              Envanter Uyarısı
            </p>
            <p className="mt-2 text-h4 leading-h4 font-semibold">
              {expiringSoonCount > 0
                ? `${expiringSoonCount} lot 14 gün içinde SKT'ye giriyor`
                : "Yaklaşan SKT uyarısı yok"}
            </p>
            <p className="mt-1 text-body-sm text-white/60">
              {expiringSoonCount > 0
                ? "FEFO sevkiyat sırasını kontrol edin, geçmiş lot sevk edilemez."
                : "Önümüzdeki 14 gün içinde süresi dolacak lot bulunmuyor."}
            </p>
          </div>
          <Link
            href="/admin/urunler"
            className="mt-4 flex items-center justify-center gap-1.5 rounded-full bg-brand-500 px-4 py-2.5 text-body-sm font-semibold text-neutral-900 transition-colors hover:bg-brand-400"
          >
            Ürünleri Yönet
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-h4 leading-h4 font-semibold text-foreground">Son Bayi Adayları</p>
            <Link
              href="/admin/bayi-adaylari"
              className="text-caption font-medium text-brand-700 hover:underline"
            >
              Tümü
            </Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="mt-4 text-body-sm text-muted-foreground">Henüz bayi adayı yok.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-1">
              {recentLeads.map((lead) => (
                <li key={lead.id} className="flex items-center gap-3 py-1.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Building2 className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-sm leading-body-sm font-medium text-foreground">
                      {lead.companyName}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {LEAD_CHANNEL_LABELS[lead.channel]} · {formatDate(new Date(lead.createdAt))}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-h4 leading-h4 font-semibold text-foreground">Son Aktiviteler</p>
            <Package className="size-4 text-muted-foreground" aria-hidden />
          </div>
          {recentActivities.length === 0 ? (
            <p className="mt-4 text-body-sm text-muted-foreground">Henüz aktivite yok.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-body-sm leading-body-sm font-medium text-foreground">
                      {activity.companyName}
                    </p>
                    <p className="truncate text-caption text-muted-foreground">
                      {activity.note}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-caption font-medium text-muted-foreground">
                    {LEAD_ACTIVITY_TYPE_LABELS[activity.type]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
