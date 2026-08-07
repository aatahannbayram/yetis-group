import { describe, expect, it } from "vitest";
import {
  formatStockKg,
  stockAvailabilityLabel,
  stockTone,
} from "@/lib/format/stock";

describe("stock format", () => {
  it("tones by thresholds", () => {
    expect(stockTone(0)).toBe("empty");
    expect(stockTone(12)).toBe("low");
    expect(stockTone(50)).toBe("ok");
  });

  it("labels availability", () => {
    expect(stockAvailabilityLabel(0)).toBe("Stok yok");
    expect(stockAvailabilityLabel(12)).toContain("Sınırlı");
    expect(stockAvailabilityLabel(100)).toContain("Stokta");
    expect(formatStockKg(17.5)).toBe("17,5 kg");
  });
});
