import { describe, expect, it } from "vitest";
import { calculateBalance, canUseOnAccount } from "@/domain/ledger";

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

describe("canUseOnAccount", () => {
  const base = {
    dealerPaymentMethod: "VADELI" as const,
    creditLimitKurus: 1_000_00,
    exposureKurus: 0,
    orderTotalKurus: 100_00,
  };

  it("allows a VADELI dealer with room under the limit", () => {
    expect(canUseOnAccount(base)).toEqual({ ok: true });
  });

  it("allows a KARMA dealer the same way", () => {
    expect(canUseOnAccount({ ...base, dealerPaymentMethod: "KARMA" })).toEqual({ ok: true });
  });

  it("rejects PESIN/HAVALE dealers regardless of limit", () => {
    expect(canUseOnAccount({ ...base, dealerPaymentMethod: "PESIN" }).ok).toBe(false);
    expect(canUseOnAccount({ ...base, dealerPaymentMethod: "HAVALE" }).ok).toBe(false);
  });

  it("rejects when no payment method is set", () => {
    expect(canUseOnAccount({ ...base, dealerPaymentMethod: null }).ok).toBe(false);
  });

  it("rejects when credit limit is not defined", () => {
    expect(canUseOnAccount({ ...base, creditLimitKurus: null }).ok).toBe(false);
  });

  it("rejects when credit limit is zero or negative", () => {
    expect(canUseOnAccount({ ...base, creditLimitKurus: 0 }).ok).toBe(false);
  });

  it("rejects when exposure + order total exceeds the limit", () => {
    const result = canUseOnAccount({ ...base, exposureKurus: 950_00, orderTotalKurus: 100_00 });
    expect(result.ok).toBe(false);
  });

  it("allows exactly at the limit boundary", () => {
    const result = canUseOnAccount({ ...base, exposureKurus: 900_00, orderTotalKurus: 100_00 });
    expect(result).toEqual({ ok: true });
  });
});
