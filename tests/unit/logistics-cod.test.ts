import { describe, expect, it } from "vitest";
import {
  haversineKm,
  sortStopsNearestFirst,
  isCodPaymentMethod,
  requiresPosSlip,
} from "@/domain/logistics/distance";
import {
  awaitsStaffPaymentConfirmation,
  shouldPostDeliveryDebt,
} from "@/domain/ledger";

describe("haversine and nearest-first", () => {
  it("computes positive distance between two points", () => {
    const km = haversineKm(
      { lat: 41.015, lng: 28.98 },
      { lat: 41.05, lng: 29.02 },
    );
    expect(km).toBeGreaterThan(1);
    expect(km).toBeLessThan(20);
  });

  it("sorts nearest to farthest from depot", () => {
    const depot = { lat: 41.0, lng: 29.0 };
    const sorted = sortStopsNearestFirst(depot, [
      { id: "far", lat: 41.2, lng: 29.2 },
      { id: "near", lat: 41.01, lng: 29.01 },
      { id: "mid", lat: 41.05, lng: 29.05 },
      { id: "nogeo", lat: null, lng: null },
    ]);
    expect(sorted.map((s) => s.id)).toEqual(["near", "mid", "far", "nogeo"]);
    expect(sorted[0]!.distanceKm).not.toBeNull();
    expect(sorted[3]!.distanceKm).toBeNull();
  });
});

describe("COD payment helpers", () => {
  it("detects COD methods and POS slip requirement", () => {
    expect(isCodPaymentMethod("KAPIDA_NAKIT")).toBe(true);
    expect(isCodPaymentMethod("KAPIDA_POS")).toBe(true);
    expect(isCodPaymentMethod("HAVALE")).toBe(false);
    expect(requiresPosSlip("KAPIDA_POS")).toBe(true);
    expect(requiresPosSlip("KAPIDA_NAKIT")).toBe(false);
  });

  it("posts delivery debt for COD and skips staff payment wait", () => {
    expect(
      shouldPostDeliveryDebt({ paymentMethod: "KAPIDA_POS", paidAt: null }),
    ).toBe(true);
    expect(
      awaitsStaffPaymentConfirmation({ paymentMethod: "KAPIDA_NAKIT", paidAt: null }),
    ).toBe(false);
    expect(
      awaitsStaffPaymentConfirmation({ paymentMethod: "HAVALE", paidAt: null }),
    ).toBe(true);
  });
});
