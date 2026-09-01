import { describe, expect, it } from "vitest";
import { matchSampleConversion } from "@/domain/sample/conversion";

const deliveredAt = new Date("2026-06-01T00:00:00Z");

describe("matchSampleConversion", () => {
  it("matches an order for the same variant within the window", () => {
    const match = matchSampleConversion(
      { variantId: "v1", deliveredAt },
      [{ orderId: "o1", variantId: "v1", createdAt: new Date("2026-06-10T00:00:00Z") }],
      60,
    );
    expect(match).toEqual({ orderId: "o1", daysElapsed: 9 });
  });

  it("ignores orders for a different variant", () => {
    const match = matchSampleConversion(
      { variantId: "v1", deliveredAt },
      [{ orderId: "o1", variantId: "v2", createdAt: new Date("2026-06-10T00:00:00Z") }],
      60,
    );
    expect(match).toBeNull();
  });

  it("ignores orders outside the window", () => {
    const match = matchSampleConversion(
      { variantId: "v1", deliveredAt },
      [{ orderId: "o1", variantId: "v1", createdAt: new Date("2026-08-15T00:00:00Z") }],
      60,
    );
    expect(match).toBeNull();
  });

  it("ignores orders placed before the sample was delivered", () => {
    const match = matchSampleConversion(
      { variantId: "v1", deliveredAt },
      [{ orderId: "o1", variantId: "v1", createdAt: new Date("2026-05-20T00:00:00Z") }],
      60,
    );
    expect(match).toBeNull();
  });

  it("picks the earliest qualifying order when multiple exist", () => {
    const match = matchSampleConversion(
      { variantId: "v1", deliveredAt },
      [
        { orderId: "later", variantId: "v1", createdAt: new Date("2026-06-20T00:00:00Z") },
        { orderId: "earlier", variantId: "v1", createdAt: new Date("2026-06-05T00:00:00Z") },
      ],
      60,
    );
    expect(match?.orderId).toBe("earlier");
  });
});
