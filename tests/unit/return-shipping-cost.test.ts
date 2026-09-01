import { describe, expect, it } from "vitest";
import { resolveShippingCostResponsibility } from "@/domain/return/shipping-cost";

describe("resolveShippingCostResponsibility", () => {
  it("assigns YG-fault reasons to YETIS", () => {
    expect(resolveShippingCostResponsibility("HASARLI_GELDI")).toBe("YETIS");
    expect(resolveShippingCostResponsibility("HATALI_URUN")).toBe("YETIS");
    expect(resolveShippingCostResponsibility("YANLIS_URUN")).toBe("YETIS");
    expect(resolveShippingCostResponsibility("SKT_YAKIN_GECMIS")).toBe("YETIS");
  });

  it("assigns dealer-caused reasons to BAYI", () => {
    expect(resolveShippingCostResponsibility("BAYI_FAZLA_SIPARIS")).toBe("BAYI");
    expect(resolveShippingCostResponsibility("MUSTERI_IADESI")).toBe("BAYI");
    expect(resolveShippingCostResponsibility("DIGER")).toBe("BAYI");
  });
});
