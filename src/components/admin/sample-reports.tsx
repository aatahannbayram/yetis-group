import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";

export type DealerSampleReportRow = {
  dealerId: string;
  dealerName: string;
  requestCount: number;
  totalCostKurus: number;
  conversionRatePercent: number;
};

export type ProductSampleReportRow = {
  variantId: string;
  productName: string;
  sku: string;
  requestCount: number;
  conversionRatePercent: number;
};

export type StaleSampleFollowupRow = {
  itemId: string;
  requestNo: string;
  dealerName: string;
  productName: string;
  sku: string;
  daysSinceDelivery: number;
};

function Table({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--panel-border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--panel-border)] bg-[var(--surface-2)] text-left text-caption font-medium text-muted-foreground">
            {headers.map((h) => (
              <th key={h} className="px-3 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--panel-border)]">{children}</tbody>
      </table>
    </div>
  );
}

export function SampleReports({
  dealerReport,
  productReport,
  staleFollowups,
}: {
  dealerReport: DealerSampleReportRow[];
  productReport: ProductSampleReportRow[];
  staleFollowups: StaleSampleFollowupRow[];
}) {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="text-body-sm font-semibold">Bayi bazında</h3>
        {dealerReport.length === 0 ? (
          <p className="text-caption text-muted-foreground">Henüz veri yok.</p>
        ) : (
          <Table headers={["Bayi", "Talep", "Toplam maliyet", "Dönüşüm %"]}>
            {dealerReport.map((r) => (
              <tr key={r.dealerId}>
                <td className="px-3 py-2">{r.dealerName}</td>
                <td className="px-3 py-2 tabular-nums">{r.requestCount}</td>
                <td className="px-3 py-2 tabular-nums">{formatMoney(money(r.totalCostKurus))}</td>
                <td className="px-3 py-2 tabular-nums">%{r.conversionRatePercent}</td>
              </tr>
            ))}
          </Table>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="text-body-sm font-semibold">Ürün bazında</h3>
        {productReport.length === 0 ? (
          <p className="text-caption text-muted-foreground">Henüz veri yok.</p>
        ) : (
          <Table headers={["Ürün", "SKU", "Talep", "Dönüşüm %"]}>
            {productReport.map((r) => (
              <tr key={r.variantId}>
                <td className="px-3 py-2">{r.productName}</td>
                <td className="px-3 py-2 font-mono text-caption">{r.sku}</td>
                <td className="px-3 py-2 tabular-nums">{r.requestCount}</td>
                <td className="px-3 py-2 tabular-nums">%{r.conversionRatePercent}</td>
              </tr>
            ))}
          </Table>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="text-body-sm font-semibold">Takip listesi (numune gitti, sipariş yok)</h3>
        {staleFollowups.length === 0 ? (
          <p className="text-caption text-muted-foreground">Takip edilecek kayıt yok.</p>
        ) : (
          <Table headers={["Bayi", "Ürün", "Talep no", "Teslimden bu yana"]}>
            {staleFollowups.map((r) => (
              <tr key={r.itemId}>
                <td className="px-3 py-2">{r.dealerName}</td>
                <td className="px-3 py-2">
                  {r.productName} <span className="font-mono text-caption text-muted-foreground">{r.sku}</span>
                </td>
                <td className="px-3 py-2 font-mono text-caption">{r.requestNo}</td>
                <td className="px-3 py-2 tabular-nums text-[var(--warning-text)]">{r.daysSinceDelivery} gün</td>
              </tr>
            ))}
          </Table>
        )}
      </section>
    </div>
  );
}
