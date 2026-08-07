"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { addLedgerEntry } from "@/infra/db/ledger";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
}

export async function addPaymentAction(formData: FormData) {
  await requireStaff();
  const dealerId = String(formData.get("dealerId") ?? "");
  const amountTl = Number(formData.get("amountTl") ?? 0);
  const description = String(formData.get("description") ?? "").trim() || "Tahsilat";

  if (!dealerId) throw new Error("Bayi seçimi gerekli");
  if (!Number.isFinite(amountTl) || amountTl <= 0) throw new Error("Tutar pozitif olmalı");

  await addLedgerEntry({
    dealerId,
    type: "ODEME",
    amountKurus: Math.round(amountTl * 100),
    description,
  });
  revalidatePath("/panel/tahsilat");
  revalidatePath("/panel/cari");
}
