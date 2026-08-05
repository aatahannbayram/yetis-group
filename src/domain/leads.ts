// Pure constants only — no Prisma/infra import. Safe for client components;
// importing anything from infra/db here would drag `pg` (Node-only) into
// the browser bundle (this is exactly what broke the leads board once).

export const LEAD_STAGES = [
  "YENI",
  "ILETISIMDE",
  "NUMUNE_TEKLIF",
  "MUZAKERE",
  "KAZANILDI",
  "KAYBEDILDI",
] as const;

export const LEAD_STAGE_LABELS: Record<(typeof LEAD_STAGES)[number], string> = {
  YENI: "Yeni",
  ILETISIMDE: "İletişimde",
  NUMUNE_TEKLIF: "Numune / Teklif",
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

export const LEAD_ACTIVITY_TYPES = ["ARAMA", "NOT", "TEKLIF", "TESLIMAT", "DURUM_DEGISIKLIGI"] as const;

export const LEAD_ACTIVITY_TYPE_LABELS: Record<(typeof LEAD_ACTIVITY_TYPES)[number], string> = {
  ARAMA: "Arama",
  NOT: "Not",
  TEKLIF: "Teklif",
  TESLIMAT: "Teslimat",
  DURUM_DEGISIKLIGI: "Durum Değişikliği",
};
