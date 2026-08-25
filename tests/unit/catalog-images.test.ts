import { describe, expect, it } from "vitest";
import { catalogFallbackImage, KATALOG_PLACEHOLDER } from "@/content/catalog-images";

describe("catalogFallbackImage", () => {
  it("keeps an uploaded photo", () => {
    expect(catalogFallbackImage("Eski Kaşar", "/uploads/a.jpg")).toBe("/uploads/a.jpg");
  });

  it("maps peynir and kaşar families to catalog placeholder", () => {
    expect(catalogFallbackImage("Eski Kaşar", null)).toBe(KATALOG_PLACEHOLDER);
    expect(catalogFallbackImage("Taze Kaşar", null)).toBe(KATALOG_PLACEHOLDER);
    expect(catalogFallbackImage("Beyaz Peynir", null)).toBe(KATALOG_PLACEHOLDER);
  });

  it("keeps dedicated still-life assets where defined", () => {
    expect(catalogFallbackImage("Lor", null)).toBe("/products/lor.jpg");
    expect(catalogFallbackImage("Tulum", null)).toBe("/products/tulum.jpg");
  });

  it("matches category names that contain a known product family", () => {
    expect(catalogFallbackImage("Olgun Eski Kaşar", null)).toBe(KATALOG_PLACEHOLDER);
    expect(catalogFallbackImage("Tam yağlı beyaz peynir", null)).toBe(KATALOG_PLACEHOLDER);
  });
});
