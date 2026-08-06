import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Pool } from "pg";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");
  const sql = readFileSync(
    resolve(process.cwd(), "prisma/migrations/20260806020000_m15_seo/migration.sql"),
    "utf8",
  );
  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();
  try {
    await client.query("SET search_path TO public");
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("M15 migration applied.");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
