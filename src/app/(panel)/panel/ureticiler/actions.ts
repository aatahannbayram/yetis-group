"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { createProducer, updateProducer, deleteProducer } from "@/infra/db/producers";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
}

function readProducerFields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    region: String(formData.get("region") ?? "").trim() || null,
    productionMethod: String(formData.get("productionMethod") ?? "").trim() || null,
    geoIndication: String(formData.get("geoIndication") ?? "").trim() || null,
    imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
    story: String(formData.get("story") ?? "").trim(),
  };
}

export async function createProducerAction(formData: FormData) {
  await requireStaff();
  const fields = readProducerFields(formData);
  if (!fields.name) throw new Error("Üretici adı gerekli");
  await createProducer(fields);
  revalidatePath("/panel/ureticiler");
}

export async function updateProducerAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("id gerekli");
  const fields = readProducerFields(formData);
  if (!fields.name) throw new Error("Üretici adı gerekli");
  await updateProducer(id, fields);
  revalidatePath("/panel/ureticiler");
  revalidatePath("/panel/urunler");
}

export async function deleteProducerAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("id gerekli");
  await deleteProducer(id);
  revalidatePath("/panel/ureticiler");
}
