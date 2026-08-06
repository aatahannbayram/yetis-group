import { prisma } from "@/infra/db/client";

export async function listDealers() {
  return prisma.dealer.findMany({
    orderBy: { unvan: "asc" },
    include: {
      priceList: true,
      roles: { include: { user: { select: { id: true, name: true, email: true } } } },
      fromLeads: { select: { id: true, companyName: true } },
    },
  });
}

export async function getDealerById(id: string) {
  return prisma.dealer.findUnique({
    where: { id },
    include: {
      priceList: true,
      roles: { include: { user: true } },
      fromLeads: true,
    },
  });
}
