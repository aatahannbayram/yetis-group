import { describe, expect, it } from "vitest";
import {
  buildCatalogProductName,
  buildSku,
  convertYetisDetailedListRow,
  formatPackSize,
  mapPackagingFeature,
  parseQuantityValue,
  quantityToKgFactor,
} from "@/domain/catalog/yetis-detailed-product-list";

describe("yetis detailed product list", () => {
  it("parses quantity ranges", () => {
    expect(parseQuantityValue("650-750")).toBe(700);
    expect(parseQuantityValue("18")).toBe(18);
    expect(parseQuantityValue("2,5")).toBe(2.5);
  });

  it("converts units to kg factor", () => {
    expect(quantityToKgFactor("18", "KG")).toBe(18);
    expect(quantityToKgFactor("500", "GR")).toBe(0.5);
    expect(quantityToKgFactor("650-750", "GR")).toBe(0.7);
  });

  it("maps packaging features", () => {
    expect(mapPackagingFeature("Teneke")).toBe("TENEKE");
    expect(mapPackagingFeature("Vakumlu")).toBe("VAKUM");
    expect(mapPackagingFeature("Mavi")).toBe("TENEKE");
    expect(mapPackagingFeature("Dilimli")).toBe("VAKUM");
  });

  it("builds unique catalog names with brand", () => {
    expect(buildCatalogProductName("ATALAY", "Beyaz Peynir")).toBe("Atalay Beyaz Peynir");
    expect(buildSku("YG-L", 12, 14)).toBe("YG-L0012");
  });

  it("formats pack size with extras", () => {
    expect(formatPackSize("18", "KG", "", "Teneke", "")).toBe("18 kg · Teneke");
    expect(formatPackSize("650-750", "GR", "", "Vakumlu", "")).toBe(
      "650-750 gr · Vakumlu",
    );
  });

  it("converts a source row to import row", () => {
    const row = convertYetisDetailedListRow({
      rowNumber: 2,
      no: 1,
      mainCategory: "PEYNİR",
      subCategory: "Beyaz Peynir",
      brand: "ATALAY",
      productName: "Beyaz Peynir",
      quantityRaw: "18",
      unit: "KG",
      netRaw: "",
      packagingFeature: "Teneke",
      calibre: "",
    });
    expect(row.sku).toBe("YG-L0001");
    expect(row.name).toBe("Atalay Beyaz Peynir");
    expect(row.category).toBe("Beyaz Peynir");
    expect(row.producer).toBe("ATALAY");
    expect(row.unitFactor).toBe(18);
    expect(row.packagingType).toBe("TENEKE");
  });
});
