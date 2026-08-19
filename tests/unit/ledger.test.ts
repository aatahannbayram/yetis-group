import { describe, expect, it } from "vitest";
import {
  availableCreditKurus,
  calculateBalance,
  canUseOnAccount,
  proformaSettlementBadge,
  shouldPostDeliveryDebt,
} from "@/domain/ledger";

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

  it("on confirm, does not double-count an already-open CARI order in exposure", () => {
    const orderTotalKurus = 100_00;
    const otherExposure = 850_00;
    const exposureIncludingThis = otherExposure + orderTotalKurus;
    const doubled = canUseOnAccount({
      ...base,
      exposureKurus: exposureIncludingThis,
      orderTotalKurus,
    });
    const excludingThis = canUseOnAccount({
      ...base,
      exposureKurus: exposureIncludingThis - orderTotalKurus,
      orderTotalKurus,
    });
    expect(doubled.ok).toBe(false);
    expect(excludingThis).toEqual({ ok: true });
  });
});

describe("availableCreditKurus", () => {
  it("returns null when no limit is defined", () => {
    expect(availableCreditKurus(null, 50_00)).toBeNull();
  });

  it("subtracts open CARI exposure, not only ledger balance", () => {
    expect(availableCreditKurus(1_000_00, 400_00)).toBe(600_00);
  });

  it("floors at zero when exposure exceeds the limit", () => {
    expect(availableCreditKurus(1_000_00, 1_200_00)).toBe(0);
  });
});

describe("shouldPostDeliveryDebt", () => {
  const paidAt = new Date("2026-08-01T10:00:00.000Z");

  it("posts BORC for CARI delivery", () => {
    expect(shouldPostDeliveryDebt({ paymentMethod: "CARI", paidAt: null })).toBe(true);
  });

  it("posts BORC for unpaid HAVALE delivery", () => {
    expect(shouldPostDeliveryDebt({ paymentMethod: "HAVALE", paidAt: null })).toBe(true);
  });

  it("still posts BORC for paid HAVALE (ODEME already written by confirmOrderPayment)", () => {
    expect(shouldPostDeliveryDebt({ paymentMethod: "HAVALE", paidAt })).toBe(true);
  });

  it("skips BORC for prepaid ONLINE (paidAt set, no ODEME)", () => {
    expect(shouldPostDeliveryDebt({ paymentMethod: "ONLINE", paidAt })).toBe(false);
  });

  it("posts BORC for ONLINE if capture failed (no paidAt)", () => {
    expect(shouldPostDeliveryDebt({ paymentMethod: "ONLINE", paidAt: null })).toBe(true);
  });
});

describe("proformaSettlementBadge", () => {
  it("marks paid orders as Odendi", () => {
    expect(
      proformaSettlementBadge({
        paymentMethod: "HAVALE",
        paidAt: new Date("2026-08-01"),
        sentAt: new Date("2026-08-01"),
      }),
    ).toEqual({ kind: "paid", label: "Ödendi" });
  });

  it("marks CARI as open account, with term days when present", () => {
    expect(
      proformaSettlementBadge({
        paymentMethod: "CARI",
        paidAt: null,
        sentAt: new Date("2026-08-01"),
        paymentTermDays: 30,
      }),
    ).toEqual({ kind: "open_account", label: "Cari açık · 30 gün" });
  });

  it("marks unsent non-cari as Gonderilmedi", () => {
    expect(
      proformaSettlementBadge({
        paymentMethod: "HAVALE",
        paidAt: null,
        sentAt: null,
      }),
    ).toEqual({ kind: "unsent", label: "Gönderilmedi" });
  });
});
