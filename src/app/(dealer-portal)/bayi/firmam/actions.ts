"use server";

import { revalidatePath } from "next/cache";
import { resolveDealerContext } from "@/features/dealer/actions";
import { updateDealerContactInfo } from "@/infra/db/dealers";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function updateDealerProfileAction(formData: FormData) {
  const ctx = await resolveDealerContext();
  if (!ctx) throw new Error("Oturum bulunamadı");

  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const district = String(formData.get("district") ?? "").trim();
  const addressLine = String(formData.get("addressLine") ?? "").trim();

  if (email && !EMAIL_RE.test(email)) {
    throw new Error("Geçerli bir e-posta girin");
  }

  await updateDealerContactInfo(ctx.dealerId, {
    email: email || null,
    phone: phone || null,
    city: city || null,
    district: district || null,
    addressLine: addressLine || null,
  });

  revalidatePath("/bayi/firmam");
  revalidatePath("/panel/bayiler");
}
