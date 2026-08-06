"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { setPostStatus, setRecipeStatus } from "@/infra/db/content";
import { prisma } from "@/infra/db/client";
import { slugifyTr } from "@/domain/catalog/slug";
import { estimateReadingMins } from "@/lib/content/reading";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) throw new Error("Yetkisiz");
}

export async function togglePostStatusAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  await setPostStatus(id, status);
  revalidatePath("/admin/icerikler");
  revalidatePath("/haberler");
}

export async function toggleRecipeStatusAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  await setRecipeStatus(id, status);
  revalidatePath("/admin/tarifler");
  revalidatePath("/tarifler");
}

export async function createPostAction(formData: FormData) {
  await requireStaff();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title) throw new Error("Başlık gerekli");
  let slug = slugifyTr(title);
  let n = 1;
  while (await prisma.contentPost.findUnique({ where: { slug } })) {
    slug = `${slugifyTr(title)}-${n++}`;
  }
  await prisma.contentPost.create({
    data: {
      title,
      slug,
      excerpt: String(formData.get("excerpt") ?? "").trim(),
      body,
      category: String(formData.get("category") ?? "genel"),
      readingMins: estimateReadingMins(body),
      status: "DRAFT",
    },
  });
  revalidatePath("/admin/icerikler");
}

export async function createRecipeAction(formData: FormData) {
  await requireStaff();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Başlık gerekli");
  let slug = slugifyTr(title);
  let n = 1;
  while (await prisma.recipe.findUnique({ where: { slug } })) {
    slug = `${slugifyTr(title)}-${n++}`;
  }
  const steps = String(formData.get("steps") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  await prisma.recipe.create({
    data: {
      title,
      slug,
      excerpt: String(formData.get("excerpt") ?? "").trim(),
      tips: String(formData.get("tips") ?? "").trim(),
      servings: Number(formData.get("servings") || 4),
      prepMinutes: Number(formData.get("prepMinutes") || 15),
      cookMinutes: Number(formData.get("cookMinutes") || 30),
      steps,
      ingredients: [],
      status: "DRAFT",
    },
  });
  revalidatePath("/admin/tarifler");
}
