import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";
import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function createPrismaClient() {
  // search_path is already "public" by default on this connection (verified
  // directly against Neon) - no post-connect SET needed. A prior version of
  // this fired `client.query()` on connect without awaiting it, which raced
  // against Prisma's own query on the same freshly-checked-out client
  // ("Calling client.query() when the client is already executing a query")
  // and could stall requests under load.
  const pool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString: env.DATABASE_URL,
      // Bounded + fail-fast: an unbounded pool with no connect timeout can
      // hang a request forever if connections pile up (e.g. across restarts
      // that don't cleanly release them back to a pooled endpoint like
      // Neon), which then reads as a stuck process to the host's watchdog
      // and triggers a restart loop instead of a clear, fast error.
      max: 10,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
    });

  if (env.NODE_ENV !== "production") {
    globalForPrisma.pgPool = pool;
  }
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

function getPrisma(): PrismaClient {
  const existing = globalForPrisma.prisma;
  // After `prisma generate`, HMR can keep a stale client without new delegates.
  if (existing && typeof (existing as { leadFieldDefinition?: unknown }).leadFieldDefinition !== "undefined") {
    return existing;
  }
  const client = createPrismaClient();
  if (env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getPrisma();
