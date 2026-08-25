/**
 * Excel ↔ fiyat alan eşlemesi (baz fiyat + fiyat listeleri).
 */

export type PriceExcelField = "sku" | "productName" | "packLabel" | "basePriceTl";

export const PRICE_EXCEL_HEADERS: Record<PriceExcelField, string> = {
  sku: "Stok kodu",
  productName: "Ürün adı",
  packLabel: "Paket",
  basePriceTl: "Baz fiyat (₺)",
};

const FIELD_ALIASES: Record<PriceExcelField, string[]> = {
  sku: ["stok kodu", "stok_kodu", "sku", "kod"],
  productName: ["urun adi", "ürün adı", "urun", "ürün", "name"],
  packLabel: ["paket", "pack", "ambalaj", "boyut"],
  basePriceTl: ["baz fiyat", "fiyat", "liste fiyati", "birim fiyat", "price"],
};

export function normalizeHeader(raw: string): string {
  return raw
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[%₺()]/g, " ")
    .replace(/[_./\\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchPriceField(header: string): PriceExcelField | null {
  const n = normalizeHeader(header);
  if (!n) return null;
  for (const [field, aliases] of Object.entries(FIELD_ALIASES) as [PriceExcelField, string[]][]) {
    if (aliases.includes(n)) return field;
    for (const a of aliases) {
      if (a.length >= 4 && (n.startsWith(a + " ") || n.endsWith(" " + a) || n.includes(" " + a + " "))) {
        return field;
      }
    }
  }
  return null;
}

/** "Fiyat: Standart" / "Liste: HORECA" → liste adı */
export function matchPriceListHeader(
  header: string,
  lists: { id: string; name: string }[],
): string | null {
  const n = normalizeHeader(header);
  const prefix = n.match(/^(fiyat|liste|list|price list|fiyat listesi)\s*[:=-]?\s*(.+)$/);
  const needle = prefix ? prefix[2]!.trim() : null;
  if (!needle) return null;
  for (const list of lists) {
    const nameN = normalizeHeader(list.name);
    if (nameN === needle || needle.includes(nameN) || nameN.includes(needle)) {
      return list.id;
    }
  }
  return null;
}

export function parseNumber(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (raw == null || raw === "") return null;
  const s = String(raw).trim().replace(/\s/g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function priceListColumnHeader(name: string): string {
  return `Fiyat: ${name}`;
}

export type ParsedPriceRow = {
  rowNumber: number;
  sku: string;
  basePriceTl: number | null;
  /** priceListId → TL; null = hücre boş, dokunma */
  listPrices: Record<string, number | null>;
};
