"use server";

import { revalidatePath } from "next/cache";
import { upsertPriceListItem } from "@/infra/db/pricing";

export async function updatePriceListItemAction(
  priceListId: string,
  variantId: string,
  priceKurus: number,
) {
  await upsertPriceListItem(priceListId, variantId, priceKurus);
  revalidatePath("/admin/fiyat-listeleri");
  revalidatePath("/urunler");
}
