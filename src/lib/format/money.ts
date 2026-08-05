import type { Money } from "@/domain/money";

const tryFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Renders a kuruş amount as a TRY string, e.g. money(150050) -> "1.500,50 ₺". */
export function formatMoney(amount: Money): string {
  return tryFormatter.format(amount / 100);
}
