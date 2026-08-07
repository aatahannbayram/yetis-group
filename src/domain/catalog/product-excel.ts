/**
 * Excel ↔ katalog alan eşlemesi.
 * Başlıklar normalize edilip (TR küçük harf, noktalama yok) alias listesine bakılır.
 */

export type ProductExcelField =
  | "sku"
  | "name"
  | "description"
  | "category"
  | "producer"
  | "active"
  | "packagingType"
  | "packSize"
  | "unitFactor"
  | "moq"
  | "priceTl"
  | "vatPercent"
  | "barcode"
  | "imageUrl"
  | "imageUrl2"
  | "imageUrl3"
  | "storageCondition"
  | "shelfLifeDays"
  | "requiresColdChain"
  | "usageTips";

/** Canonical export headers (TR). */
export const PRODUCT_EXCEL_HEADERS: Record<ProductExcelField, string> = {
  sku: "Stok kodu",
  name: "Ürün adı",
  description: "Açıklama",
  category: "Kategori",
  producer: "Üretici",
  active: "Aktif",
  packagingType: "Ambalaj tipi",
  packSize: "Paket boyutu",
  unitFactor: "Birim katsayısı (kg)",
  moq: "MOQ",
  priceTl: "Baz fiyat (₺)",
  vatPercent: "KDV %",
  barcode: "Barkod",
  imageUrl: "Görsel URL",
  imageUrl2: "Görsel URL 2",
  imageUrl3: "Görsel URL 3",
  storageCondition: "Saklama",
  shelfLifeDays: "Raf ömrü (gün)",
  requiresColdChain: "Soğuk zincir",
  usageTips: "Kullanım ipuçları",
};

const FIELD_ALIASES: Record<ProductExcelField, string[]> = {
  sku: ["stok kodu", "stok_kodu", "sku", "urun kodu", "ürün kodu", "kod", "stokkodu", "product code"],
  name: ["urun adi", "ürün adı", "urun adı", "ürün adi", "baslik", "başlık", "title", "name", "urun", "ürün"],
  description: ["aciklama", "açıklama", "description", "detay", "urun aciklama"],
  category: ["kategori", "category", "ana kategori", "urun kategorisi"],
  producer: ["uretici", "üretici", "producer", "marka", "brand", "supplier"],
  active: ["aktif", "active", "durum", "yayinda", "yayında"],
  packagingType: ["ambalaj tipi", "ambalaj", "packaging", "paket tipi", "tip"],
  packSize: ["paket boyutu", "pack size", "boyut", "gramaj", "net icerik"],
  unitFactor: ["birim katsayisi", "birim katsayısı", "katsayi", "katsayı", "kg", "unit factor", "carpan"],
  moq: ["moq", "min siparis", "minimum siparis", "min adet"],
  priceTl: ["baz fiyat", "fiyat", "price", "birim fiyat", "liste fiyati", "tl"],
  vatPercent: ["kdv", "kdv %", "vat", "kdv orani"],
  barcode: ["barkod", "barcode", "ean", "gtin"],
  imageUrl: ["gorsel url", "görsel url", "gorsel", "görsel", "image", "image url", "foto", "foto url", "resim"],
  imageUrl2: ["gorsel url 2", "görsel url 2", "gorsel 2", "görsel 2", "image 2", "foto 2"],
  imageUrl3: ["gorsel url 3", "görsel url 3", "gorsel 3", "görsel 3", "image 3", "foto 3"],
  storageCondition: ["saklama", "saklama kosulu", "saklama koşulu", "storage"],
  shelfLifeDays: ["raf omru", "raf ömrü", "raf omru gun", "shelf life", "skt gun"],
  requiresColdChain: ["soguk zincir", "soğuk zincir", "cold chain", "soguk"],
  usageTips: ["kullanim ipuclari", "kullanım ipuçları", "usage", "ipuclari"],
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

export function matchProductField(header: string): ProductExcelField | null {
  const n = normalizeHeader(header);
  if (!n) return null;
  // Exact alias first
  for (const [field, aliases] of Object.entries(FIELD_ALIASES) as [ProductExcelField, string[]][]) {
    if (aliases.includes(n)) return field;
  }
  // Prefix / contains — only for longer needles to avoid "tip"/"kg" false hits
  for (const [field, aliases] of Object.entries(FIELD_ALIASES) as [ProductExcelField, string[]][]) {
    for (const a of aliases) {
      if (a.length < 4) continue;
      if (n === a || n.startsWith(a + " ") || n.endsWith(" " + a) || n.includes(" " + a + " ")) {
        return field;
      }
    }
  }
  return null;
}

/** "Özellik: Yağ oranı" / "attr:yag-orani" / exact attribute name */
/** Returns attribute id when header matches a known definition. */
export function matchAttributeHeader(
  header: string,
  attributes: { id: string; key: string; name: string }[],
): string | null {
  const n = normalizeHeader(header);
  const prefix = n.match(/^(ozellik|attr|attribute|nitelik)\s*[:=-]?\s*(.+)$/);
  const needle = prefix ? prefix[2]!.trim() : n;
  for (const attr of attributes) {
    const keyN = normalizeHeader(attr.key);
    const nameN = normalizeHeader(attr.name);
    if (keyN === needle || nameN === needle) return attr.id;
    if (needle.includes(nameN) || nameN.includes(needle)) return attr.id;
  }
  return null;
}

export const PACKAGING_LABEL_TO_ENUM: Record<string, string> = {
  teneke: "TENEKE",
  vakum: "VAKUM",
  koli: "KOLI",
  kutu: "KUTU",
  dokme: "DOKME",
  dökme: "DOKME",
};

export function parsePackagingType(raw: string | null | undefined): string {
  if (!raw?.trim()) return "KOLI";
  const n = normalizeHeader(raw);
  const upper = raw.trim().toUpperCase();
  if (["TENEKE", "VAKUM", "KOLI", "KUTU", "DOKME"].includes(upper)) return upper;
  return PACKAGING_LABEL_TO_ENUM[n] ?? "KOLI";
}

export function parseBool(raw: unknown): boolean | null {
  if (raw === true || raw === false) return raw;
  if (raw == null || raw === "") return null;
  const n = String(raw).trim().toLocaleLowerCase("tr-TR");
  if (["1", "evet", "true", "yes", "aktif", "yayinda", "yayında", "e"].includes(n)) return true;
  if (["0", "hayir", "hayır", "false", "no", "pasif", "h"].includes(n)) return false;
  return null;
}

export function parseNumber(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (raw == null || raw === "") return null;
  const s = String(raw).trim().replace(/\s/g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export type ParsedProductRow = {
  rowNumber: number;
  sku: string;
  name: string;
  description: string;
  category: string | null;
  producer: string | null;
  active: boolean;
  packagingType: string;
  packSize: string | null;
  unitFactor: number;
  moq: number;
  priceTl: number;
  vatPercent: number;
  barcode: string | null;
  imageUrls: string[];
  storageCondition: string | null;
  shelfLifeDays: number | null;
  requiresColdChain: boolean | null;
  usageTips: string | null;
  /** attributeId → raw cell text */
  attributes: Record<string, string>;
};
