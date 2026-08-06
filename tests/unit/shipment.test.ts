import { describe, expect, it } from "vitest";
import { canTransitionShipment, nextShipmentStatuses } from "@/domain/shipment";

describe("shipment status FSM", () => {
  it("HAZIRLANIYOR can move to YOLDA or IPTAL", () => {
    expect(nextShipmentStatuses("HAZIRLANIYOR")).toEqual(["YOLDA", "IPTAL"]);
  });

  it("YOLDA can move to TESLIM_EDILDI or IPTAL", () => {
    expect(nextShipmentStatuses("YOLDA")).toEqual(["TESLIM_EDILDI", "IPTAL"]);
  });

  it("terminal states have no further transitions", () => {
    expect(nextShipmentStatuses("TESLIM_EDILDI")).toEqual([]);
    expect(nextShipmentStatuses("IPTAL")).toEqual([]);
  });

  it("rejects skipping straight from HAZIRLANIYOR to TESLIM_EDILDI", () => {
    expect(canTransitionShipment("HAZIRLANIYOR", "TESLIM_EDILDI")).toBe(false);
  });

  it("rejects moving out of a terminal state", () => {
    expect(canTransitionShipment("TESLIM_EDILDI", "YOLDA")).toBe(false);
  });
});
