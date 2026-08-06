"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { AttributeType } from "@/generated/prisma";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { createAttributeDefinition } from "@/infra/db/attributes";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
}

export async function createAttributeAction(formData: FormData) {
  await requireStaff();
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "TEXT") as AttributeType;
  const optionsRaw = String(formData.get("options") ?? "").trim();
  if (!name) throw new Error("Ad gerekli");
  const options = optionsRaw
    ? optionsRaw.split(",").map((s) => {
        const label = s.trim();
        return { label, value: label.toLocaleLowerCase("tr-TR").replace(/\s+/g, "-") };
      })
    : [];
  await createAttributeDefinition({ name, type, options });
  revalidatePath("/panel/nitelikler");
}
