import { describe, expect, it } from "vitest";
import { PACKAGING_ATTRIBUTE_KEY, isProductFacingAttribute } from "@/lib/format/packaging";
import { parsePackagingType } from "@/domain/catalog/product-excel";

describe("packaging attribute registry", () => {
  it("hides ambalaj from product-facing attribute forms", () => {
    expect(isProductFacingAttribute(PACKAGING_ATTRIBUTE_KEY)).toBe(false);
    expect(isProductFacingAttribute("sut-tipi")).toBe(true);
  });

  it("resolves excel labels via dynamic packaging options", () => {
    const options = [
      { value: "TENEKE", label: "Teneke" },
      { value: "bidon", label: "Bidon" },
    ];
    expect(parsePackagingType("Bidon", options)).toBe("bidon");
    expect(parsePackagingType("bidon", options)).toBe("bidon");
    expect(parsePackagingType("Teneke", options)).toBe("TENEKE");
  });
});
