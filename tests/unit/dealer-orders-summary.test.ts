import { describe, expect, it } from "vitest";
import { summarizeDealerOrders } from "@/domain/order/dealer-report";

describe("summarizeDealerOrders", () => {
  it("aggregates open, month and delivered totals", () => {
    const now = new Date();
    const orders = [
      { status: "SUBMITTED", totalKurus: 100_00, createdAt: now },
      { status: "DELIVERED", totalKurus: 200_00, createdAt: now },
      { status: "CANCELLED", totalKurus: 50_00, createdAt: new Date("2020-01-01") },
    ];
    const s = summarizeDealerOrders(orders);
    expect(s.totalOrders).toBe(3);
    expect(s.openCount).toBe(1);
    expect(s.openKurus).toBe(100_00);
    expect(s.deliveredCount).toBe(1);
    expect(s.deliveredKurus).toBe(200_00);
    expect(s.monthCount).toBe(2);
    expect(s.monthKurus).toBe(300_00);
  });
});
