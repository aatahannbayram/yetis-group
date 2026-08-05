import Link from "next/link";
import { ArrowUpRight, ClipboardList, Wallet, Users2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { CountUp } from "@/components/admin/count-up";
import { StageFunnelChart, ChannelDistributionChart } from "@/components/admin/lead-charts";
import { getLeadDashboardData } from "@/infra/db/leads";
import { getInventoryDashboardSummary } from "@/infra/db/inventory";

function CardLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-brand-50 hover:text-brand-700"
      aria-label="Detaya git"
    >
      <ArrowUpRight className="size-4" aria-hidden />
    </Link>
  );
}

function StatCard({
  label,
  value,
  suffix,
  href,
  warn,
}: {
  label: string;
  value: number;
  suffix?: string;
  href: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-body-sm font-medium text-muted-foreground">{label}</p>
        <CardLink href={href} />
      </div>
      <p
        className={`mt-4 tabular-nums text-h1 leading-h1 font-bold ${
          warn ? "text-warning-fg" : "text-foreground"
        }`}
      >
        <CountUp value={value} suffix={suffix} />
      </p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-caption leading-caption font-semibold tracking-[0.14em] text-brand-600 uppercase">
      {children}
    </p>
  );
}

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
  ] = await Promise.all([getLeadDashboardData(), getInventoryDashboardSummary()]);

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Pano"
        description="Bayi adayı (CRM) ve envanter canlı veriden; sipariş ve cari verileri girildikçe aşağısı dolacak."
      />

      <div className="mt-8">
        <SectionLabel>Bayi Adayları</SectionLabel>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Toplam Bayi Adayı" value={totalLeads} href="/admin/bayi-adaylari" />
          <StatCard label="Açık Fırsat" value={openLeadsCount} href="/admin/bayi-adaylari" />
          <StatCard label="Kazanılan" value={wonLeadsCount} href="/admin/bayi-adaylari" />
          <StatCard
            label="Açık Fırsat Hacmi"
            value={Math.round(openVolumeKg)}
            suffix=" kg"
            href="/admin/bayi-adaylari"
          />
        </div>
      </div>

      <div className="mt-6">
        <SectionLabel>Envanter</SectionLabel>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <ChartCard title="Aşamaya Göre Bayi Adayları" href="/admin/bayi-adaylari">
          <StageFunnelChart data={stageCounts} />
        </ChartCard>
        <ChartCard title="Kanala Göre Dağılım" href="/admin/bayi-adaylari">
          <ChannelDistributionChart data={channelCounts} />
        </ChartCard>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <EmptyState
          icon={Users2}
          title="Henüz onaylı bayi yok"
          description="Kazanılan adaylardan bayi hesabı açma akışı M2 kapsamında eklenecek."
          badge="M2"
        />
        <EmptyState
          icon={ClipboardList}
          title="Henüz sipariş yok"
          description="Sipariş akışı ve durum makinesi M4 kapsamında eklenecek."
          badge="M4"
        />
        <EmptyState
          icon={Wallet}
          title="Cari hareketi yok"
          description="Cari ledger ve vade takibi M7 kapsamında eklenecek."
          badge="M7"
        />
      </div>
    </div>
  );
}
