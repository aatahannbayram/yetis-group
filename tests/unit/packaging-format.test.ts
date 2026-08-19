import { describe, expect, it } from "vitest";
import {
  mixedQuantityNoun,
  packLabel,
  packSummary,
  packagingTypeLabel,
  salesUnitLabel,
  cinsLine,
} from "@/lib/format/packaging";

describe("packaging labels", () => {
  it("maps enums to Turkish", () => {
    expect(packagingTypeLabel("TENEKE")).toBe("Teneke");
    expect(salesUnitLabel("TENEKE")).toBe("teneke");
    expect(salesUnitLabel("KOLI")).toBe("koli");
    expect(salesUnitLabel("DOKME")).toBe("kg");
    expect(salesUnitLabel("VAKUM")).toBe("adet");
  });

  it("prefers packSize over enum", () => {
    expect(packLabel("17 kg teneke", "TENEKE")).toBe("17 kg teneke");
    expect(packLabel(null, "TENEKE")).toBe("Teneke");
    expect(packLabel("17 kg", "TENEKE")).toBe("17 kg · Teneke");
  });

  it("adds kg when packSize does not already include it", () => {
    expect(packSummary({ packSize: null, packagingType: "TENEKE", unitFactor: "17" })).toBe(
      "Teneke · 17 kg",
    );
    expect(
      packSummary({ packSize: "17 kg teneke", packagingType: "TENEKE", unitFactor: "17" }),
    ).toBe("17 kg teneke");
  });

  it("uses a shared noun only when all lines share a pack type", () => {
    expect(mixedQuantityNoun(["TENEKE", "TENEKE"])).toBe("teneke");
    expect(mixedQuantityNoun(["TENEKE", "KOLI"])).toBe("adet");
  });

  it("lists every cins on a product card line", () => {
    expect(
      cinsLine([
        { packSize: "17 kg teneke", packagingType: "TENEKE", unitFactor: "17" },
        { packSize: "1 kg vakum", packagingType: "VAKUM", unitFactor: "1" },
      ]),
    ).toBe("17 kg teneke · 1 kg vakum");
    expect(
      cinsLine([{ packSize: "17 kg teneke", packagingType: "TENEKE", unitFactor: "17" }]),
    ).toBe("17 kg teneke");
  });
});
