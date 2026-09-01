import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { RETURN_REASON_LABEL, type ReturnReason } from "@/domain/return/reasons";
import { StatusBadge } from "@/components/ui/status-badge";

export type ReturnReasonReportRow = { reason: ReturnReason; count: number; totalQty: number };
export type DealerReturnRatioRow = {
  dealerId: string;
  dealerName: string;
  salesKurus: number;
  returnedKurus: number;
  ratioBps: number;
  flagged: boolean;
};
export type ProductReturnRatioRow = {
  variantId: string;
  productName: string;
  sku: string;
  returnCount: number;
  totalQty: number;
};
export type LotReturnRow = { lotNumber: string; returnCount: number; totalQty: number };

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
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

export function ReturnReports({
  reasonReport,
  dealerRatioReport,
  productRatioReport,
  lotReport,
}: {
  reasonReport: ReturnReasonReportRow[];
  dealerRatioReport: DealerReturnRatioRow[];
  productRatioReport: ProductReturnRatioRow[];
  lotReport: LotReturnRow[];
}) {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="text-body-sm font-semibold">Neden bazında</h3>
        {reasonReport.length === 0 ? (
          <p className="text-caption text-muted-foreground">Henüz veri yok.</p>
        ) : (
          <Table headers={["Neden", "Talep sayısı", "Toplam adet"]}>
            {reasonReport.map((r) => (
              <tr key={r.reason}>
                <td className="px-3 py-2">{RETURN_REASON_LABEL[r.reason]}</td>
                <td className="px-3 py-2 tabular-nums">{r.count}</td>
                <td className="px-3 py-2 tabular-nums">{r.totalQty}</td>
              </tr>
            ))}
          </Table>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="text-body-sm font-semibold">Bayi bazında iade oranı</h3>
        {dealerRatioReport.length === 0 ? (
          <p className="text-caption text-muted-foreground">Henüz veri yok.</p>
        ) : (
          <Table headers={["Bayi", "Satış", "İade", "Oran", ""]}>
            {dealerRatioReport.map((r) => (
              <tr key={r.dealerId}>
                <td className="px-3 py-2">{r.dealerName}</td>
                <td className="px-3 py-2 tabular-nums">{formatMoney(money(r.salesKurus))}</td>
                <td className="px-3 py-2 tabular-nums">{formatMoney(money(r.returnedKurus))}</td>
                <td className="px-3 py-2 tabular-nums">%{(r.ratioBps / 100).toFixed(1)}</td>
                <td className="px-3 py-2">
                  {r.flagged ? <StatusBadge label="Eşik aşıldı" tone="warning" /> : null}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="text-body-sm font-semibold">Ürün bazında</h3>
        {productRatioReport.length === 0 ? (
          <p className="text-caption text-muted-foreground">Henüz veri yok.</p>
        ) : (
          <Table headers={["Ürün", "SKU", "İade sayısı", "Toplam adet"]}>
            {productRatioReport.map((r) => (
              <tr key={r.variantId}>
                <td className="px-3 py-2">{r.productName}</td>
                <td className="px-3 py-2 font-mono text-caption">{r.sku}</td>
                <td className="px-3 py-2 tabular-nums">{r.returnCount}</td>
                <td className="px-3 py-2 tabular-nums">{r.totalQty}</td>
              </tr>
            ))}
          </Table>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="text-body-sm font-semibold">Lot/parti bazında</h3>
        {lotReport.length === 0 ? (
          <p className="text-caption text-muted-foreground">Henüz veri yok.</p>
        ) : (
          <Table headers={["Lot no", "İade sayısı", "Toplam adet"]}>
            {lotReport.map((r) => (
              <tr key={r.lotNumber}>
                <td className="px-3 py-2 font-mono text-caption">{r.lotNumber}</td>
                <td className="px-3 py-2 tabular-nums">{r.returnCount}</td>
                <td className="px-3 py-2 tabular-nums">{r.totalQty}</td>
              </tr>
            ))}
          </Table>
        )}
      </section>
    </div>
  );
}
