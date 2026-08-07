import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { FaturaList, type FaturaRow } from "@/components/admin/fatura-list";
import { listProformas } from "@/infra/db/proforma";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";

export default async function TekliflerPage() {
  const proformas = await listProformas();

  const unsentCount = proformas.filter((p) => p.status === "ISSUED" && !p.sentAt).length;
  const sentCount = proformas.filter((p) => p.status === "ISSUED" && p.sentAt).length;
  const openTotalKurus = proformas
    .filter((p) => p.status === "ISSUED")
    .reduce((sum, p) => sum + p.totalKurus, 0);

  const rows: FaturaRow[] = proformas.map((p) => ({
    id: p.id,
    orderId: p.orderId,
    number: p.number,
    status: p.status,
    version: p.version,
    dealerName: p.order.dealer.unvan,
    dealerType: p.order.dealer.dealerType,
    buyerVergiNo: p.buyerVergiNo,
    buyerVergiDairesi: p.buyerVergiDairesi,
    buyerAddress: p.buyerAddress,
    buyerEmail: p.buyerEmail,
    subtotalKurus: p.subtotalKurus,
    vatKurus: p.vatKurus,
    totalKurus: p.totalKurus,
    pdfPath: p.pdfPath,
    issuedAt: p.issuedAt.toISOString(),
    sentAt: p.sentAt?.toISOString() ?? null,
    lines: p.lines.map((l) => ({
      id: l.id,
      description: l.description,
      quantity: l.quantity,
      unitPriceKurus: l.unitPriceKurus,
      vatRateBasisPoints: l.vatRateBasisPoints,
      lineTotalKurus: l.lineTotalKurus,
    })),
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Teklifler"
        count={proformas.length}
        description="Sipariş üzerinden düzenlenen proforma faturalar; bayiye gönderilen teklif ve teyit belgesi."
      />

      <section aria-label="Özet" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam teklif" value={proformas.length} href="#teklif-listesi" />
        <StatCard
          label="Açık tutar"
          value={formatMoney(money(openTotalKurus))}
          href="#teklif-listesi"
        />
        <StatCard
          label="Gönderilmedi"
          value={unsentCount}
          tone={unsentCount > 0 ? "warning" : undefined}
          href="#teklif-listesi"
        />
        <StatCard label="Gönderildi" value={sentCount} tone="success" href="#teklif-listesi" />
      </section>

      <div id="teklif-listesi">
        <FaturaList faturalar={rows} />
      </div>
    </div>
  );
}
