import { z } from "zod";

export const dealerSignupSchema = z
  .object({
    companyName: z.string().trim().min(2, "Firma adı gerekli"),
    contactName: z.string().trim().min(2, "Yetkili adı gerekli"),
    phone: z.string().trim().min(10, "Telefon gerekli"),
    email: z.string().trim().email("Geçerli e-posta girin"),
    city: z.string().trim().min(2, "Şehir gerekli"),
    channel: z.enum(["MARKET", "SARKUTERI", "HORECA", "ARA_TOPTANCI"]),
    password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
    passwordConfirm: z.string().min(8, "Şifre tekrarı gerekli"),
    vergiNo: z.string().trim().max(20).optional().or(z.literal("")),
    note: z.string().trim().max(2000).optional().or(z.literal("")),
    kvkkConsent: z
      .boolean()
      .refine((v) => v === true, { message: "KVKK açık rızası zorunlu" }),
    contractConsent: z
      .boolean()
      .refine((v) => v === true, { message: "Bayi üyelik sözleşmesi onayı zorunlu" }),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Şifreler eşleşmiyor",
    path: ["passwordConfirm"],
  });

export type DealerSignupInput = z.infer<typeof dealerSignupSchema>;

/** Maps CRM channel → Dealer.dealerType for BASVURU orgs (not auto-approved). */
export function dealerTypeFromChannel(
  channel: DealerSignupInput["channel"],
): "BAYI" | "HORECA" | "ZINCIR" | "ARA_TOPTANCI" {
  if (channel === "HORECA") return "HORECA";
  if (channel === "ARA_TOPTANCI") return "ARA_TOPTANCI";
  if (channel === "MARKET") return "ZINCIR";
  return "BAYI";
}
