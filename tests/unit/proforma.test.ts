import { describe, expect, it } from "vitest";
import {
  canSendProforma,
  computeProformaTotals,
  formatProformaNumber,
} from "@/domain/proforma";

describe("formatProformaNumber", () => {
  it("pads sequence", () => {
    expect(formatProformaNumber(2026, 42)).toBe("PRF-2026-00042");
  });
});

describe("computeProformaTotals", () => {
  it("splits VAT-inclusive lines with integer kuruş", () => {
    // 10_000 kuruş @ %1 → net 9900, vat 100 (floor)
    const totals = computeProformaTotals([
      {
        description: "Test",
        quantity: 1,
        unitPriceKurus: 10_000,
        vatRateBasisPoints: 100,
        lineTotalKurus: 10_000,
      },
    ]);
    expect(totals.totalKurus).toBe(10_000);
    expect(totals.subtotalKurus).toBe(9_900);
    expect(totals.vatKurus).toBe(100);
    expect(totals.subtotalKurus + totals.vatKurus).toBe(totals.totalKurus);
  });

  it("sums multiple lines", () => {
    const totals = computeProformaTotals([
      {
        description: "A",
        quantity: 2,
        unitPriceKurus: 5_000,
        vatRateBasisPoints: 100,
        lineTotalKurus: 10_000,
      },
      {
        description: "B",
        quantity: 1,
        unitPriceKurus: 20_000,
        vatRateBasisPoints: 1000,
        lineTotalKurus: 20_000,
      },
    ]);
    expect(totals.totalKurus).toBe(30_000);
    expect(totals.subtotalKurus + totals.vatKurus).toBe(30_000);
  });
});

describe("canSendProforma", () => {
  it("requires ISSUED and email", () => {
    expect(canSendProforma({ status: "VOID", buyerEmail: "a@b.com" }).ok).toBe(false);
    expect(canSendProforma({ status: "ISSUED", buyerEmail: null }).ok).toBe(false);
    expect(canSendProforma({ status: "ISSUED", buyerEmail: "bayi@ornek.com" }).ok).toBe(true);
  });
});
