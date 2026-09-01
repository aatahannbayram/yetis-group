import { describe, expect, it } from "vitest";
import {
  assertSampleTransition,
  isSampleTransitionAllowed,
  nextSampleStatuses,
  sampleStockEffectOnTransition,
} from "@/domain/sample/state-machine";

describe("assertSampleTransition", () => {
  it("allows configured edges", () => {
    expect(assertSampleTransition({ from: "TALEP_EDILDI", to: "INCELENIYOR" }).ok).toBe(true);
  });

  it("is idempotent for same status", () => {
    expect(assertSampleTransition({ from: "ONAYLANDI", to: "ONAYLANDI" }).ok).toBe(true);
  });

  it("rejects skipping stages", () => {
    expect(assertSampleTransition({ from: "TALEP_EDILDI", to: "SEVK_EDILDI" }).ok).toBe(false);
  });

  it("requires a reject reason for REDDEDILDI", () => {
    const missing = assertSampleTransition({ from: "INCELENIYOR", to: "REDDEDILDI" });
    expect(missing.ok).toBe(false);
    const ok = assertSampleTransition({
      from: "INCELENIYOR",
      to: "REDDEDILDI",
      rejectReason: "Stok yetersiz",
    });
    expect(ok.ok).toBe(true);
  });

  it("only allows IPTAL before ONAYLANDI", () => {
    expect(isSampleTransitionAllowed("TALEP_EDILDI", "IPTAL")).toBe(true);
    expect(isSampleTransitionAllowed("INCELENIYOR", "IPTAL")).toBe(true);
    expect(isSampleTransitionAllowed("ONAYLANDI", "IPTAL")).toBe(false);
    expect(isSampleTransitionAllowed("HAZIRLANIYOR", "IPTAL")).toBe(false);
  });

  it("rejects moving out of a terminal state", () => {
    expect(isSampleTransitionAllowed("TESLIM_EDILDI", "SEVK_EDILDI")).toBe(false);
    expect(isSampleTransitionAllowed("REDDEDILDI", "ONAYLANDI")).toBe(false);
    expect(isSampleTransitionAllowed("IPTAL", "TALEP_EDILDI")).toBe(false);
  });

  it("lists next statuses", () => {
    expect(nextSampleStatuses("INCELENIYOR")).toEqual(["ONAYLANDI", "REDDEDILDI", "IPTAL"]);
    expect(nextSampleStatuses("TESLIM_EDILDI")).toEqual([]);
  });
});

describe("sampleStockEffectOnTransition", () => {
  it("consumes stock only when shipped", () => {
    expect(sampleStockEffectOnTransition("HAZIRLANIYOR", "SEVK_EDILDI")).toBe("consume");
  });

  it("does not touch stock on any other transition", () => {
    expect(sampleStockEffectOnTransition("TALEP_EDILDI", "INCELENIYOR")).toBe("none");
    expect(sampleStockEffectOnTransition("INCELENIYOR", "ONAYLANDI")).toBe("none");
    expect(sampleStockEffectOnTransition("ONAYLANDI", "HAZIRLANIYOR")).toBe("none");
    expect(sampleStockEffectOnTransition("SEVK_EDILDI", "TESLIM_EDILDI")).toBe("none");
    expect(sampleStockEffectOnTransition("ONAYLANDI", "ONAYLANDI")).toBe("none");
  });
});
