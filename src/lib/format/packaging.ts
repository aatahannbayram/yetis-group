import { kg } from "@/domain/weight";
import { formatKg } from "@/lib/format/weight";

export const PACKAGING_OPTIONS = [
  { value: "TENEKE", label: "Teneke" },
  { value: "VAKUM", label: "Vakum" },
  { value: "KOLI", label: "Koli" },
  { value: "KUTU", label: "Kutu" },
  { value: "DOKME", label: "Dökme" },
] as const;

export const PACKAGING_LABEL: Record<string, string> = Object.fromEntries(
  PACKAGING_OPTIONS.map((o) => [o.value, o.label]),
);

/** Sipariş miktarının birimi: teneke, koli, adet, kg. */
export function salesUnitLabel(packagingType: string): string {
  switch (packagingType) {
    case "TENEKE":
      return "teneke";
    case "KOLI":
      return "koli";
    case "KUTU":
      return "kutu";
    case "DOKME":
      return "kg";
    case "VAKUM":
      return "adet";
    default:
      return "adet";
  }
}

export function packagingTypeLabel(packagingType: string): string {
  return PACKAGING_LABEL[packagingType] ?? packagingType;
}

export function packLabel(packSize: string | null | undefined, packagingType: string): string {
  const size = packSize?.trim();
  const type = packagingTypeLabel(packagingType);
  if (!size) return type;
  const lower = size.toLocaleLowerCase("tr-TR");
  const typeLower = type.toLocaleLowerCase("tr-TR");
  if (lower.includes(typeLower)) return size;
  if (packagingType === "DOKME" && /kg/i.test(size)) return size;
  return `${size} · ${type}`;
}

function mentionsKg(text: string): boolean {
  return /\d/.test(text) && /kg/i.test(text);
}

export function kgPerPackLabel(unitFactor: string | number): string | null {
  const n = typeof unitFactor === "number" ? unitFactor : Number(unitFactor);
  if (!Number.isFinite(n) || n <= 0) return null;
  return formatKg(kg(n.toString()));
}

/** Kart / satır özeti: "17 kg teneke" veya "Teneke · 17 kg". */
export function packSummary(input: {
  packSize?: string | null;
  packagingType: string;
  unitFactor?: string | number | null;
}): string {
  const pack = packLabel(input.packSize, input.packagingType);
  const per = input.unitFactor != null ? kgPerPackLabel(input.unitFactor) : null;
  if (!per || mentionsKg(pack)) return pack;
  return `${pack} · ${per}`;
}

export function mixedQuantityNoun(packagingTypes: string[]): string {
  const unique = [...new Set(packagingTypes.filter(Boolean))];
  if (unique.length === 1) return salesUnitLabel(unique[0]!);
  return "adet";
}

export type CinsInput = {
  packSize?: string | null;
  packagingType: string;
  unitFactor?: string | number | null;
};

export function uniquePackagingTypeLabels(packagingTypes: string[]): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const type of packagingTypes) {
    if (!type) continue;
    const label = packagingTypeLabel(type);
    const key = label.toLocaleLowerCase("tr-TR");
    if (seen.has(key)) continue;
    seen.add(key);
    labels.push(label);
  }
  return labels;
}

/** Katalog satırı: tek cins tam özet, birden fazlaysa tüm cins etiketleri. */
export function cinsLine(options: CinsInput[], max = 3): string {
  if (options.length === 0) return "";
  if (options.length === 1) return packSummary(options[0]!);
  const labels = [...new Set(options.map((o) => packLabel(o.packSize, o.packagingType)))];
  if (labels.length <= max) return labels.join(" · ");
  return `${labels.slice(0, max).join(" · ")} · +${labels.length - max} cins`;
}
