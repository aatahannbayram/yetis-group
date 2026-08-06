import { describe, expect, it } from "vitest";
import { calculateBalance } from "@/domain/ledger";

describe("calculateBalance", () => {
  it("returns 0 for no entries", () => {
    expect(calculateBalance([])).toBe(0);
  });

  it("BORC increases balance, ODEME decreases it", () => {
    const balance = calculateBalance([
      { type: "BORC", amountKurus: 100000 },
      { type: "ODEME", amountKurus: 40000 },
    ]);
    expect(balance).toBe(60000);
  });

  it("a reversal entry (opposite type, same amount) nets to zero", () => {
    const balance = calculateBalance([
      { type: "BORC", amountKurus: 50000 },
      { type: "ODEME", amountKurus: 50000 },
    ]);
    expect(balance).toBe(0);
  });

  it("can go negative when payments exceed debt (dealer credit)", () => {
    const balance = calculateBalance([
      { type: "BORC", amountKurus: 10000 },
      { type: "ODEME", amountKurus: 25000 },
    ]);
    expect(balance).toBe(-15000);
  });
});
