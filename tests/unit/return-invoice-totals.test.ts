import { describe, expect, it } from "vitest";
import { computeInvoiceTotals } from "@/domain/invoicing/totals";
import { formatReturnRequestNumber } from "@/domain/return/totals";

describe("formatReturnRequestNumber", () => {
  it("formats a padded sequence with the IAD prefix", () => {
    expect(formatReturnRequestNumber(2026, 82)).toBe("IAD-2026-00082");
    expect(formatReturnRequestNumber(2026, 1)).toBe("IAD-2026-00001");
  });

  it("rejects an invalid year or sequence", () => {
    expect(() => formatReturnRequestNumber(1999, 1)).toThrow();
    expect(() => formatReturnRequestNumber(2026, 0)).toThrow();
  });
});

describe("computeInvoiceTotals (shared by proforma and return invoices)", () => {
  it("snapshots the ORIGINAL price passed in, regardless of any 'current' price", () => {
    // Simulates a return: the order line's price at sale time (not today's list price).
    const originalPriceAtSale = 8_000;
    const currentListPriceDecoy = 12_000;
    const totals = computeInvoiceTotals([
      { quantity: 2, unitPriceKurus: originalPriceAtSale, vatRateBasisPoints: 100, lineTotalKurus: originalPriceAtSale * 2 },
    ]);
    expect(totals.totalKurus).toBe(16_000);
    expect(totals.totalKurus).not.toBe(currentListPriceDecoy * 2);
  });

  it("splits VAT-inclusive lines with integer kuruş, matching proforma math", () => {
    const totals = computeInvoiceTotals([
      { quantity: 1, unitPriceKurus: 10_000, vatRateBasisPoints: 100, lineTotalKurus: 10_000 },
    ]);
    expect(totals.subtotalKurus).toBe(9_900);
    expect(totals.vatKurus).toBe(100);
  });
});
