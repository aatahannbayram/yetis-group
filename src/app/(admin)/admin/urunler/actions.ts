"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { updateVariantBasePrice } from "@/infra/db/pricing";
import { addStockMovement, createLot } from "@/infra/db/inventory";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { addProductMedia, deleteProductMedia, setPrimaryMedia } from "@/infra/db/media";
import { upsertProductAttributeValue } from "@/infra/db/attributes";
import { updateProductDescription } from "@/infra/db/products";
import { prisma } from "@/infra/db/client";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
}

export async function updateVariantPriceAction(variantId: string, priceKurus: number) {
  await updateVariantBasePrice(variantId, priceKurus);
  revalidatePath("/admin/urunler");
  revalidatePath("/urunler");
}

/** @deprecated use updateVariantPriceAction */
export async function updateProductPriceAction(variantId: string, priceKurus: number) {
  return updateVariantPriceAction(variantId, priceKurus);
}

export async function updateProductDescriptionAction(
  productId: string,
  slug: string,
  description: string,
) {
  await requireStaff();
  await updateProductDescription(productId, description);
  revalidatePath(`/admin/urunler/${slug}`);
  revalidatePath(`/urunler/${slug}`);
}

export async function createLotAction(
  variantId: string,
  slug: string,
  input: { lotNumber: string; expirationDate: string; initialKg: number },
) {
  await createLot({
    variantId,
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

export async function addMediaAction(formData: FormData) {
  await requireStaff();
  const productId = String(formData.get("productId") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  const slug = String(formData.get("slug") ?? "");
  if (!productId || !url) throw new Error("url gerekli");
  await addProductMedia({ productId, url });
  revalidatePath(`/admin/urunler/${slug}`);
  revalidatePath(`/urunler/${slug}`);
}

export async function deleteMediaAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  await deleteProductMedia(id);
  revalidatePath(`/admin/urunler/${slug}`);
  revalidatePath(`/urunler/${slug}`);
}

export async function setPrimaryMediaAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  await setPrimaryMedia(id);
  revalidatePath(`/admin/urunler/${slug}`);
  revalidatePath(`/urunler/${slug}`);
}

export async function saveProductDepthAction(formData: FormData) {
  await requireStaff();
  const productId = String(formData.get("productId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  await prisma.product.update({
    where: { id: productId },
    data: {
      storageCondition: String(formData.get("storageCondition") ?? "") || null,
      shelfLifeDays: Number(formData.get("shelfLifeDays") || 0) || null,
      requiresColdChain: formData.get("requiresColdChain") === "on",
      usageTips: String(formData.get("usageTips") ?? ""),
      techSheetUrl: String(formData.get("techSheetUrl") ?? "") || null,
    },
  });
  revalidatePath(`/admin/urunler/${slug}`);
  revalidatePath(`/urunler/${slug}`);
}

export async function saveAttributeValueAction(formData: FormData) {
  await requireStaff();
  const productId = String(formData.get("productId") ?? "");
  const attributeId = String(formData.get("attributeId") ?? "");
  const type = String(formData.get("type") ?? "");
  const slug = String(formData.get("slug") ?? "");

  if (type === "SELECT" || type === "MULTI_SELECT") {
    const optionIds = formData.getAll("optionIds").map(String);
    await upsertProductAttributeValue({
      productId,
      attributeId,
      optionIds: type === "SELECT" ? optionIds.slice(0, 1) : optionIds,
    });
  } else if (type === "BOOLEAN") {
    await upsertProductAttributeValue({
      productId,
      attributeId,
      valueBoolean: formData.get("valueBoolean") === "on",
    });
  } else if (type === "NUMBER") {
    await upsertProductAttributeValue({
      productId,
      attributeId,
      valueNumber: Number(formData.get("valueNumber") || 0),
    });
  } else {
    await upsertProductAttributeValue({
      productId,
      attributeId,
      valueText: String(formData.get("valueText") ?? ""),
    });
  }

  revalidatePath(`/admin/urunler/${slug}`);
  revalidatePath(`/urunler/${slug}`);
}
