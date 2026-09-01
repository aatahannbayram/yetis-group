import { describe, expect, it } from "vitest";
import { resolveCreditableQty } from "@/domain/return/credit-eligibility";

describe("resolveCreditableQty", () => {
  it("credits good + damaged for YG-fault reasons", () => {
    expect(
      resolveCreditableQty({ reason: "HASARLI_GELDI", acceptedGoodQty: 3, acceptedDamagedQty: 2 }),
    ).toBe(5);
    expect(
      resolveCreditableQty({ reason: "YANLIS_URUN", acceptedGoodQty: 1, acceptedDamagedQty: 1 }),
    ).toBe(2);
    expect(
      resolveCreditableQty({ reason: "HATALI_URUN", acceptedGoodQty: 0, acceptedDamagedQty: 4 }),
    ).toBe(4);
    expect(
      resolveCreditableQty({ reason: "SKT_YAKIN_GECMIS", acceptedGoodQty: 2, acceptedDamagedQty: 0 }),
    ).toBe(2);
  });

  it("credits only good quantity for dealer-caused reasons", () => {
    expect(
      resolveCreditableQty({ reason: "BAYI_FAZLA_SIPARIS", acceptedGoodQty: 3, acceptedDamagedQty: 2 }),
    ).toBe(3);
    expect(
      resolveCreditableQty({ reason: "MUSTERI_IADESI", acceptedGoodQty: 2, acceptedDamagedQty: 1 }),
    ).toBe(2);
    expect(resolveCreditableQty({ reason: "DIGER", acceptedGoodQty: 1, acceptedDamagedQty: 5 })).toBe(1);
  });
});
