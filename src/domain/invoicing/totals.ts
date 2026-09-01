import { money, type Money } from "@/domain/money";

export type InvoiceLineInput = {
  quantity: number;
  unitPriceKurus: number;
  /** e.g. 100 = %1, 1000 = %10, 2000 = %20 */
  vatRateBasisPoints: number;
  /** Gross line total (VAT-inclusive) as stored on order lines today */
  lineTotalKurus: number;
};

export type InvoiceTotals = {
  subtotalKurus: Money;
  vatKurus: Money;
  totalKurus: Money;
};

/**
 * Order/return line totals are VAT-inclusive (unit × qty). Split into net +
 * VAT using integer kuruş math (no float). Shared by proforma and return
 * invoice number/total generation — do not duplicate this math elsewhere.
 */
export function computeInvoiceTotals(lines: readonly InvoiceLineInput[]): InvoiceTotals {
  let netSum = 0;
  let vatSum = 0;
  let grossSum = 0;

  for (const line of lines) {
    const gross = line.lineTotalKurus;
    const rate = line.vatRateBasisPoints;
    if (!Number.isInteger(gross) || gross < 0) {
      throw new Error(`Geçersiz satır tutarı: ${gross}`);
    }
    if (!Number.isInteger(rate) || rate < 0) {
      throw new Error(`Geçersiz KDV oranı: ${rate}`);
    }
    // net = gross * 10000 / (10000 + rate) — integer division
    const net = Math.floor((gross * 10000) / (10000 + rate));
    const vat = gross - net;
    netSum += net;
    vatSum += vat;
    grossSum += gross;
  }

  return {
    subtotalKurus: money(netSum),
    vatKurus: money(vatSum),
    totalKurus: money(grossSum),
  };
}
