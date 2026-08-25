import { describe, expect, it } from "vitest";
import { buildCatalogFilterGroups, findFilterGroup } from "@/domain/catalog/filter-groups";

describe("buildCatalogFilterGroups", () => {
  it("groups children under parent and sums counts", () => {
    const groups = buildCatalogFilterGroups([
      { slug: "peynir", name: "Peynir", parentSlug: null, count: 0 },
      { slug: "beyaz-peynir", name: "Beyaz Peynir", parentSlug: "peynir", count: 12 },
      { slug: "kasar", name: "Kaşar Peyniri", parentSlug: "peynir", count: 8 },
      { slug: "lor", name: "Lor", parentSlug: null, count: 3 },
    ]);

    expect(groups).toHaveLength(2);
    const peynir = groups.find((g) => g.slug === "peynir");
    expect(peynir?.count).toBe(20);
    expect(peynir?.children).toHaveLength(2);
    expect(groups.find((g) => g.slug === "lor")?.count).toBe(3);
  });

  it("keeps orphan categories without parent in list", () => {
    const groups = buildCatalogFilterGroups([
      { slug: "beyaz-peynir", name: "Beyaz Peynir", parentSlug: null, count: 5 },
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.count).toBe(5);
  });

  it("finds active group and child", () => {
    const groups = buildCatalogFilterGroups([
      { slug: "peynir", name: "Peynir", parentSlug: null, count: 0 },
      { slug: "beyaz-peynir", name: "Beyaz Peynir", parentSlug: "peynir", count: 4 },
    ]);
    expect(findFilterGroup(groups, "beyaz-peynir")?.activeChild?.name).toBe("Beyaz Peynir");
    expect(findFilterGroup(groups, "peynir")?.activeChild).toBeNull();
  });
});
