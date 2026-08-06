"use server";

import { revalidatePath } from "next/cache";
import { updateUserPriceList } from "@/infra/db/users";

export async function updateUserPriceListAction(userId: string, priceListId: string) {
  await updateUserPriceList(userId, priceListId === "none" ? null : priceListId);
  revalidatePath("/panel/kullanicilar");
}
