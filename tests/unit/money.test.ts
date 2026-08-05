import { describe, expect, it } from "vitest";
import {
  add,
  applyRate,
  compare,
  isNegative,
  money,
  MoneyError,
  multiplyByQuantity,
  negate,
  subtract,
  sum,
  zeroMoney,
} from "@/domain/money";

describe("money", () => {
  it("accepts integer kuruş values", () => {
    expect(money(150_00)).toBe(150_00);
  });

  it("rejects non-integer amounts", () => {
    expect(() => money(150.5)).toThrow(MoneyError);
  });

  it("adds and subtracts", () => {
    expect(add(money(100), money(50))).toBe(150);
    expect(subtract(money(100), money(150))).toBe(-50);
  });

  it("negates", () => {
    expect(negate(money(100))).toBe(-100);
  });

  it("sums a list", () => {
    expect(sum([money(100), money(200), money(300)])).toBe(600);
    expect(sum([])).toBe(zeroMoney);
  });

  it("multiplies by an integer quantity", () => {
    expect(multiplyByQuantity(money(250), 4)).toBe(1000);
  });

  it("rejects a non-integer quantity", () => {
    expect(() => multiplyByQuantity(money(250), 1.5)).toThrow(MoneyError);
  });

  it("applies a basis-point rate (e.g. %1 KDV) with half-away-from-zero rounding", () => {
    // 1750 kuruş * %1 (100 bp) = 17.5 kuruş -> rounds to 18
    expect(applyRate(money(1750), 100)).toBe(18);
    // 1650 kuruş * %1 = 16.5 -> rounds to 17
    expect(applyRate(money(1650), 100)).toBe(17);
    // %18 KDV (1800 bp) on 10000 kuruş = 1800 kuruş
    expect(applyRate(money(10_000), 1800)).toBe(1800);
  });

  it("compares", () => {
    expect(compare(money(100), money(200))).toBe(-1);
    expect(compare(money(200), money(100))).toBe(1);
    expect(compare(money(100), money(100))).toBe(0);
  });

  it("detects negative amounts", () => {
    expect(isNegative(money(-1))).toBe(true);
    expect(isNegative(money(0))).toBe(false);
  });
});
