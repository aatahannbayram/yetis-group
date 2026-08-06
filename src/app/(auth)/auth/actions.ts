"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { dealerSignupSchema } from "@/domain/auth/dealer-signup";
import { auth } from "@/infra/auth/server";
import { attachDealerApplication } from "@/infra/db/dealers";

export type DealerRegisterState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

export async function completeDealerRegistrationAction(input: {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  city: string;
  channel: string;
  vergiNo?: string;
  note?: string;
}): Promise<DealerRegisterState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { ok: false, message: "Oturum bulunamadı. Tekrar giriş yapın." };
  }

  try {
    await attachDealerApplication({
      userId: session.user.id,
      companyName: input.companyName,
      contactName: input.contactName,
      phone: input.phone,
      email: input.email,
      city: input.city,
      channel: input.channel as "MARKET" | "SARKUTERI" | "HORECA" | "ARA_TOPTANCI",
      vergiNo: input.vergiNo,
      note: input.note,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Başvuru kaydı tamamlanamadı.";
    if (msg.includes("Unique constraint") || msg.includes("unique")) {
      return { ok: false, message: "Bu telefon veya e-posta zaten kayıtlı." };
    }
    return { ok: false, message: msg };
  }

  revalidatePath("/panel/bayiler");
  revalidatePath("/panel/bayi-adaylari");
  revalidatePath("/panel");

  return {
    ok: true,
    message: "Başvurunuz alındı. Onay sonrası fiyat listeniz açılır.",
  };
}

/** Validate signup payload on the server before authClient.signUp (client still creates the user). */
export async function validateDealerSignupAction(
  raw: Record<string, unknown>,
): Promise<DealerRegisterState> {
  const parsed = dealerSignupSchema.safeParse({
    ...raw,
    kvkkConsent: raw.kvkkConsent === true || raw.kvkkConsent === "on",
    contractConsent: raw.contractConsent === true || raw.contractConsent === "on",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, message: "Formu kontrol edin.", fieldErrors };
  }

  return { ok: true, message: "ok" };
}
