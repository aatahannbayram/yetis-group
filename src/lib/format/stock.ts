/** Storefront / dealer stock availability copy (shippable kg). */

export type StockTone = "ok" | "low" | "empty";

export function stockTone(kg: number): StockTone {
  if (kg <= 0) return "empty";
  if (kg < 50) return "low";
  return "ok";
}

const kgFmt = new Intl.NumberFormat("tr-TR", {
  maximumFractionDigits: 1,
});

export function formatStockKg(kg: number): string {
  return `${kgFmt.format(kg)} kg`;
}

/** Short label for cards (guest-safe: no exact kg required for empty). */
export function stockAvailabilityLabel(kg: number): string {
  const tone = stockTone(kg);
  if (tone === "empty") return "Stok yok";
  if (tone === "low") return `Sınırlı · ${formatStockKg(kg)}`;
  return `Stokta · ${formatStockKg(kg)}`;
}
