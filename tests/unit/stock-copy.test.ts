import { describe, expect, it } from "vitest";
import { stockShortageMessage } from "@/domain/inventory/stock-copy";
import { kg } from "@/domain/weight";

describe("stockShortageMessage", () => {
  it("explains missing stock when shippable is zero", () => {
    expect(
      stockShortageMessage({
        label: "Ezine (YG-EZ)",
        requestedKg: kg(17),
        shippableKg: kg(0),
      }),
    ).toMatch(/stok girilmemiş/);
  });

  it("shows available vs requested when there is some stock", () => {
    const msg = stockShortageMessage({
      label: "Kaşar (YG-KS)",
      requestedKg: kg(20),
      shippableKg: kg(5),
    });
    expect(msg).toMatch(/stok yetersiz/);
    expect(msg).toMatch(/5/);
    expect(msg).toMatch(/20/);
  });
});
