export const LEAD_STAGES = [
  "YENI",
  "ILETISIMDE",
  "NITELIKLI",
  "NUMUNE",
  "NUMUNE_TEKLIF",
  "TEKLIF",
  "MUZAKERE",
  "KAZANILDI",
  "KAYBEDILDI",
] as const;

export type LeadStage = (typeof LEAD_STAGES)[number];
