import { describe, expect, it } from "vitest";
import { add, compare, fromCases, kg, subtract, sum, WeightError, zeroKg } from "@/domain/weight";

describe("weight", () => {
  it("keeps 3 decimal places", () => {
    expect(kg(1.23456).toString()).toBe("1.235");
  });

  it("rejects negative weight", () => {
    expect(() => kg(-0.5)).toThrow(WeightError);
  });

  it("adds and subtracts", () => {
    expect(add(kg(1.5), kg(2.25)).toString()).toBe("3.75");
    expect(subtract(kg(5), kg(1.234)).toString()).toBe("3.766");
  });

  it("sums a list", () => {
    expect(sum([kg(1), kg(2.5), kg(0.5)]).toString()).toBe("4");
    expect(sum([]).equals(zeroKg)).toBe(true);
  });

  it("converts case count via koli↔kg katsayısı", () => {
    // 17 kg teneke beyaz peynir, 1 koli = 1 teneke
    expect(fromCases(3, 17).toString()).toBe("51");
    // 1 kg vakum kaşar, koli = 10 adet
    expect(fromCases(2, 0.1).toString()).toBe("0.2");
  });

  it("rejects a non-integer case count", () => {
    expect(() => fromCases(1.5, 17)).toThrow(WeightError);
  });

  it("compares", () => {
    expect(compare(kg(1), kg(2))).toBe(-1);
    expect(compare(kg(2), kg(1))).toBe(1);
    expect(compare(kg(1), kg(1))).toBe(0);
  });
});
