import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { ProducerListSheet, type ProducerRow } from "@/components/admin/producer-list-sheet";
import { listProducersWithProductCount } from "@/infra/db/producers";

export default async function UreticilerPage() {
  const producers = await listProducersWithProductCount();

  const rows: ProducerRow[] = producers.map((p) => ({
    id: p.id,
    name: p.name,
    region: p.region,
    productionMethod: p.productionMethod,
    geoIndication: p.geoIndication,
    imageUrl: p.imageUrl,
    story: p.story,
    productCount: p.productCount,
  }));

  const regionCount = new Set(rows.map((r) => r.region).filter(Boolean)).size;
  const linkedProductCount = rows.reduce((sum, r) => sum + r.productCount, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Üreticiler"
        count={rows.length}
        description="Kamuya açık üretici hikâyeleri; ürün detayında gösterilir."
      />

      <section aria-label="Özet" className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Toplam üretici" value={rows.length} href="#uretici-listesi" />
        <StatCard label="Bölge" value={regionCount} href="#uretici-listesi" />
        <StatCard label="Bağlı ürün" value={linkedProductCount} href="/panel/urunler" />
      </section>

      <div id="uretici-listesi">
        <ProducerListSheet producers={rows} />
      </div>
    </div>
  );
}
