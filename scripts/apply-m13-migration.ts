/**
 * Apply M13 migration with search_path=public (Neon pooler friendly).
 * Usage: npx tsx scripts/apply-m13-migration.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Pool } from "pg";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");

  const sqlPath = resolve(
    process.cwd(),
    "prisma/migrations/20260806003000_m13_attributes_media/migration.sql",
  );
  const sql = readFileSync(sqlPath, "utf8");

  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();
  try {
    await client.query("SET search_path TO public");
    await client.query("BEGIN");
    await client.query(sql);
    // Record in _prisma_migrations if table exists
    await client.query(`
      INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
      VALUES (
        gen_random_uuid()::text,
        'm13-attributes-media',
        NOW(),
        '20260806003000_m13_attributes_media',
        NULL,
        NULL,
        NOW(),
        1
      )
      ON CONFLICT DO NOTHING
    `).catch(() => {
      /* ignore if schema differs */
    });
    await client.query("COMMIT");
    console.log("M13 migration applied.");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
