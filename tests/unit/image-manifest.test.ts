import { describe, expect, it } from "vitest";
import { IMAGE_MANIFEST, listImageAssets } from "@/content/images";

describe("image manifesto", () => {
  it("has unique usedAt per slot", () => {
    const used = listImageAssets().map((a) => a.usedAt);
    expect(new Set(used).size).toBe(used.length);
  });

  it("ships no placeholder SVG slots in the live UI", () => {
    for (const asset of listImageAssets()) {
      expect(asset.isPlaceholder).toBe(false);
      expect(asset.src.startsWith("/placeholders/")).toBe(false);
      expect(asset.src.endsWith(".jpg") || asset.src.endsWith(".png") || asset.src.endsWith(".webp")).toBe(
        true,
      );
    }
  });

  it("exposes expected slot count", () => {
    expect(Object.keys(IMAGE_MANIFEST).length).toBe(34);
  });
});
