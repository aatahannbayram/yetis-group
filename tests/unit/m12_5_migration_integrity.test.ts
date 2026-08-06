import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Offline integrity snapshot checks against pre-migration backup JSON.
 * Live DB asserts are covered by the applied migration counts in CI notes;
 * this suite guards the backup artifact shape used for kayıpsızlık.
 */
describe("M12.5 pre-migration backup", () => {
  it("records baseline product/lot/price counts", () => {
    const path = resolve(process.cwd(), "backups/pre-m12_5-data.json");
    const snap = JSON.parse(readFileSync(path, "utf8")) as {
      counts: Record<string, number>;
      products: { id: string; sku: string; category: string; pricePerUnitKurus: number }[];
    };
    expect(snap.counts.product).toBe(8);
    expect(snap.counts.lot).toBe(17);
    expect(snap.counts.price_list_item).toBe(24);
    expect(snap.counts.lead).toBe(8);
    expect(snap.products.every((p) => p.sku && p.category)).toBe(true);
  });
});
