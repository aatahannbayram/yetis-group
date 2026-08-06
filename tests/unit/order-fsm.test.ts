import { describe, expect, it } from "vitest";
import { assertOrderTransition, isOrderTransitionAllowed, nextOrderStatuses } from "@/domain/order/state-machine";

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
