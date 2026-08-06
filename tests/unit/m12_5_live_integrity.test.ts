import { describe, expect, it } from "vitest";
import pg from "pg";
import "dotenv/config";

const url = process.env.DATABASE_URL;

describe.runIf(Boolean(url))("M12.5 live DB integrity", () => {
  it("keeps 1:1 variants and migrated FK counts", async () => {
    const pool = new pg.Pool({ connectionString: url });
    const client = await pool.connect();
    try {
      await client.query("SET search_path TO public");
      const r = await client.query(`
        SELECT
          (SELECT count(*)::int FROM product) AS products,
          (SELECT count(*)::int FROM product_variant) AS variants,
          (SELECT count(*)::int FROM lot) AS lots,
          (SELECT count(*)::int FROM price_list_item) AS pli,
          (SELECT count(*)::int FROM product_category) AS pc,
          (SELECT count(*)::int FROM dealer) AS dealers,
          (SELECT count(*)::int FROM lead) AS leads,
          (SELECT count(*)::int FROM product WHERE "primaryCategoryId" IS NULL) AS missing_primary,
          (SELECT sum("priceKurus")::bigint FROM price_list_item) AS price_sum
      `);
      const row = r.rows[0];
      expect(row.products).toBe(row.variants);
      expect(row.lots).toBe(17);
      expect(row.pli).toBe(24);
      expect(row.pc).toBeGreaterThanOrEqual(row.products);
      expect(Number(row.missing_primary)).toBe(0);
      expect(row.dealers).toBeGreaterThanOrEqual(2);
      expect(row.leads).toBe(8);

      const cols = await client.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema='public' AND table_name='product'
      `);
      const names = cols.rows.map((c: { column_name: string }) => c.column_name);
      expect(names).not.toContain("sku");
      expect(names).not.toContain("category");
      expect(names).not.toContain("pricePerUnitKurus");
      expect(names).not.toContain("kgPerUnit");
    } finally {
      client.release();
      await pool.end();
    }
  });
});
