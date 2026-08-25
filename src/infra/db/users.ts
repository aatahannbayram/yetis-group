import { prisma } from "@/infra/db/client";
import {
  effectiveStaffRole,
  isPlasiyerRole,
  type StaffRole,
} from "@/domain/staff/roles";

export async function isStaffUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { accountType: true },
  });
  return user?.accountType === "STAFF";
}

export async function getStaffProfile(userId: string): Promise<{
  isStaff: boolean;
  staffRole: StaffRole | null;
  isPlasiyer: boolean;
} | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { accountType: true, staffRole: true },
  });
  if (!user) return null;
  const staffRole = effectiveStaffRole(user.accountType, user.staffRole);
  return {
    isStaff: user.accountType === "STAFF",
    staffRole,
    isPlasiyer: isPlasiyerRole(staffRole),
  };
}

export async function getUsersWithPriceList() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      priceList: { select: { id: true, name: true } },
      dealer: { select: { id: true, unvan: true, status: true } },
    },
  });
}

export async function updateUserPriceList(userId: string, priceListId: string | null) {
  return prisma.user.update({ where: { id: userId }, data: { priceListId } });
}

export async function getUserDealerId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dealerId: true },
  });
  return user?.dealerId ?? null;
}
