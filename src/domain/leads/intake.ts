import { z } from "zod";

export const contactLeadSchema = z.object({
  companyName: z.string().trim().min(2, "Firma adı gerekli"),
  contactName: z.string().trim().min(2, "Yetkili adı gerekli"),
  phone: z.string().trim().min(10, "Telefon gerekli"),
  email: z.string().trim().email("Geçerli e-posta girin").optional().or(z.literal("")),
  city: z.string().trim().min(2, "Şehir gerekli"),
  channel: z.enum(["MARKET", "SARKUTERI", "HORECA", "ARA_TOPTANCI"]),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
  interestedCategoryId: z.string().optional().or(z.literal("")),
  kvkkConsent: z
    .boolean()
    .refine((v) => v === true, { message: "KVKK açık rızası zorunlu" }),
  source: z
    .enum([
      "ILETISIM_FORMU",
      "BAYILIK_BASVURUSU",
      "NUMUNE_TALEBI",
      "BULTEN",
    ])
    .default("ILETISIM_FORMU"),
  customFields: z.record(z.string(), z.string()).optional(),
});

export type ContactLeadInput = z.infer<typeof contactLeadSchema>;

export type SourceConversionRow = {
  source: string;
  label: string;
  total: number;
  won: number;
  lost: number;
  open: number;
  conversionRate: number;
};

export function computeSourceConversion(
  leads: { source: string; stage: string }[],
  labels: Record<string, string>,
): SourceConversionRow[] {
  const bySource = new Map<string, { total: number; won: number; lost: number; open: number }>();

  for (const lead of leads) {
    const row = bySource.get(lead.source) ?? { total: 0, won: 0, lost: 0, open: 0 };
    row.total += 1;
    if (lead.stage === "KAZANILDI") row.won += 1;
    else if (lead.stage === "KAYBEDILDI") row.lost += 1;
    else row.open += 1;
    bySource.set(lead.source, row);
  }

  return Array.from(bySource.entries())
    .map(([source, stats]) => ({
      source,
      label: labels[source] ?? source,
      ...stats,
      conversionRate: stats.total === 0 ? 0 : Math.round((stats.won / stats.total) * 1000) / 10,
    }))
    .sort((a, b) => b.total - a.total);
}
