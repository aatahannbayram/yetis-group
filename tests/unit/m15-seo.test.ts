import { describe, expect, it } from "vitest";
import {
  acceptAllConsent,
  defaultConsent,
  parseConsent,
  rejectOptionalConsent,
} from "@/domain/seo/consent";
import {
  categoryMetaIssues,
  postMetaIssues,
  productMetaIssues,
} from "@/domain/seo/meta-report";

describe("consent", () => {
  it("defaults to no optional tracking", () => {
    const c = defaultConsent();
    expect(c.necessary).toBe(true);
    expect(c.analytics).toBe(false);
    expect(c.marketing).toBe(false);
  });

  it("accepts and rejects optional categories", () => {
    expect(acceptAllConsent().analytics).toBe(true);
    expect(acceptAllConsent().marketing).toBe(true);
    expect(rejectOptionalConsent().analytics).toBe(false);
    expect(rejectOptionalConsent().marketing).toBe(false);
  });

  it("rejects malformed stored consent", () => {
    expect(parseConsent({ necessary: true })).toBeNull();
    expect(
      parseConsent({
        necessary: true,
        analytics: true,
        marketing: false,
        updatedAt: "2026-08-06T00:00:00.000Z",
      }),
    ).not.toBeNull();
  });
});

describe("meta report", () => {
  it("flags products without image or short description", () => {
    const issue = productMetaIssues({
      id: "1",
      slug: "x",
      name: "Test",
      description: "kısa",
      imageUrl: null,
    });
    expect(issue?.issues).toEqual(
      expect.arrayContaining(["Kısa veya boş açıklama", "Görsel yok"]),
    );
  });

  it("flags categories missing SEO fields", () => {
    const issue = categoryMetaIssues({
      id: "1",
      slug: "sut",
      name: "Süt",
      metaTitle: null,
      metaDescription: null,
    });
    expect(issue?.issues.length).toBeGreaterThan(0);
  });

  it("passes healthy posts", () => {
    expect(
      postMetaIssues({
        id: "1",
        slug: "yazi",
        title: "Başlık",
        excerpt: "Bu yeterince uzun bir özet metnidir ve kırk karakteri geçer.",
        coverUrl: "/products/kasar.jpg",
      }),
    ).toBeNull();
  });
});
