import { describe, expect, it } from "vitest";
import {
  InventoryError,
  assertNotExpired,
  isLotExpired,
  sortLotsByFefo,
  suggestFefoShipment,
  type LotSummary,
} from "@/domain/inventory/fefo";
import { kg } from "@/domain/weight";

const asOf = new Date("2026-06-15T00:00:00Z");

function lot(id: string, lotNumber: string, expirationDate: string, availableKg: number): LotSummary {
  return { id, lotNumber, expirationDate: new Date(expirationDate), availableKg: kg(availableKg) };
}

describe("isLotExpired", () => {
  it("treats a past date as expired", () => {
    expect(isLotExpired(new Date("2026-01-01"), asOf)).toBe(true);
  });

  it("treats a future date as not expired", () => {
    expect(isLotExpired(new Date("2026-12-01"), asOf)).toBe(false);
  });
});

describe("assertNotExpired", () => {
  it("throws for an expired lot", () => {
    expect(() =>
      assertNotExpired({ lotNumber: "L-001", expirationDate: new Date("2026-01-01") }, asOf),
    ).toThrow(InventoryError);
  });

  it("does not throw for a fresh lot", () => {
    expect(() =>
      assertNotExpired({ lotNumber: "L-002", expirationDate: new Date("2026-12-01") }, asOf),
    ).not.toThrow();
  });
});

describe("sortLotsByFefo", () => {
  it("orders lots by soonest expiration first", () => {
    const lots = [
      lot("3", "L-003", "2026-09-01", 10),
      lot("1", "L-001", "2026-07-01", 10),
      lot("2", "L-002", "2026-08-01", 10),
    ];
    expect(sortLotsByFefo(lots, asOf).map((l) => l.id)).toEqual(["1", "2", "3"]);
  });

  it("excludes expired lots entirely", () => {
    const lots = [lot("expired", "L-000", "2026-01-01", 10), lot("fresh", "L-001", "2026-07-01", 10)];
    expect(sortLotsByFefo(lots, asOf).map((l) => l.id)).toEqual(["fresh"]);
  });
});

describe("suggestFefoShipment", () => {
  it("allocates from the earliest-expiring lot first", () => {
    const lots = [lot("2", "L-002", "2026-08-01", 50), lot("1", "L-001", "2026-07-01", 50)];
    const allocations = suggestFefoShipment(lots, kg(30), asOf);
    expect(allocations).toEqual([{ lotId: "1", lotNumber: "L-001", quantityKg: kg(30) }]);
  });

  it("spans multiple lots in FEFO order when one lot isn't enough", () => {
    const lots = [lot("2", "L-002", "2026-08-01", 50), lot("1", "L-001", "2026-07-01", 20)];
    const allocations = suggestFefoShipment(lots, kg(30), asOf);
    expect(allocations).toEqual([
      { lotId: "1", lotNumber: "L-001", quantityKg: kg(20) },
      { lotId: "2", lotNumber: "L-002", quantityKg: kg(10) },
    ]);
  });

  it("never allocates from an expired lot, even if it has stock", () => {
    const lots = [lot("expired", "L-000", "2026-01-01", 100), lot("fresh", "L-001", "2026-07-01", 10)];
    const allocations = suggestFefoShipment(lots, kg(10), asOf);
    expect(allocations).toEqual([{ lotId: "fresh", lotNumber: "L-001", quantityKg: kg(10) }]);
  });

  it("throws when total available stock is insufficient", () => {
    const lots = [lot("1", "L-001", "2026-07-01", 5)];
    expect(() => suggestFefoShipment(lots, kg(10), asOf)).toThrow(InventoryError);
  });
});
