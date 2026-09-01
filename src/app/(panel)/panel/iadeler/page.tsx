import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  listReturnRequests,
  getReturnReasonReport,
  getDealerReturnRatioReport,
  getProductReturnRatioReport,
  getLotReturnReport,
} from "@/infra/db/returns";
import { RETURN_REASON_LABEL } from "@/domain/return/reasons";
import { ReturnRequestsPanel } from "@/components/admin/return-requests-panel";
import { ReturnReports } from "@/components/admin/return-reports";

export default async function IadelerPage({
  searchParams,
}: {
  searchParams: Promise<{ open?: string }>;
}) {
  const { open } = await searchParams;
  const [requests, reasonReport, dealerRatioReport, productRatioReport, lotReport] = await Promise.all([
    listReturnRequests(),
    getReturnReasonReport(),
    getDealerReturnRatioReport(),
    getProductReturnRatioReport(),
    getLotReturnReport(),
  ]);

  const rows = requests.map((r) => ({
    id: r.id,
    returnNo: r.returnNo,
    status: r.status,
    requestedAt: r.requestedAt.toISOString(),
    dealerName: r.dealer.unvan,
    dealerId: r.dealer.id,
    orderId: r.orderId,
    rejectReason: r.rejectReason,
    shippingCostResponsibility: r.shippingCostResponsibility,
    items: r.items.map((i) => ({
      id: i.id,
      productName: i.variant.product.name,
      sku: i.variant.sku,
      reason: i.reason,
      reasonLabel: RETURN_REASON_LABEL[i.reason],
      requestedQty: i.requestedQty,
      approvedQty: i.approvedQty,
      acceptedGoodQty: i.acceptedGoodQty,
      acceptedDamagedQty: i.acceptedDamagedQty,
      photoUrls: i.photoUrls,
      lotNumber: i.lotNumber,
      unitPriceKurus: i.unitPriceKurus,
    })),
  }));

  const pendingCount = rows.filter((r) => r.status === "OLUSTURULDU" || r.status === "INCELENIYOR").length;
  const warehouseCount = rows.filter((r) => r.status === "ONAYLANDI").length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="İadeler"
        count={rows.length}
        description="Bayilerin resmi iade talepleri; onay, depo kabul ve fatura/cari işleme."
      />

      <section aria-label="Özet" className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Toplam talep" value={rows.length} href="#iade-listesi" />
        <StatCard label="Bekleyen" value={pendingCount} href="#iade-listesi" />
        <StatCard label="Depo kabulü bekliyor" value={warehouseCount} href="#iade-listesi" />
      </section>

      <Tabs defaultValue="liste">
        <TabsList>
          <TabsTrigger value="liste">Liste</TabsTrigger>
          <TabsTrigger value="raporlar">Raporlar</TabsTrigger>
        </TabsList>
        <TabsContent value="liste" id="iade-listesi">
          <ReturnRequestsPanel requests={rows} openId={open} />
        </TabsContent>
        <TabsContent value="raporlar">
          <ReturnReports
            reasonReport={reasonReport}
            dealerRatioReport={dealerRatioReport}
            productRatioReport={productRatioReport}
            lotReport={lotReport}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
