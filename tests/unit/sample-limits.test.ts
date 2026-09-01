import { describe, expect, it } from "vitest";
import { evaluateSampleRequestAgainstLimits } from "@/domain/sample/limits";

const settings = {
  maxRequestsPerDealerPerMonth: 3,
  maxValueKurusPerDealerPerMonth: 500000,
  maxQtyPerProduct: 5,
  repeatBlockDays: 90,
};

const now = new Date("2026-09-01T00:00:00Z");

describe("evaluateSampleRequestAgainstLimits", () => {
  it("passes with no violations when everything is within limits", () => {
    const result = evaluateSampleRequestAgainstLimits({
      settings,
      monthlyRequestCount: 0,
      monthlyValueKurus: 0,
      requestedItems: [{ variantId: "v1", quantity: 1, unitCostKurus: 1000 }],
      recentRequestsByVariant: new Map(),
      now,
    });
    expect(result.violations).toEqual([]);
  });

  it("flags but never blocks — always returns ok:true", () => {
    const result = evaluateSampleRequestAgainstLimits({
      settings,
      monthlyRequestCount: 3,
      monthlyValueKurus: 0,
      requestedItems: [{ variantId: "v1", quantity: 1, unitCostKurus: 1000 }],
      recentRequestsByVariant: new Map(),
      now,
    });
    expect(result.ok).toBe(true);
    expect(result.violations.some((v) => v.rule === "monthly_count")).toBe(true);
  });

  it("flags at exactly the boundary (limit+1), not at the limit itself", () => {
    const atLimit = evaluateSampleRequestAgainstLimits({
      settings,
      monthlyRequestCount: 2,
      monthlyValueKurus: 0,
      requestedItems: [{ variantId: "v1", quantity: 1 }],
      recentRequestsByVariant: new Map(),
      now,
    });
    expect(atLimit.violations).toEqual([]);

    const overLimit = evaluateSampleRequestAgainstLimits({
      settings,
      monthlyRequestCount: 3,
      monthlyValueKurus: 0,
      requestedItems: [{ variantId: "v1", quantity: 1 }],
      recentRequestsByVariant: new Map(),
      now,
    });
    expect(overLimit.violations.some((v) => v.rule === "monthly_count")).toBe(true);
  });

  it("flags projected monthly value over the cap", () => {
    const result = evaluateSampleRequestAgainstLimits({
      settings,
      monthlyRequestCount: 0,
      monthlyValueKurus: 490000,
      requestedItems: [{ variantId: "v1", quantity: 1, unitCostKurus: 20000 }],
      recentRequestsByVariant: new Map(),
      now,
    });
    expect(result.violations.some((v) => v.rule === "monthly_value")).toBe(true);
  });

  it("flags per-product quantity over the cap", () => {
    const result = evaluateSampleRequestAgainstLimits({
      settings,
      monthlyRequestCount: 0,
      monthlyValueKurus: 0,
      requestedItems: [{ variantId: "v1", quantity: 6 }],
      recentRequestsByVariant: new Map(),
      now,
    });
    expect(result.violations).toEqual([
      { rule: "product_qty", variantId: "v1", limit: 5, requested: 6 },
    ]);
  });

  it("flags a repeat request within the block window", () => {
    const recent = new Map([["v1", new Date("2026-08-15T00:00:00Z")]]); // 17 days before `now`
    const result = evaluateSampleRequestAgainstLimits({
      settings,
      monthlyRequestCount: 0,
      monthlyValueKurus: 0,
      requestedItems: [{ variantId: "v1", quantity: 1 }],
      recentRequestsByVariant: recent,
      now,
    });
    expect(result.violations.some((v) => v.rule === "repeat_request")).toBe(true);
  });

  it("does not flag a repeat request once outside the block window", () => {
    const recent = new Map([["v1", new Date("2026-05-01T00:00:00Z")]]); // well over 90 days before `now`
    const result = evaluateSampleRequestAgainstLimits({
      settings,
      monthlyRequestCount: 0,
      monthlyValueKurus: 0,
      requestedItems: [{ variantId: "v1", quantity: 1 }],
      recentRequestsByVariant: recent,
      now,
    });
    expect(result.violations).toEqual([]);
  });
});
