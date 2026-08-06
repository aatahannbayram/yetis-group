import { type Kg, compare, subtract, zeroKg } from "@/domain/weight";

export class InventoryError extends Error {}

export type LotSummary = {
  id: string;
  lotNumber: string;
  expirationDate: Date;
  availableKg: Kg;
};

export function isLotExpired(expirationDate: Date, asOf: Date = new Date()): boolean {
  return expirationDate.getTime() < asOf.getTime();
}

/** SKT'si geçmiş lot hiçbir zaman sevk edilemez - non-negotiable domain kuralı. */
export function assertNotExpired(
  lot: { lotNumber: string; expirationDate: Date },
  asOf: Date = new Date(),
) {
  if (isLotExpired(lot.expirationDate, asOf)) {
    throw new InventoryError(
      `${lot.lotNumber} lotunun son kullanma tarihi geçmiş, sevk edilemez.`,
    );
  }
}

/** FEFO: en erken SKT'li lot önce. Süresi geçmiş lotlar listeye hiç girmez. */
export function sortLotsByFefo(lots: LotSummary[], asOf: Date = new Date()): LotSummary[] {
  return lots
    .filter((lot) => !isLotExpired(lot.expirationDate, asOf))
    .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime());
}

export type FefoAllocation = { lotId: string; lotNumber: string; quantityKg: Kg };

/**
 * Talep edilen miktarı FEFO sırasıyla (en erken SKT'li, stoklu, süresi
 * geçmemiş) lotlardan karşılar. Stok yetmezse hata fırlatır - kısmi/sessiz
 * eksik sevkiyat önerisi üretmez.
 */
export function suggestFefoShipment(
  lots: LotSummary[],
  requiredKg: Kg,
  asOf: Date = new Date(),
): FefoAllocation[] {
  const ordered = sortLotsByFefo(lots, asOf).filter((lot) => compare(lot.availableKg, zeroKg) > 0);
  const allocations: FefoAllocation[] = [];
  let remaining = requiredKg;

  for (const lot of ordered) {
    if (compare(remaining, zeroKg) <= 0) break;
    const take = compare(lot.availableKg, remaining) < 0 ? lot.availableKg : remaining;
    allocations.push({ lotId: lot.id, lotNumber: lot.lotNumber, quantityKg: take });
    remaining = subtract(remaining, take);
  }

  if (compare(remaining, zeroKg) > 0) {
    throw new InventoryError(`Yeterli stok yok: ${remaining.toString()} kg eksik.`);
  }

  return allocations;
}
