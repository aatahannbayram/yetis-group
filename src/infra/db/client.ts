import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";
import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function createPrismaClient() {
  // Neon pooled connections reject startup `options=search_path`.
  // Qualify via SET on connect; Prisma still maps @@map table names.
  const pool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString: env.DATABASE_URL,
    });

  pool.on("connect", (client) => {
    void client.query("SET search_path TO public");
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
