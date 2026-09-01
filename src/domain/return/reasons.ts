export type ReturnReason =
  | "HATALI_URUN"
  | "HASARLI_GELDI"
  | "YANLIS_URUN"
  | "SKT_YAKIN_GECMIS"
  | "BAYI_FAZLA_SIPARIS"
  | "MUSTERI_IADESI"
  | "DIGER";

export const RETURN_REASON_LABEL: Record<ReturnReason, string> = {
  HATALI_URUN: "Hatalı ürün",
  HASARLI_GELDI: "Hasarlı geldi",
  YANLIS_URUN: "Yanlış ürün gönderildi",
  SKT_YAKIN_GECMIS: "SKT yakın / geçmiş",
  BAYI_FAZLA_SIPARIS: "Bayi fazla sipariş",
  MUSTERI_IADESI: "Müşteri iadesi",
  DIGER: "Diğer",
};

export const RETURN_REASONS = Object.keys(RETURN_REASON_LABEL) as ReturnReason[];

/** Reasons where the dealer must attach a photo of the defect/damage. */
export const PHOTO_REQUIRED_REASONS: ReadonlySet<ReturnReason> = new Set([
  "HASARLI_GELDI",
  "HATALI_URUN",
]);

export function isPhotoRequired(reason: ReturnReason): boolean {
  return PHOTO_REQUIRED_REASONS.has(reason);
}
