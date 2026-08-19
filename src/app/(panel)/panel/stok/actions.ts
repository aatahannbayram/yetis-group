"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { addStockMovement, createLot } from "@/infra/db/inventory";
import { prisma } from "@/infra/db/client";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
}

async function slugForVariant(variantId: string) {
  const v = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { product: { select: { slug: true } } },
  });
  return v?.product.slug ?? null;
}

async function slugForLot(lotId: string) {
  const lot = await prisma.lot.findUnique({
    where: { id: lotId },
    select: { variant: { select: { product: { select: { slug: true } } } } },
  });
  return lot?.variant.product.slug ?? null;
}

function revalidateStock(slug: string | null) {
  revalidatePath("/panel/stok");
  revalidatePath("/panel");
  revalidatePath("/panel/sevkiyat");
  if (slug) {
    revalidatePath(`/panel/urunler/${slug}`);
    revalidatePath(`/urunler/${slug}`);
  }
  revalidatePath("/bayi/siparis");
  revalidatePath("/bayi/firsatlar");
}

export async function createLotFromStockAction(formData: FormData) {
  await requireStaff();
  const variantId = String(formData.get("variantId") ?? "").trim();
  const lotNumber = String(formData.get("lotNumber") ?? "").trim();
  const expirationDate = String(formData.get("expirationDate") ?? "").trim();
  const initialKg = Number(String(formData.get("initialKg") ?? "").replace(",", "."));

  if (!variantId) throw new Error("Varyant gerekli");
  if (!lotNumber) throw new Error("Lot no gerekli");
  if (!expirationDate) throw new Error("SKT gerekli");
  if (!Number.isFinite(initialKg) || initialKg <= 0) throw new Error("Geçerli kg girin");

  await createLot({
    variantId,
    lotNumber,
    expirationDate: new Date(expirationDate),
    initialKg,
  });
  revalidateStock(await slugForVariant(variantId));
}

export async function addStockMovementFromStockAction(formData: FormData) {
  await requireStaff();
  const lotId = String(formData.get("lotId") ?? "").trim();
  const type = String(formData.get("type") ?? "") as "GIRIS" | "CIKIS" | "FIRE";
  const quantityKg = Number(String(formData.get("quantityKg") ?? "").replace(",", "."));
  const note = String(formData.get("note") ?? "").trim() || undefined;

  if (!lotId) throw new Error("Lot gerekli");
  if (type !== "GIRIS" && type !== "CIKIS" && type !== "FIRE") throw new Error("Hareket tipi geçersiz");
  if (!Number.isFinite(quantityKg) || quantityKg <= 0) throw new Error("Geçerli kg girin");

  await addStockMovement({ lotId, type, quantityKg, note });
  revalidateStock(await slugForLot(lotId));
}
