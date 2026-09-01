import { describe, expect, it } from "vitest";
import {
  ReturnQuantityError,
  assertReturnQtyWithinInvoice,
  assertWithinReturnWindow,
  warehouseAcceptDiffersFromApproved,
} from "@/domain/return/quantities";

describe("assertReturnQtyWithinInvoice", () => {
  it("allows a request within the remaining quantity", () => {
    expect(() =>
      assertReturnQtyWithinInvoice({ orderLineQty: 10, previouslyReturnedQty: 0, requestedQty: 5 }),
    ).not.toThrow();
  });

  it("rejects a request exceeding the invoiced quantity", () => {
    expect(() =>
      assertReturnQtyWithinInvoice({ orderLineQty: 10, previouslyReturnedQty: 0, requestedQty: 11 }),
    ).toThrow(ReturnQuantityError);
  });

  it("accounts for partial prior returns", () => {
    expect(() =>
      assertReturnQtyWithinInvoice({ orderLineQty: 10, previouslyReturnedQty: 6, requestedQty: 4 }),
    ).not.toThrow();
    expect(() =>
      assertReturnQtyWithinInvoice({ orderLineQty: 10, previouslyReturnedQty: 6, requestedQty: 5 }),
    ).toThrow(ReturnQuantityError);
  });

  it("rejects a zero or negative quantity", () => {
    expect(() =>
      assertReturnQtyWithinInvoice({ orderLineQty: 10, previouslyReturnedQty: 0, requestedQty: 0 }),
    ).toThrow(ReturnQuantityError);
  });
});

describe("assertWithinReturnWindow", () => {
  it("is within window inside the limit, never throws", () => {
    const deliveredAt = new Date("2026-06-01T00:00:00Z");
    const asOf = new Date("2026-06-10T00:00:00Z");
    const result = assertWithinReturnWindow(deliveredAt, 14, asOf);
    expect(result.withinWindow).toBe(true);
    expect(result.daysSinceDelivery).toBe(9);
  });

  it("flags outside the window without throwing", () => {
    const deliveredAt = new Date("2026-06-01T00:00:00Z");
    const asOf = new Date("2026-07-01T00:00:00Z");
    const result = assertWithinReturnWindow(deliveredAt, 14, asOf);
    expect(result.withinWindow).toBe(false);
  });
});

describe("warehouseAcceptDiffersFromApproved", () => {
  it("returns false when accepted sum matches approved", () => {
    expect(
      warehouseAcceptDiffersFromApproved({ approvedQty: 5, acceptedGoodQty: 3, acceptedDamagedQty: 2 }),
    ).toBe(false);
  });

  it("returns true when accepted sum differs from approved", () => {
    expect(
      warehouseAcceptDiffersFromApproved({ approvedQty: 5, acceptedGoodQty: 3, acceptedDamagedQty: 1 }),
    ).toBe(true);
  });
});
