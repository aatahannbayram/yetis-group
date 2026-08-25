/**
 * WhatsApp "Yetiş Grup ayrıntılı ürün listesi.xlsx" → panel import satırları.
 * Kaynak sütunlar: No, Kategori, Alt Kategori, Marka, Ürün Adı, Miktar, Birim,
 * Net (gr/ml), Paket / Özellik, Kalibre / Boy
 */

import { parsePackagingType } from "@/domain/catalog/product-excel";
import type { ParsedProductRow } from "@/domain/catalog/product-excel";

export type YetisDetailedListRow = {
  rowNumber: number;
  no: number | null;
  mainCategory: string;
  subCategory: string;
  brand: string;
  productName: string;
  quantityRaw: string;
  unit: string;
  netRaw: string;
  packagingFeature: string;
  calibre: string;
};

export type YetisDetailedListConvertOptions = {
  /** Stok kodu öneki (varsayılan YG-L) */
  skuPrefix?: string;
  /** Fiyat yoksa TL (varsayılan 0) */
  defaultPriceTl?: number;
  /** KDV % (varsayılan 1) */
  defaultVatPercent?: number;
};

function cellText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  return String(value).trim();
}

function titleCaseTr(input: string): string {
  return input
    .trim()
    .split(/\s+/)
    .map((part) => {
      if (!part) return part;
      const lower = part.toLocaleLowerCase("tr-TR");
      return lower.charAt(0).toLocaleUpperCase("tr-TR") + lower.slice(1);
    })
    .join(" ");
}

/** "650-750", 18, "2.5" → sayı veya aralık ortalaması */
export function parseQuantityValue(raw: string): number | null {
  const s = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!s) return null;
  const range = s.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/);
  if (range) {
    const a = Number(range[1]);
    const b = Number(range[2]);
    if (Number.isFinite(a) && Number.isFinite(b)) return (a + b) / 2;
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Miktar + birim → kg katsayısı (B2B birim fiyat kg bazında). */
export function quantityToKgFactor(quantityRaw: string, unitRaw: string): number {
  const qty = parseQuantityValue(quantityRaw);
  if (qty == null || qty <= 0) return 1;
  const unit = unitRaw.trim().toLocaleUpperCase("tr-TR");
  if (unit === "KG") return qty;
  if (unit === "GR" || unit === "G") return qty / 1000;
  if (unit === "LT" || unit === "L") return qty;
  if (unit === "ML") return qty / 1000;
  return qty;
}

export function formatPackSize(
  quantityRaw: string,
  unitRaw: string,
  netRaw: string,
  packagingFeature: string,
  calibre: string,
): string {
  const parts: string[] = [];
  const qty = quantityRaw.trim();
  const unit = unitRaw.trim().toLocaleLowerCase("tr-TR");
  if (qty && unit) {
    parts.push(`${qty} ${unit}`);
  } else if (qty) {
    parts.push(qty);
  }
  const net = netRaw.trim();
  if (net) parts.push(`Net ${net} gr/ml`);
  const pkg = packagingFeature.trim();
  if (pkg) parts.push(pkg);
  const kal = calibre.trim();
  if (kal) parts.push(`Kalibre ${kal}`);
  return parts.join(" · ") || "Standart";
}

export function mapPackagingFeature(raw: string): string {
  const n = raw.trim().toLocaleLowerCase("tr-TR");
  if (!n) return "KOLI";
  if (["teneke", "mavi", "sari", "sarı"].includes(n)) return "TENEKE";
  if (n.includes("vakum")) return "VAKUM";
  if (n.includes("kova")) return "KUTU";
  if (["dilimli", "blok", "rende"].includes(n)) return "VAKUM";
  return parsePackagingType(raw);
}

export function buildCatalogProductName(brand: string, productName: string): string {
  const b = brand.trim();
  const p = productName.trim();
  if (!b) return p;
  if (!p) return b;
  const bLower = b.toLocaleLowerCase("tr-TR");
  const pLower = p.toLocaleLowerCase("tr-TR");
  if (pLower.startsWith(bLower)) return titleCaseTr(p);
  return `${titleCaseTr(b)} ${titleCaseTr(p)}`;
}

export function buildSku(prefix: string, no: number | null, rowNumber: number): string {
  const base = no != null && no > 0 ? no : rowNumber;
  return `${prefix}${String(base).padStart(4, "0")}`.toUpperCase();
}

export function buildDescription(row: YetisDetailedListRow): string {
  const path = [row.mainCategory, row.subCategory].filter(Boolean).join(" › ");
  const extras = [row.packagingFeature, row.calibre].filter((s) => s.trim()).join(", ");
  if (path && extras) return `${path}. ${extras}.`;
  if (path) return `${path}.`;
  if (extras) return `${extras}.`;
  return "";
}

export function convertYetisDetailedListRow(
  row: YetisDetailedListRow,
  options?: YetisDetailedListConvertOptions,
): ParsedProductRow {
  const skuPrefix = options?.skuPrefix ?? "YG-L";
  const defaultPriceTl = options?.defaultPriceTl ?? 0;
  const defaultVatPercent = options?.defaultVatPercent ?? 1;

  const catalogName = buildCatalogProductName(row.brand, row.productName);
  const packSize = formatPackSize(
    row.quantityRaw,
    row.unit,
    row.netRaw,
    row.packagingFeature,
    row.calibre,
  );
  const unitFactor = quantityToKgFactor(row.quantityRaw, row.unit);
  const packagingType = mapPackagingFeature(row.packagingFeature);

  return {
    rowNumber: row.rowNumber,
    sku: buildSku(skuPrefix, row.no, row.rowNumber),
    name: catalogName,
    description: buildDescription(row),
    category: row.subCategory.trim() || row.mainCategory.trim() || null,
    producer: row.brand.trim() || null,
    active: true,
    packagingType,
    packSize,
    unitFactor: unitFactor > 0 ? unitFactor : 1,
    moq: 1,
    priceTl: defaultPriceTl,
    vatPercent: defaultVatPercent,
    barcode: null,
    imageUrls: [],
    storageCondition: null,
    shelfLifeDays: null,
    requiresColdChain: true,
    usageTips: null,
    attributes: {},
  };
}

/** Ham Excel satır dizisinden (header hariç) parse eder. */
export function parseYetisDetailedListRows(
  rawRows: Array<Record<string, unknown>>,
): YetisDetailedListRow[] {
  const rows: YetisDetailedListRow[] = [];
  for (let i = 0; i < rawRows.length; i++) {
    const r = rawRows[i]!;
    const productName = cellText(r.productName ?? r["Ürün Adı"]);
    if (!productName) continue;

    const noRaw = parseQuantityValue(cellText(r.no ?? r.No));
    rows.push({
      rowNumber: i + 2,
      no: noRaw != null ? Math.round(noRaw) : null,
      mainCategory: cellText(r.mainCategory ?? r.Kategori),
      subCategory: cellText(r.subCategory ?? r["Alt Kategori"]),
      brand: cellText(r.brand ?? r.Marka),
      productName,
      quantityRaw: cellText(r.quantityRaw ?? r.Miktar),
      unit: cellText(r.unit ?? r.Birim),
      netRaw: cellText(r.netRaw ?? r["Net (gr/ml)"]),
      packagingFeature: cellText(r.packagingFeature ?? r["Paket / Özellik"]),
      calibre: cellText(r.calibre ?? r["Kalibre / Boy"]),
    });
  }
  return rows;
}

export function convertYetisDetailedList(
  sourceRows: YetisDetailedListRow[],
  options?: YetisDetailedListConvertOptions,
): ParsedProductRow[] {
  return sourceRows.map((row) => convertYetisDetailedListRow(row, options));
}

/** ExcelJS worksheet satırlarından okur (1. satır başlık). */
export function readYetisDetailedListFromSheet(getRow: (n: number) => {
  getCell: (c: number) => { value: unknown };
} | undefined, rowCount: number): YetisDetailedListRow[] {
  const rawRows: Array<Record<string, unknown>> = [];
  for (let n = 2; n <= rowCount; n++) {
    const row = getRow(n);
    if (!row) continue;
    rawRows.push({
      No: row.getCell(1).value,
      Kategori: row.getCell(2).value,
      "Alt Kategori": row.getCell(3).value,
      Marka: row.getCell(4).value,
      "Ürün Adı": row.getCell(5).value,
      Miktar: row.getCell(6).value,
      Birim: row.getCell(7).value,
      "Net (gr/ml)": row.getCell(8).value,
      "Paket / Özellik": row.getCell(9).value,
      "Kalibre / Boy": row.getCell(10).value,
    });
  }
  return parseYetisDetailedListRows(rawRows);
}
