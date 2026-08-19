import { describe, expect, it } from "vitest";
import { assertOrderTransition, isOrderTransitionAllowed, nextOrderStatuses, stockEffectOnTransition } from "@/domain/order/state-machine";

describe("assertOrderTransition", () => {
  it("allows configured edges", () => {
    const result = assertOrderTransition({ from: "SUBMITTED", to: "UNDER_REVIEW" });
    expect(result.ok).toBe(true);
  });

  it("is idempotent for same status", () => {
    expect(assertOrderTransition({ from: "CONFIRMED", to: "CONFIRMED" }).ok).toBe(true);
  });

  it("rejects skipping stages", () => {
    const result = assertOrderTransition({ from: "SUBMITTED", to: "SHIPPED" });
    expect(result.ok).toBe(false);
  });

  it("requires a cancel reason for CANCELLED", () => {
    const missing = assertOrderTransition({ from: "CONFIRMED", to: "CANCELLED" });
    expect(missing.ok).toBe(false);
    const ok = assertOrderTransition({
      from: "CONFIRMED",
      to: "CANCELLED",
      cancelReason: "Bayi talebi",
    });
    expect(ok.ok).toBe(true);
  });

  it("rejects moving out of a terminal state", () => {
    expect(isOrderTransitionAllowed("DELIVERED", "PREPARING")).toBe(false);
    expect(isOrderTransitionAllowed("REJECTED", "CONFIRMED")).toBe(false);
  });

  it("lists next statuses", () => {
    expect(nextOrderStatuses("PREPARING")).toEqual(["SHIPPED", "CANCELLED"]);
    expect(nextOrderStatuses("DELIVERED")).toEqual([]);
  });
});

describe("stockEffectOnTransition", () => {
  it("reserves stock when the order is confirmed", () => {
    expect(stockEffectOnTransition("UNDER_REVIEW", "CONFIRMED")).toBe("reserve");
  });

  it("releases stock when a confirmed or preparing order is cancelled", () => {
    expect(stockEffectOnTransition("CONFIRMED", "CANCELLED")).toBe("release");
    expect(stockEffectOnTransition("PREPARING", "CANCELLED")).toBe("release");
  });

  it("does not touch stock on submit, review, reject, or ship", () => {
    expect(stockEffectOnTransition("SUBMITTED", "UNDER_REVIEW")).toBe("none");
    expect(stockEffectOnTransition("UNDER_REVIEW", "REJECTED")).toBe("none");
    expect(stockEffectOnTransition("CONFIRMED", "PREPARING")).toBe("none");
    expect(stockEffectOnTransition("PREPARING", "SHIPPED")).toBe("none");
    expect(stockEffectOnTransition("CONFIRMED", "CONFIRMED")).toBe("none");
  });
});
