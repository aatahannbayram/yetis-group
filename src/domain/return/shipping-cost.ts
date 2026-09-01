import type { ReturnReason } from "@/domain/return/reasons";

/**
 * Default kargo/nakliye masraf sorumluluğu, iade nedenine göre — staff onay
 * öncesi elle değiştirebilir, bu sadece makul bir varsayılan sağlar.
 * YG hatası sayılan nedenler → YETIS; bayi kaynaklı nedenler → BAYI.
 */
export function resolveShippingCostResponsibility(reason: ReturnReason): "YETIS" | "BAYI" {
  switch (reason) {
    case "HASARLI_GELDI":
    case "HATALI_URUN":
    case "YANLIS_URUN":
    case "SKT_YAKIN_GECMIS":
      return "YETIS";
    case "BAYI_FAZLA_SIPARIS":
    case "MUSTERI_IADESI":
    case "DIGER":
      return "BAYI";
  }
}
