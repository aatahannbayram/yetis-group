"use server";

import { revalidatePath } from "next/cache";
import { revalidateStoreCatalog } from "@/lib/cache/store-catalog";
import { headers } from "next/headers";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import {
  createCategory,
  deleteCategory,
  getCategoryProducts,
  updateCategory,
} from "@/infra/db/categories";

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
  revalidateStoreCatalog();
  revalidatePath("/urunler");
}

export async function toggleCategoryAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (!id) throw new Error("id gerekli");
  await updateCategory(id, { active: !active });
  revalidatePath("/panel/kategoriler");
  revalidateStoreCatalog();
  revalidatePath("/urunler");
}

export async function updateCategoryAction(id: string, name: string) {
  await requireStaff();
  const trimmed = name.trim();
  if (!id) throw new Error("id gerekli");
  if (!trimmed) throw new Error("Kategori adı gerekli");
  await updateCategory(id, { name: trimmed });
  revalidatePath("/panel/kategoriler");
  revalidateStoreCatalog();
  revalidatePath("/urunler");
}

export async function getCategoryProductsAction(categoryId: string) {
  await requireStaff();
  if (!categoryId) throw new Error("id gerekli");
  return getCategoryProducts(categoryId);
}

export async function deleteCategoryAction(id: string) {
  await requireStaff();
  if (!id) throw new Error("id gerekli");
  await deleteCategory(id);
  revalidatePath("/panel/kategoriler");
  revalidateStoreCatalog();
  revalidatePath("/urunler");
}
