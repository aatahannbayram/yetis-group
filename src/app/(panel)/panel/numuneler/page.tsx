import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  listSampleRequests,
  getDealerSampleReport,
  getProductSampleReport,
  getStaleSampleFollowups,
} from "@/infra/db/samples";
import { SampleRequestsPanel } from "@/components/admin/sample-requests-panel";
import { SampleReports } from "@/components/admin/sample-reports";

export default async function NumunelerPage() {
  const [requests, dealerReport, productReport, staleFollowups] = await Promise.all([
    listSampleRequests(),
    getDealerSampleReport(),
    getProductSampleReport(),
    getStaleSampleFollowups(),
  ]);

  const rows = requests.map((r) => ({
    id: r.id,
    requestNo: r.requestNo,
    status: r.status,
    requestedAt: r.requestedAt.toISOString(),
    dealerName: r.dealer.unvan,
    dealerId: r.dealer.id,
    flaggedForReview: r.flaggedForReview,
    flagReason: r.flagReason,
    rejectReason: r.rejectReason,
    cargoCompany: r.cargoCompany,
    trackingNo: r.trackingNo,
    itemCount: r.items.length,
    items: r.items.map((i) => ({
      id: i.id,
      productName: i.variant.product.name,
      packSize: i.variant.packSize,
      sku: i.variant.sku,
      quantity: i.quantity,
      unitCostKurus: i.unitCostKurus,
    })),
  }));

  const pendingCount = rows.filter((r) => r.status === "TALEP_EDILDI" || r.status === "INCELENIYOR").length;
  const flaggedCount = rows.filter((r) => r.flaggedForReview).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Numuneler"
        count={rows.length}
        description="Bayilerin numune talepleri; onay, sevkiyat ve dönüşüm takibi."
      />

      <section aria-label="Özet" className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Toplam talep" value={rows.length} href="#numune-listesi" />
        <StatCard label="Bekleyen" value={pendingCount} href="#numune-listesi" />
        <StatCard label="Limit aşımı flag'li" value={flaggedCount} href="#numune-listesi" />
      </section>

      <Tabs defaultValue="liste">
        <TabsList>
          <TabsTrigger value="liste">Liste</TabsTrigger>
          <TabsTrigger value="raporlar">Raporlar</TabsTrigger>
        </TabsList>
        <TabsContent value="liste" id="numune-listesi">
          <SampleRequestsPanel requests={rows} />
        </TabsContent>
        <TabsContent value="raporlar">
          <SampleReports
            dealerReport={dealerReport.map((r) => ({
              dealerId: r.dealerId,
              dealerName: r.dealerName,
              requestCount: r.requestCount,
              totalCostKurus: r.totalCostKurus,
              conversionRatePercent: r.conversionRatePercent,
            }))}
            productReport={productReport}
            staleFollowups={staleFollowups.map((r) => ({
              itemId: r.itemId,
              requestNo: r.requestNo,
              dealerName: r.dealerName,
              productName: r.productName,
              sku: r.sku,
              daysSinceDelivery: r.daysSinceDelivery,
            }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
