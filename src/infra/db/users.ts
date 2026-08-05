import { prisma } from "@/infra/db/client";

export async function isStaffUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { accountType: true } });
  return user?.accountType === "STAFF";
}

export async function getUsersWithPriceList() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { priceList: { select: { id: true, name: true } } },
  });
}

export async function updateUserPriceList(userId: string, priceListId: string | null) {
  return prisma.user.update({ where: { id: userId }, data: { priceListId } });
}
