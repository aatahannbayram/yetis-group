import { describe, expect, it } from "vitest";
import {
  assertLeadTransition,
  isTransitionAllowed,
  planPromoteLeadToDealer,
  PromoteLeadError,
} from "@/domain/leads";

describe("assertLeadTransition", () => {
  it("allows configured edges", () => {
    const result = assertLeadTransition({ from: "YENI", to: "ILETISIMDE" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.promoteToDealer).toBe(false);
  });

  it("is idempotent for same stage", () => {
    const result = assertLeadTransition({ from: "TEKLIF", to: "TEKLIF" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.promoteToDealer).toBe(false);
  });

  it("rejects illegal transitions", () => {
    const result = assertLeadTransition({ from: "YENI", to: "KAZANILDI" });
    expect(result.ok).toBe(false);
  });

  it("requires lostReason for KAYBEDILDI", () => {
    const missing = assertLeadTransition({ from: "ILETISIMDE", to: "KAYBEDILDI" });
    expect(missing.ok).toBe(false);
    const ok = assertLeadTransition({
      from: "ILETISIMDE",
      to: "KAYBEDILDI",
      lostReason: "Bütçe",
    });
    expect(ok.ok).toBe(true);
  });

  it("flags promote on KAZANILDI", () => {
    const result = assertLeadTransition({ from: "TEKLIF", to: "KAZANILDI" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.promoteToDealer).toBe(true);
  });
});

describe("isTransitionAllowed", () => {
  it("keeps MUZAKERE as a valid stage", () => {
    expect(isTransitionAllowed("TEKLIF", "MUZAKERE")).toBe(true);
    expect(isTransitionAllowed("MUZAKERE", "KAZANILDI")).toBe(true);
  });
});

describe("planPromoteLeadToDealer", () => {
  it("activates existing self-serve dealer when already converted", () => {
    const plan = planPromoteLeadToDealer({
      leadId: "l1",
      companyName: "Test",
      channel: "HORECA",
      alreadyConvertedDealerId: "d1",
      stage: "KAZANILDI",
    });
    expect(plan).toEqual({ action: "activate", dealerId: "d1" });
  });

  it("creates HORECA dealer for HORECA channel", () => {
    const plan = planPromoteLeadToDealer({
      leadId: "l1",
      companyName: "Liman",
      channel: "HORECA",
      alreadyConvertedDealerId: null,
      stage: "KAZANILDI",
    });
    expect(plan.action).toBe("create");
    if (plan.action === "create") expect(plan.dealerType).toBe("HORECA");
  });

  it("throws when stage is not KAZANILDI", () => {
    expect(() =>
      planPromoteLeadToDealer({
        leadId: "l1",
        companyName: "X",
        channel: "SARKUTERI",
        alreadyConvertedDealerId: null,
        stage: "YENI",
      }),
    ).toThrow(PromoteLeadError);
  });
});
