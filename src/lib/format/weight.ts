import type { Kg } from "@/domain/weight";

const kgFormatter = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});

/** Renders a kg value with up to 3 decimals, e.g. kg(17) -> "17 kg", kg(0.5) -> "0,5 kg". */
export function formatKg(weight: Kg): string {
  return `${kgFormatter.format(weight.toNumber())} kg`;
}
