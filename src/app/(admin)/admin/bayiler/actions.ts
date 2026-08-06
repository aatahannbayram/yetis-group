"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { createDealer, updateDealer, type DealerInput } from "@/infra/db/dealers";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
}

function readDealerInput(formData: FormData): DealerInput {
  const num = (key: string) => {
    const raw = String(formData.get(key) ?? "").trim();
    return raw ? Number(raw) : null;
  };
  const str = (key: string) => {
    const raw = String(formData.get(key) ?? "").trim();
    return raw || null;
  };
  const tlToKurus = (key: string) => {
    const raw = String(formData.get(key) ?? "").trim();
    return raw ? Math.round(Number(raw) * 100) : null;
  };

  return {
    unvan: String(formData.get("unvan") ?? "").trim(),
    dealerType: formData.get("dealerType") as DealerInput["dealerType"],
    status: formData.get("status") as DealerInput["status"],
    vergiNo: str("vergiNo"),
    vergiDairesi: str("vergiDairesi"),
    membershipTier: str("membershipTier"),
    creditLimitKurus: tlToKurus("creditLimitTl"),
    paymentTermDays: num("paymentTermDays"),
    deliveryZoneCode: str("deliveryZoneCode"),
    priceListId: str("priceListId"),
    salesRepId: str("salesRepId"),
  };
}

export async function createDealerAction(formData: FormData) {
  await requireStaff();
  const input = readDealerInput(formData);
  if (!input.unvan) throw new Error("Ünvan gerekli");
  await createDealer(input);
  revalidatePath("/admin/bayiler");
}

export async function updateDealerAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Bayi bulunamadı");
  const input = readDealerInput(formData);
  if (!input.unvan) throw new Error("Ünvan gerekli");
  await updateDealer(id, input);
  revalidatePath("/admin/bayiler");
}
