"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { AttributeType } from "@/generated/prisma";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import {
  createAttributeDefinition,
  deleteAttributeDefinition,
  updateAttributeDefinition,
} from "@/infra/db/attributes";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
}

function parseOptions(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  return trimmed.split(",").map((s) => {
    const label = s.trim();
    return {
      label,
      value: label.toLocaleLowerCase("tr-TR").replace(/\s+/g, "-"),
    };
  });
}

function revalidateCatalog() {
  revalidatePath("/panel/nitelikler");
  revalidatePath("/panel/urunler");
  revalidatePath("/urunler");
}

export async function createAttributeAction(formData: FormData) {
  await requireStaff();
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "TEXT") as AttributeType;
  const optionsRaw = String(formData.get("options") ?? "");
  if (!name) throw new Error("Ad gerekli");
  await createAttributeDefinition({
    name,
    type,
    options: parseOptions(optionsRaw),
  });
  revalidateCatalog();
}

export async function updateAttributeAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "TEXT") as AttributeType;
  const optionsRaw = String(formData.get("options") ?? "");
  if (!id) throw new Error("Nitelik gerekli");
  if (!name) throw new Error("Ad gerekli");
  await updateAttributeDefinition({
    id,
    name,
    type,
    options: parseOptions(optionsRaw),
  });
  revalidateCatalog();
}

export async function deleteAttributeAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Nitelik gerekli");
  await deleteAttributeDefinition(id);
  revalidateCatalog();
}
