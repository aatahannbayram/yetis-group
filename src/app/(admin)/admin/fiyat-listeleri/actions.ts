"use server";

import { revalidatePath } from "next/cache";
import { upsertPriceListItem } from "@/infra/db/pricing";

export async function updatePriceListItemAction(
  priceListId: string,
  productId: string,
  priceKurus: number,
) {
  await upsertPriceListItem(priceListId, productId, priceKurus);
  revalidatePath("/admin/fiyat-listeleri");
  revalidatePath("/urunler");
}
