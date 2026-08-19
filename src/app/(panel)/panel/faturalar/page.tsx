import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { FaturaList, type FaturaRow } from "@/components/admin/fatura-list";
import { listProformas } from "@/infra/db/proforma";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";

export default async function AdminFaturalarPage() {
  const proformas = await listProformas();

  const now = new Date();
  const thisMonthIssuedKurus = proformas
    .filter(
      (p) =>
        p.status === "ISSUED" &&
        p.issuedAt.getFullYear() === now.getFullYear() &&
        p.issuedAt.getMonth() === now.getMonth(),
    )
    .reduce((sum, p) => sum + p.totalKurus, 0);
  const unsentCount = proformas.filter((p) => p.status === "ISSUED" && !p.sentAt).length;
  const voidCount = proformas.filter((p) => p.status === "VOID").length;

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
    paymentMethod: p.order.paymentMethod,
    paidAt: p.order.paidAt?.toISOString() ?? null,
    paymentTermDays: p.order.dealer.paymentTermDays,
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
        title="Faturalar"
        count={proformas.length}
        description="Sipariş oluşunca otomatik düzenlenen proforma faturalar."
      />

      <section aria-label="Özet" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam fatura" value={proformas.length} href="#fatura-listesi" />
        <StatCard
          label="Bu ay ciro"
          value={formatMoney(money(thisMonthIssuedKurus))}
          href="#fatura-listesi"
        />
        <StatCard
          label="Gönderilmedi"
          value={unsentCount}
          tone={unsentCount > 0 ? "warning" : undefined}
          href="#fatura-listesi"
        />
        <StatCard label="İptal" value={voidCount} href="#fatura-listesi" />
      </section>

      <div id="fatura-listesi">
        <FaturaList faturalar={rows} />
      </div>
    </div>
  );
}
