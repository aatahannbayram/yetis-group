"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { createCategory, updateCategory } from "@/infra/db/categories";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
}

export async function createCategoryAction(formData: FormData) {
  await requireStaff();
  const name = String(formData.get("name") ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "").trim() || null;
  if (!name) throw new Error("Kategori adı gerekli");
  await createCategory({ name, parentId });
  revalidatePath("/panel/kategoriler");
  revalidatePath("/urunler");
}

export async function toggleCategoryAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (!id) throw new Error("id gerekli");
  await updateCategory(id, { active: !active });
  revalidatePath("/panel/kategoriler");
  revalidatePath("/urunler");
}
