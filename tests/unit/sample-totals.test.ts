import { describe, expect, it } from "vitest";
import {
  computeRequestTotalCost,
  computeSampleItemCost,
  formatSampleRequestNumber,
} from "@/domain/sample/totals";

describe("formatSampleRequestNumber", () => {
  it("formats a padded sequence", () => {
    expect(formatSampleRequestNumber(2026, 147)).toBe("NUM-2026-00147");
    expect(formatSampleRequestNumber(2026, 1)).toBe("NUM-2026-00001");
  });

  it("rejects an invalid year or sequence", () => {
    expect(() => formatSampleRequestNumber(1999, 1)).toThrow();
    expect(() => formatSampleRequestNumber(2026, 0)).toThrow();
  });
});

describe("computeSampleItemCost", () => {
  it("multiplies unit cost by quantity", () => {
    expect(computeSampleItemCost(1500, 3)).toBe(4500);
  });

  it("treats a missing unit cost as zero (not yet fulfilled)", () => {
    expect(computeSampleItemCost(null, 3)).toBe(0);
    expect(computeSampleItemCost(undefined, 3)).toBe(0);
  });

  it("rejects a negative or fractional cost", () => {
    expect(() => computeSampleItemCost(-100, 1)).toThrow();
    expect(() => computeSampleItemCost(1.5, 1)).toThrow();
  });
});

describe("computeRequestTotalCost", () => {
  it("sums item costs, treating unset costs as zero", () => {
    const total = computeRequestTotalCost([
      { unitCostKurus: 1000, quantity: 2 },
      { unitCostKurus: null, quantity: 5 },
      { unitCostKurus: 500, quantity: 1 },
    ]);
    expect(total).toBe(2500);
  });

  it("returns zero for an empty list", () => {
    expect(computeRequestTotalCost([])).toBe(0);
  });
});
