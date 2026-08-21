"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/infra/auth/server";
import { isStaffUser, updateUserPriceList } from "@/infra/db/users";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
}

export async function updateUserPriceListAction(userId: string, priceListId: string) {
  await requireStaff();
  await updateUserPriceList(userId, priceListId === "none" ? null : priceListId);
  revalidatePath("/panel/kullanicilar");
}
