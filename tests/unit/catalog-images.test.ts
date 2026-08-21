import { describe, expect, it } from "vitest";
import { catalogFallbackImage } from "@/content/catalog-images";

describe("catalogFallbackImage", () => {
  it("keeps an uploaded photo", () => {
    expect(catalogFallbackImage("Eski Kaşar", "/uploads/a.jpg")).toBe("/uploads/a.jpg");
  });

  it("maps eski and taze kasar to the kasar still-life", () => {
    expect(catalogFallbackImage("Eski Kaşar", null)).toBe("/products/kasar.jpg");
    expect(catalogFallbackImage("Taze Kaşar", null)).toBe("/products/kasar.jpg");
    expect(catalogFallbackImage("Kaşar", null)).toBe("/products/kasar.jpg");
  });

  it("matches category names that contain a known product family", () => {
    expect(catalogFallbackImage("Olgun Eski Kaşar", null)).toBe("/products/kasar.jpg");
    expect(catalogFallbackImage("Tam yağlı beyaz peynir", null)).toBe("/products/beyaz-peynir.jpg");
  });
});
