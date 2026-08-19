import { describe, expect, it } from "vitest";
import {
  addUtcDays,
  bucketFromOverdueDays,
  calendarDaysBetween,
  dealerAging,
  openDebtSlices,
  summarizeAgingPortfolio,
} from "@/domain/ledger/aging";

const asOf = new Date("2026-08-19T12:00:00Z");

function entry(
  id: string,
  type: "BORC" | "ODEME",
  amountKurus: number,
  createdAt: string,
  reversesId: string | null = null,
) {
  return { id, type, amountKurus, createdAt, reversesId };
}

describe("bucketFromOverdueDays", () => {
  it("maps 0-30 / 31-45 / 46+", () => {
    expect(bucketFromOverdueDays(0)).toBe("ok");
    expect(bucketFromOverdueDays(30)).toBe("ok");
    expect(bucketFromOverdueDays(31)).toBe("warn");
    expect(bucketFromOverdueDays(45)).toBe("warn");
    expect(bucketFromOverdueDays(46)).toBe("danger");
  });
});

describe("calendarDaysBetween", () => {
  it("counts UTC calendar days", () => {
    expect(calendarDaysBetween(new Date("2026-08-01T23:00:00Z"), new Date("2026-08-02T01:00:00Z"))).toBe(
      1,
    );
  });
});

describe("openDebtSlices", () => {
  it("applies paymentTermDays from BORC date (teslim vekili)", () => {
    const slices = openDebtSlices(
      [entry("b1", "BORC", 100_00, "2026-07-20T00:00:00Z")],
      30,
      asOf,
    );
    expect(slices).toHaveLength(1);
    expect(slices[0]!.dueAt.toISOString().slice(0, 10)).toBe("2026-08-19");
    expect(slices[0]!.daysOverdue).toBe(0);
    expect(slices[0]!.bucket).toBe("ok");
  });

  it("FIFO: ODEME kapanan en eski BORC", () => {
    const slices = openDebtSlices(
      [
        entry("b1", "BORC", 50_00, "2026-06-01T00:00:00Z"),
        entry("b2", "BORC", 80_00, "2026-07-01T00:00:00Z"),
        entry("p1", "ODEME", 50_00, "2026-07-15T00:00:00Z"),
      ],
      0,
      asOf,
    );
    expect(slices).toHaveLength(1);
    expect(slices[0]!.remainingKurus).toBe(80_00);
    expect(slices[0]!.createdAt.toISOString().slice(0, 10)).toBe("2026-07-01");
  });

  it("ignores reversed pairs", () => {
    const slices = openDebtSlices(
      [
        entry("b1", "BORC", 90_00, "2026-01-01T00:00:00Z"),
        entry("r1", "ODEME", 90_00, "2026-01-02T00:00:00Z", "b1"),
        entry("b2", "BORC", 10_00, "2026-08-01T00:00:00Z"),
      ],
      0,
      asOf,
    );
    expect(slices).toHaveLength(1);
    expect(slices[0]!.remainingKurus).toBe(10_00);
  });

  it("marks 46+ when unpaid past term", () => {
    const slices = openDebtSlices(
      [entry("b1", "BORC", 85_00, "2026-06-01T00:00:00Z")],
      30,
      asOf,
    );
    expect(slices[0]!.daysOverdue).toBeGreaterThan(45);
    expect(slices[0]!.bucket).toBe("danger");
  });
});

describe("dealerAging", () => {
  it("returns clear when balance is not positive", () => {
    expect(
      dealerAging({
        entries: [entry("p1", "ODEME", 10_00, "2026-08-01T00:00:00Z")],
        paymentTermDays: 30,
        balanceKurus: -10_00,
      }, asOf),
    ).toEqual({ kind: "clear" });
  });

  it("uses the worst (oldest overdue) slice", () => {
    const aging = dealerAging(
      {
        entries: [
          entry("b1", "BORC", 10_00, "2026-06-01T00:00:00Z"),
          entry("b2", "BORC", 10_00, "2026-08-10T00:00:00Z"),
        ],
        paymentTermDays: 0,
        balanceKurus: 20_00,
      },
      asOf,
    );
    expect(aging.kind).toBe("open");
    if (aging.kind === "open") {
      expect(aging.bucket).toBe("danger");
      expect(aging.oldestUnpaidAt.toISOString().slice(0, 10)).toBe("2026-06-01");
    }
  });
});

describe("summarizeAgingPortfolio", () => {
  it("splits remaining kurus and dealer counts by bucket", () => {
    const summary = summarizeAgingPortfolio(
      [
        {
          entries: [entry("a", "BORC", 100_00, "2026-08-10T00:00:00Z")],
          paymentTermDays: 30,
          balanceKurus: 100_00,
        },
        {
          entries: [entry("b", "BORC", 50_00, "2026-06-01T00:00:00Z")],
          paymentTermDays: 30,
          balanceKurus: 50_00,
        },
      ],
      asOf,
    );
    expect(summary.okKurus).toBe(100_00);
    expect(summary.okCount).toBe(1);
    expect(summary.dangerKurus).toBe(50_00);
    expect(summary.dangerCount).toBe(1);
  });
});

describe("addUtcDays", () => {
  it("adds calendar days without DST drift", () => {
    expect(addUtcDays(new Date("2026-07-20T15:00:00Z"), 30).toISOString().slice(0, 10)).toBe(
      "2026-08-19",
    );
  });
});
