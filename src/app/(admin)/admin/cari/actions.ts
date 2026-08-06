"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { addLedgerEntry, reverseLedgerEntry } from "@/infra/db/ledger";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
}

export async function addLedgerEntryAction(formData: FormData) {
  await requireStaff();
  const dealerId = String(formData.get("dealerId") ?? "");
  const type = formData.get("type") === "ODEME" ? "ODEME" : "BORC";
  const amountTl = Number(formData.get("amountTl") ?? 0);
  const description = String(formData.get("description") ?? "").trim();

  if (!dealerId) throw new Error("Bayi gerekli");
  if (!description) throw new Error("Açıklama gerekli");

  await addLedgerEntry({
    dealerId,
    type,
    amountKurus: Math.round(amountTl * 100),
    description,
  });
  revalidatePath("/admin/cari");
}

export async function reverseLedgerEntryAction(formData: FormData) {
  await requireStaff();
  const entryId = String(formData.get("entryId") ?? "");
  if (!entryId) throw new Error("Kayıt bulunamadı");
  await reverseLedgerEntry(entryId);
  revalidatePath("/admin/cari");
}
