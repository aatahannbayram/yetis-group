import { describe, expect, it } from "vitest";
import {
  canAccessPanelPath,
  effectiveStaffRole,
  hasFullPanelAccess,
  isPlasiyerRole,
} from "@/domain/staff/roles";

describe("staff roles", () => {
  it("treats STAFF without staffRole as YONETICI", () => {
    expect(effectiveStaffRole("STAFF", null)).toBe("YONETICI");
    expect(effectiveStaffRole("DEALER", null)).toBeNull();
  });

  it("restricts plasiyer panel paths", () => {
    expect(isPlasiyerRole("PLASIYER")).toBe(true);
    expect(hasFullPanelAccess("PLASIYER")).toBe(false);
    expect(canAccessPanelPath("/panel", "PLASIYER")).toBe(true);
    expect(canAccessPanelPath("/panel/bayiler", "PLASIYER")).toBe(true);
    expect(canAccessPanelPath("/panel/rota/abc", "PLASIYER")).toBe(true);
    expect(canAccessPanelPath("/panel/urunler", "PLASIYER")).toBe(false);
    expect(canAccessPanelPath("/panel/kullanicilar", "PLASIYER")).toBe(false);
    expect(canAccessPanelPath("/panel/plasiyerler", "PLASIYER")).toBe(false);
  });

  it("allows full panel for yonetici", () => {
    expect(canAccessPanelPath("/panel/urunler", "YONETICI")).toBe(true);
    expect(hasFullPanelAccess("YONETICI")).toBe(true);
  });
});
