import { describe, expect, it } from "vitest";
import {
  assertReturnTransition,
  isReturnTransitionAllowed,
  nextReturnStatuses,
  returnStockEffectOnTransition,
} from "@/domain/return/state-machine";

describe("assertReturnTransition", () => {
  it("allows configured edges", () => {
    expect(assertReturnTransition({ from: "OLUSTURULDU", to: "INCELENIYOR" }).ok).toBe(true);
  });

  it("is idempotent for same status", () => {
    expect(assertReturnTransition({ from: "ONAYLANDI", to: "ONAYLANDI" }).ok).toBe(true);
  });

  it("rejects skipping stages", () => {
    expect(assertReturnTransition({ from: "OLUSTURULDU", to: "KONTROL_EDILDI" }).ok).toBe(false);
  });

  it("requires a reject reason for REDDEDILDI", () => {
    const missing = assertReturnTransition({ from: "INCELENIYOR", to: "REDDEDILDI" });
    expect(missing.ok).toBe(false);
    const ok = assertReturnTransition({
      from: "INCELENIYOR",
      to: "REDDEDILDI",
      rejectReason: "Fatura süresi geçmiş",
    });
    expect(ok.ok).toBe(true);
  });

  it("only allows IPTAL before ONAYLANDI", () => {
    expect(isReturnTransitionAllowed("OLUSTURULDU", "IPTAL")).toBe(true);
    expect(isReturnTransitionAllowed("INCELENIYOR", "IPTAL")).toBe(true);
    expect(isReturnTransitionAllowed("ONAYLANDI", "IPTAL")).toBe(false);
  });

  it("rejects moving out of a terminal state", () => {
    expect(isReturnTransitionAllowed("KAPANDI", "FATURALANDI")).toBe(false);
    expect(isReturnTransitionAllowed("REDDEDILDI", "ONAYLANDI")).toBe(false);
  });

  it("lists next statuses", () => {
    expect(nextReturnStatuses("INCELENIYOR")).toEqual(["ONAYLANDI", "REDDEDILDI", "IPTAL"]);
    expect(nextReturnStatuses("KAPANDI")).toEqual([]);
  });
});

describe("returnStockEffectOnTransition", () => {
  it("splits stock only at KONTROL_EDILDI", () => {
    expect(returnStockEffectOnTransition("URUN_TESLIM_ALINDI", "KONTROL_EDILDI")).toBe("split");
  });

  it("does not touch stock on any other transition", () => {
    expect(returnStockEffectOnTransition("OLUSTURULDU", "INCELENIYOR")).toBe("none");
    expect(returnStockEffectOnTransition("ONAYLANDI", "URUN_TESLIM_ALINDI")).toBe("none");
    expect(returnStockEffectOnTransition("KONTROL_EDILDI", "FATURALANDI")).toBe("none");
  });
});
