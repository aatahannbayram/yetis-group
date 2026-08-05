"use server";

import { revalidatePath } from "next/cache";
import { updateProductBasePrice } from "@/infra/db/pricing";
import { addStockMovement, createLot } from "@/infra/db/inventory";

export async function updateProductPriceAction(productId: string, priceKurus: number) {
  await updateProductBasePrice(productId, priceKurus);
  revalidatePath("/admin/urunler");
  revalidatePath("/urunler");
}

export async function createLotAction(
  productId: string,
  slug: string,
  input: { lotNumber: string; expirationDate: string; initialKg: number },
) {
  await createLot({
    productId,
    lotNumber: input.lotNumber,
    expirationDate: new Date(input.expirationDate),
    initialKg: input.initialKg,
  });
  revalidatePath(`/admin/urunler/${slug}`);
}

export async function addStockMovementAction(
  slug: string,
  input: { lotId: string; type: "GIRIS" | "CIKIS"; quantityKg: number; note?: string },
) {
  await addStockMovement(input);
  revalidatePath(`/admin/urunler/${slug}`);
}
