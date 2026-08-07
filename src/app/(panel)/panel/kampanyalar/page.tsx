import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { CampaignListSheet, type CampaignRow } from "@/components/admin/campaign-list-sheet";
import { listCampaigns } from "@/infra/db/campaigns";

export default async function KampanyalarPage() {
  const campaigns = await listCampaigns();

  const rows: CampaignRow[] = campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    note: c.note,
    startDate: c.startDate?.toISOString() ?? null,
    endDate: c.endDate?.toISOString() ?? null,
    active: c.active,
  }));

  const now = new Date().getTime();
  const activeCount = rows.filter(
    (r) =>
      r.active &&
      (!r.startDate || new Date(r.startDate).getTime() <= now) &&
      (!r.endDate || new Date(r.endDate).getTime() >= now),
  ).length;
  const scheduledCount = rows.filter(
    (r) => r.active && r.startDate && new Date(r.startDate).getTime() > now,
  ).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Kampanyalar"
        count={rows.length}
        description="Ad, not ve tarih aralığıyla hafif kampanya kayıtları. Fiyat motoruna bağlı değildir."
      />

      <section aria-label="Özet" className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Toplam kampanya" value={rows.length} href="#kampanya-listesi" />
        <StatCard label="Aktif" value={activeCount} tone="success" href="#kampanya-listesi" />
        <StatCard label="Planlandı" value={scheduledCount} tone="info" href="#kampanya-listesi" />
      </section>

      <div id="kampanya-listesi">
        <CampaignListSheet campaigns={rows} />
      </div>
    </div>
  );
}
