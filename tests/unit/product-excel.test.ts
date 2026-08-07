import { describe, expect, it } from "vitest";
import {
  matchAttributeHeader,
  matchProductField,
  normalizeHeader,
  parseBool,
  parsePackagingType,
} from "@/domain/catalog/product-excel";

describe("product-excel mapping", () => {
  it("normalizes Turkish headers", () => {
    expect(normalizeHeader("Stok Kodu")).toBe("stok kodu");
    expect(normalizeHeader("Ürün Adı")).toBe("urun adi");
  });

  it("maps common import aliases", () => {
    expect(matchProductField("SKU")).toBe("sku");
    expect(matchProductField("Stok kodu")).toBe("sku");
    expect(matchProductField("Ürün adı")).toBe("name");
    expect(matchProductField("Başlık")).toBe("name");
    expect(matchProductField("Açıklama")).toBe("description");
    expect(matchProductField("Görsel URL")).toBe("imageUrl");
    expect(matchProductField("Baz fiyat (₺)")).toBe("priceTl");
    expect(matchProductField("KDV %")).toBe("vatPercent");
  });

  it("maps attribute columns by name or Özellik: prefix", () => {
    const attrs = [
      { id: "a1", key: "yag-orani", name: "Yağ oranı" },
      { id: "a2", key: "renk", name: "Renk" },
    ];
    expect(matchAttributeHeader("Özellik: Yağ oranı", attrs)).toBe("a1");
    expect(matchAttributeHeader("Yağ oranı", attrs)).toBe("a1");
    expect(matchAttributeHeader("attr:yag-orani", attrs)).toBe("a1");
  });

  it("parses packaging and bools", () => {
    expect(parsePackagingType("Teneke")).toBe("TENEKE");
    expect(parsePackagingType("dökme")).toBe("DOKME");
    expect(parseBool("Evet")).toBe(true);
    expect(parseBool("hayır")).toBe(false);
  });
});
