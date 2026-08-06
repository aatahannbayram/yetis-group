import { describe, expect, it } from "vitest";
import { estimateReadingMins } from "@/lib/content/reading";
import { seedPosts, seedRecipes } from "@/content/seed-posts";

describe("M14 content seed", () => {
  it("has 8 published-ready posts with AEO length", () => {
    expect(seedPosts).toHaveLength(8);
    for (const post of seedPosts) {
      const words = post.body.trim().split(/\s+/).length;
      expect(words).toBeGreaterThanOrEqual(750);
      expect(post.body).toContain("## ");
      expect(post.body.toLocaleLowerCase("tr-TR")).toContain("sık sorulan");
      expect(post.slug.length).toBeGreaterThan(3);
    }
  });

  it("has 4 recipes with steps and ingredients", () => {
    expect(seedRecipes).toHaveLength(4);
    for (const recipe of seedRecipes) {
      expect(recipe.steps.length).toBeGreaterThan(0);
      expect(recipe.ingredients.length).toBeGreaterThan(0);
    }
  });

  it("estimates reading minutes", () => {
    expect(estimateReadingMins("kelime ".repeat(400))).toBe(3);
    expect(estimateReadingMins("kelime ".repeat(1000))).toBe(5);
  });
});