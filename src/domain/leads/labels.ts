import type { LeadStage } from "@/domain/leads/stages";
import { LEAD_STAGES } from "@/domain/leads/stages";

/** Presentation labels — changing these never requires a DB migration. */
export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  YENI: "Yeni",
  ILETISIMDE: "İletişimde",
  NITELIKLI: "Nitelikli",
  NUMUNE: "Numune",
  NUMUNE_TEKLIF: "Numune / Teklif",
  TEKLIF: "Teklif",
  MUZAKERE: "Müzakere",
  KAZANILDI: "Kazanıldı",
  KAYBEDILDI: "Kaybedildi",
};

export const LEAD_CHANNEL_LABELS: Record<string, string> = {
  MARKET: "Market",
  SARKUTERI: "Şarküteri",
  HORECA: "HORECA",
  ARA_TOPTANCI: "Ara Toptancı",
};

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  ILETISIM_FORMU: "İletişim formu",
  BAYILIK_BASVURUSU: "Bayilik başvurusu",
  MALIYET_HESAPLAYICI: "Maliyet hesaplayıcı",
  BULTEN: "Bülten",
  WHATSAPP: "WhatsApp",
  NUMUNE_TALEBI: "Numune talebi",
  MANUEL: "Manuel",
};

export const LEAD_ACTIVITY_TYPES = [
  "ARAMA",
  "NOT",
  "TEKLIF",
  "TESLIMAT",
  "DURUM_DEGISIKLIGI",
  "EMAIL",
  "WHATSAPP",
  "FORM",
  "GOREV",
  "HATIRLATMA",
] as const;

export const LEAD_ACTIVITY_TYPE_LABELS: Record<(typeof LEAD_ACTIVITY_TYPES)[number], string> = {
  ARAMA: "Arama",
  NOT: "Not",
  TEKLIF: "Teklif",
  TESLIMAT: "Teslimat",
  DURUM_DEGISIKLIGI: "Durum Değişikliği",
  EMAIL: "E-posta",
  WHATSAPP: "WhatsApp",
  FORM: "Form",
  GOREV: "Görev",
  HATIRLATMA: "Hatırlatma",
};

export { LEAD_STAGES };
