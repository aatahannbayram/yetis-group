"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  createPriceList,
  fillPriceListFromCatalog,
  upsertPriceListItem,
} from "@/infra/db/pricing";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
}

export async function updatePriceListItemAction(
  priceListId: string,
  variantId: string,
  priceKurus: number,
) {
  await requireStaff();
  await upsertPriceListItem(priceListId, variantId, priceKurus);
  revalidatePath("/panel/fiyat-listeleri");
  revalidatePath("/panel/urunler");
  revalidatePath("/urunler");
}

export async function createPriceListAction(formData: FormData) {
  await requireStaff();
  const name = String(formData.get("name") ?? "").trim();
  await createPriceList({ name });
  revalidatePath("/panel/fiyat-listeleri");
  revalidatePath("/panel/urunler");
}

export async function fillPriceListAction(formData: FormData) {
  await requireStaff();
  const priceListId = String(formData.get("priceListId") ?? "").trim();
  if (!priceListId) throw new Error("Liste gerekli");
  const result = await fillPriceListFromCatalog(priceListId);
  revalidatePath("/panel/fiyat-listeleri");
  revalidatePath("/panel/urunler");
  return result;
}

export async function addVariantToPriceListAction(formData: FormData) {
  await requireStaff();
  const priceListId = String(formData.get("priceListId") ?? "").trim();
  const variantId = String(formData.get("variantId") ?? "").trim();
  const priceTl = Number(String(formData.get("priceTl") ?? "").replace(",", "."));
  if (!priceListId || !variantId) throw new Error("Liste ve varyant gerekli");
  if (!Number.isFinite(priceTl) || priceTl < 0) throw new Error("Geçerli bir fiyat girin");
  await upsertPriceListItem(priceListId, variantId, Math.round(priceTl * 100));
  revalidatePath("/panel/fiyat-listeleri");
  revalidatePath("/panel/urunler");
  revalidatePath("/urunler");
  return { ok: true as const };
}
