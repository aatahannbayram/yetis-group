import { describe, expect, it } from "vitest";
import { isPublishedAnnouncement, safeSiteHref } from "@/domain/campaigns/live";

const now = new Date("2026-08-21T12:00:00.000Z");

describe("isPublishedAnnouncement", () => {
  it("publishes active duyuru in window", () => {
    expect(
      isPublishedAnnouncement(
        {
          active: true,
          kind: "DUYURU",
          startDate: new Date("2026-08-18T00:00:00.000Z"),
          endDate: new Date("2026-08-28T00:00:00.000Z"),
        },
        now,
      ),
    ).toBe(true);
  });

  it("hides kampanya and inactive rows", () => {
    expect(
      isPublishedAnnouncement(
        { active: true, kind: "KAMPANYA", startDate: null, endDate: null },
        now,
      ),
    ).toBe(false);
    expect(
      isPublishedAnnouncement(
        { active: false, kind: "DUYURU", startDate: null, endDate: null },
        now,
      ),
    ).toBe(false);
  });
});

describe("safeSiteHref", () => {
  it("allows internal paths only", () => {
    expect(safeSiteHref("/urunler")).toBe("/urunler");
    expect(safeSiteHref("//evil.test")).toBe("/urunler");
    expect(safeSiteHref("https://evil.test")).toBe("/urunler");
    expect(safeSiteHref(null)).toBe("/urunler");
  });
});
