import { prisma } from "@/infra/db/client";

export async function listProducers() {
  return prisma.producer.findMany({ orderBy: { name: "asc" } });
}
