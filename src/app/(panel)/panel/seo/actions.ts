"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { deleteRedirect, upsertRedirect } from "@/infra/db/seo";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
}

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function createRedirectAction(formData: FormData) {
  await requireStaff();
  await upsertRedirect({
    fromPath: str(formData, "fromPath"),
    toPath: str(formData, "toPath"),
    statusCode: Number(str(formData, "statusCode") || "301"),
    note: str(formData, "note"),
    active: formData.get("active") === "on",
  });
  revalidatePath("/panel/seo");
  revalidatePath("/api/seo/redirects");
}

export async function deleteRedirectAction(formData: FormData) {
  await requireStaff();
  const id = str(formData, "id");
  if (!id) return;
  await deleteRedirect(id);
  revalidatePath("/panel/seo");
  revalidatePath("/api/seo/redirects");
}
