import type { Money } from "@/domain/money";

/**
 * TRY display with thousand dots (no comma).
 * Examples (kuruş → string):
 *   100_000_000 → "1.000.000 ₺"
 *   6_800 → "68 ₺"
 *   150_050 → "1.500.50 ₺"
 */
export function formatMoney(amount: Money): string {
  const negative = amount < 0;
  const absKurus = Math.abs(Math.trunc(amount));
  const whole = Math.floor(absKurus / 100);
  const kurus = absKurus % 100;
  const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const sign = negative ? "-" : "";
  if (kurus === 0) return `${sign}${grouped} ₺`;
  return `${sign}${grouped}.${String(kurus).padStart(2, "0")} ₺`;
}
