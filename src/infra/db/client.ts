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
