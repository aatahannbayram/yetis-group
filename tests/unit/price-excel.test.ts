import { describe, expect, it } from "vitest";
import {
  matchPriceField,
  matchPriceListHeader,
  normalizeHeader,
  parseNumber,
  priceListColumnHeader,
} from "@/domain/pricing/price-excel";

describe("price-excel mapping", () => {
  it("normalizes headers", () => {
    expect(normalizeHeader("Baz fiyat (₺)")).toBe("baz fiyat");
    expect(normalizeHeader("Stok Kodu")).toBe("stok kodu");
  });

  it("maps core fields", () => {
    expect(matchPriceField("Stok kodu")).toBe("sku");
    expect(matchPriceField("Baz fiyat (₺)")).toBe("basePriceTl");
    expect(matchPriceField("Ürün adı")).toBe("productName");
  });

  it("maps price list columns", () => {
    const lists = [
      { id: "pl1", name: "Standart" },
      { id: "pl2", name: "HORECA" },
    ];
    expect(matchPriceListHeader(priceListColumnHeader("Standart"), lists)).toBe("pl1");
    expect(matchPriceListHeader("Fiyat: HORECA", lists)).toBe("pl2");
  });

  it("parses numbers", () => {
    expect(parseNumber("3400")).toBe(3400);
    expect(parseNumber("34,50")).toBe(34.5);
  });
});
