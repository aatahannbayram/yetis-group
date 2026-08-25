import { describe, expect, it } from "vitest";
import { catalogFallbackImage, SUCUK_PLACEHOLDER } from "@/content/catalog-images";

describe("catalogFallbackImage", () => {
  it("keeps an uploaded photo", () => {
    expect(catalogFallbackImage("Eski Kaşar", "/uploads/a.jpg")).toBe("/uploads/a.jpg");
  });

  it("maps cheese categories to the correct still-life", () => {
    expect(catalogFallbackImage("Eski Kaşar", null)).toBe("/products/kasar.jpg");
    expect(catalogFallbackImage("Taze Kaşar", null)).toBe("/products/kasar.jpg");
    expect(catalogFallbackImage("Beyaz Peynir", null)).toBe("/products/beyaz-peynir.jpg");
    expect(catalogFallbackImage("Tulum Peyniri", null)).toBe("/products/tulum.jpg");
  });

  it("uses sucuk placeholder only for şarküteri categories", () => {
    expect(catalogFallbackImage("Sucuk & Pastırma", null)).toBe(SUCUK_PLACEHOLDER);
    expect(catalogFallbackImage("Şarküteri", null)).toBe(SUCUK_PLACEHOLDER);
  });

  it("matches category names that contain a known product family", () => {
    expect(catalogFallbackImage("Olgun Eski Kaşar", null)).toBe("/products/kasar.jpg");
    expect(catalogFallbackImage("Tam yağlı beyaz peynir", null)).toBe("/products/beyaz-peynir.jpg");
  });
});
