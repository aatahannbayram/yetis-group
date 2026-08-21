import ExcelJS from "exceljs";
import { SITE, absoluteUrl } from "@/lib/site";
import {
  PRODUCT_EXCEL_HEADERS,
  matchAttributeHeader,
  matchProductField,
  parseBool,
  parseNumber,
  parsePackagingType,
  type ParsedProductRow,
  type ProductExcelField,
} from "@/domain/catalog/product-excel";
import { formatAttributeDisplay } from "@/infra/db/attributes";
import { PACKAGING_ATTRIBUTE_KEY } from "@/lib/format/packaging";

export type ProductExcelExportVariant = {
  sku: string;
  barcode: string | null;
  packagingType: string;
  packSize: string | null;
  unitFactor: string;
  moq: number;
  pricePerUnitKurus: number;
  vatRateBasisPoints: number;
  isActive: boolean;
};

export type ProductExcelExportRow = {
  name: string;
  description: string;
  active: boolean;
  categoryName: string;
  producerName: string;
  storageCondition: string | null;
  shelfLifeDays: number | null;
  requiresColdChain: boolean;
  usageTips: string;
  imageUrls: string[];
  variant: ProductExcelExportVariant;
  /** attribute name → display value */
  attributes: Record<string, string>;
};

const FIELD_ORDER: ProductExcelField[] = [
  "sku",
  "name",
  "description",
  "category",
  "producer",
  "active",
  "packagingType",
  "packSize",
  "unitFactor",
  "moq",
  "priceTl",
  "vatPercent",
  "barcode",
  "imageUrl",
  "imageUrl2",
  "imageUrl3",
  "storageCondition",
  "shelfLifeDays",
  "requiresColdChain",
  "usageTips",
];

const PACKAGING_LABEL: Record<string, string> = {
  TENEKE: "Teneke",
  VAKUM: "Vakum",
  KOLI: "Koli",
  KUTU: "Kutu",
  DOKME: "Dökme",
};

function publicImageUrl(url: string | null | undefined): string {
  if (!url?.trim()) return "";
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  return absoluteUrl(u.startsWith("/") ? u : `/${u}`);
}

function styleHeader(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF00693E" },
  };
  row.alignment = { vertical: "middle", wrapText: true };
}

export async function buildProductsExcel(
  rows: ProductExcelExportRow[],
  attributeNames: string[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = SITE.name;
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Ürünler", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  const attrHeaders = attributeNames.map((n) => `Özellik: ${n}`);
  const headers = [...FIELD_ORDER.map((f) => PRODUCT_EXCEL_HEADERS[f]), ...attrHeaders];

  sheet.columns = headers.map((header, i) => ({
    header,
    key: `c${i}`,
    width: Math.min(36, Math.max(14, header.length + 2)),
  }));
  styleHeader(sheet.getRow(1));

  for (const row of rows) {
    const v = row.variant;
    const base: unknown[] = [
      v.sku,
      row.name,
      row.description,
      row.categoryName,
      row.producerName,
      row.active && v.isActive ? "Evet" : "Hayır",
      PACKAGING_LABEL[v.packagingType] ?? v.packagingType,
      v.packSize ?? "",
      Number(v.unitFactor),
      v.moq,
      v.pricePerUnitKurus / 100,
      v.vatRateBasisPoints / 100,
      v.barcode ?? "",
      publicImageUrl(row.imageUrls[0]),
      publicImageUrl(row.imageUrls[1]),
      publicImageUrl(row.imageUrls[2]),
      row.storageCondition ?? "",
      row.shelfLifeDays ?? "",
      row.requiresColdChain ? "Evet" : "Hayır",
      row.usageTips ?? "",
    ];
    for (const name of attributeNames) {
      base.push(row.attributes[name] ?? "");
    }
    sheet.addRow(base);
  }

  sheet.getColumn(FIELD_ORDER.indexOf("priceTl") + 1).numFmt = "#,##0.00";
  sheet.getColumn(FIELD_ORDER.indexOf("unitFactor") + 1).numFmt = "0.000";

  addGuideSheet(workbook, attributeNames);

  const buf = await workbook.xlsx.writeBuffer();
  return Buffer.from(buf);
}

/** Empty template with headers + guide. */
export async function buildProductsExcelTemplate(attributeNames: string[]): Promise<Buffer> {
  return buildProductsExcel([], attributeNames);
}

function addGuideSheet(workbook: ExcelJS.Workbook, attributeNames: string[]) {
  const guide = workbook.addWorksheet("Kolon_Aciklama");
  guide.columns = [
    { header: "Kolon", key: "col", width: 28 },
    { header: "Alan", key: "field", width: 22 },
    { header: "Not", key: "note", width: 56 },
  ];
  styleHeader(guide.getRow(1));

  const notes: [ProductExcelField, string][] = [
    ["sku", "Zorunlu. Varyant stok kodu; varsa güncellenir, yoksa oluşturulur."],
    ["name", "Zorunlu. Ürün başlığı."],
    ["description", "Ürün açıklaması."],
    ["category", "Mevcut kategori adı ile eşleşir (büyük/küçük harf duyarsız)."],
    ["producer", "Mevcut üretici adı ile eşleşir."],
    ["active", "Evet/Hayır — ürün ve varyant aktifliği."],
    ["packagingType", "Teneke, Vakum, Koli, Kutu, Dökme veya /panel/nitelikler Ambalaj seçenekleri"],
    ["packSize", "Örn. 17 kg teneke"],
    ["unitFactor", "kg cinsinden paket katsayısı (3 ondalık)"],
    ["moq", "Minimum sipariş adedi"],
    ["priceTl", "Baz liste fiyatı (₺). Kuruş olarak saklanır."],
    ["vatPercent", "Örn. 1 veya 10"],
    ["barcode", "Barkod (EAN)"],
    ["imageUrl", "http(s) URL veya /uploads/... — indirilip galeriye eklenir"],
    ["imageUrl2", "İkinci görsel"],
    ["imageUrl3", "Üçüncü görsel"],
    ["storageCondition", "Saklama koşulu metni"],
    ["shelfLifeDays", "Raf ömrü (gün)"],
    ["requiresColdChain", "Evet/Hayır"],
    ["usageTips", "Kullanım ipuçları"],
  ];

  for (const [field, note] of notes) {
    guide.addRow({ col: PRODUCT_EXCEL_HEADERS[field], field, note });
  }
  for (const name of attributeNames) {
    guide.addRow({
      col: `Özellik: ${name}`,
      field: "attribute",
      note: "Mevcut nitelik tanımı ile eşleşir; SELECT için seçenek etiketi yazın.",
    });
  }
}

function cellText(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  if (typeof value === "object" && "text" in value && typeof value.text === "string") {
    return value.text.trim();
  }
  if (typeof value === "object" && "result" in value) {
    return cellText(value.result as ExcelJS.CellValue);
  }
  if (typeof value === "object" && "hyperlink" in value) {
    const h = value as { text?: string; hyperlink?: string };
    return (h.text ?? h.hyperlink ?? "").trim();
  }
  return String(value).trim();
}

export type AttributeDefForImport = {
  id: string;
  key: string;
  name: string;
  type: string;
  options: { id: string; value: string; label: string }[];
};

export async function parseProductsExcel(
  buffer: Buffer,
  attributes: AttributeDefForImport[],
): Promise<{ rows: ParsedProductRow[]; errors: string[] }> {
  const workbook = new ExcelJS.Workbook();
  // exceljs typings expect older Buffer shape
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);

  const packagingAttr = attributes.find((a) => a.key === PACKAGING_ATTRIBUTE_KEY);
  const packagingOptions =
    packagingAttr?.options.map((o) => ({ value: o.value, label: o.label })) ?? undefined;
  const productAttributes = attributes.filter((a) => a.key !== PACKAGING_ATTRIBUTE_KEY);

  const sheet =
    workbook.getWorksheet("Ürünler") ??
    workbook.worksheets.find((s) => s.name !== "Kolon_Aciklama") ??
    workbook.worksheets[0];

  if (!sheet) {
    return { rows: [], errors: ["Excel sayfası bulunamadı"] };
  }

  const headerRow = sheet.getRow(1);
  const colMap: {
    field?: ProductExcelField;
    attributeId?: string;
  }[] = [];

  const maxCol = Math.max(headerRow.cellCount, FIELD_ORDER.length + attributes.length + 5);
  for (let c = 1; c <= maxCol; c++) {
    const header = cellText(headerRow.getCell(c).value);
    if (!header) {
      colMap[c] = {};
      continue;
    }
    const field = matchProductField(header);
    if (field) {
      colMap[c] = { field };
      continue;
    }
    const attributeId = matchAttributeHeader(header, productAttributes);
    colMap[c] = attributeId ? { attributeId } : {};
  }

  const rows: ParsedProductRow[] = [];
  const errors: string[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const bag: Partial<Record<ProductExcelField, string>> = {};
    const attrBag: Record<string, string> = {};

    for (let c = 1; c <= maxCol; c++) {
      const map = colMap[c];
      if (!map) continue;
      const text = cellText(row.getCell(c).value);
      if (!text) continue;
      if (map.field) bag[map.field] = text;
      if (map.attributeId) attrBag[map.attributeId] = text;
    }

    const sku = (bag.sku ?? "").trim();
    const name = (bag.name ?? "").trim();
    if (!sku && !name) return;
    if (!sku) {
      errors.push(`Satır ${rowNumber}: Stok kodu zorunlu`);
      return;
    }
    if (!name) {
      errors.push(`Satır ${rowNumber}: Ürün adı zorunlu`);
      return;
    }

    const priceTl = parseNumber(bag.priceTl) ?? 0;
    const unitFactor = parseNumber(bag.unitFactor) ?? 1;
    const moq = parseNumber(bag.moq) ?? 1;
    const vatPercent = parseNumber(bag.vatPercent) ?? 1;
    const active = parseBool(bag.active) ?? true;
    const cold = parseBool(bag.requiresColdChain);
    const shelf = parseNumber(bag.shelfLifeDays);

    const imageUrls = [bag.imageUrl, bag.imageUrl2, bag.imageUrl3]
      .map((u) => u?.trim())
      .filter((u): u is string => Boolean(u));

    rows.push({
      rowNumber,
      sku: sku.toUpperCase(),
      name,
      description: bag.description ?? "",
      category: bag.category?.trim() || null,
      producer: bag.producer?.trim() || null,
      active,
      packagingType: parsePackagingType(bag.packagingType, packagingOptions),
      packSize: bag.packSize?.trim() || null,
      unitFactor: unitFactor > 0 ? unitFactor : 1,
      moq: moq > 0 ? Math.round(moq) : 1,
      priceTl: priceTl >= 0 ? priceTl : 0,
      vatPercent: vatPercent >= 0 ? vatPercent : 1,
      barcode: bag.barcode?.trim() || null,
      imageUrls,
      storageCondition: bag.storageCondition?.trim() || null,
      shelfLifeDays: shelf != null && shelf > 0 ? Math.round(shelf) : null,
      requiresColdChain: cold,
      usageTips: bag.usageTips?.trim() || null,
      attributes: attrBag,
    });
  });

  return { rows, errors };
}

/** Map Prisma product graph → export rows (one per variant). */
export function mapProductsToExcelRows(
  products: Array<{
    name: string;
    description: string;
    active: boolean;
    storageCondition: string | null;
    shelfLifeDays: number | null;
    requiresColdChain: boolean;
    usageTips: string;
    imageUrl: string | null;
    primaryCategory: { name: string };
    producer: { name: string };
    media: { url: string; isPrimary: boolean; sortOrder: number }[];
    variants: ProductExcelExportVariant[];
    attributeValues: Array<{
      valueText: string | null;
      valueNumber: { toString(): string } | null;
      valueBoolean: boolean | null;
      selectedOptions: { option: { label: string } }[];
      attribute: { name: string; type: "TEXT" | "NUMBER" | "BOOLEAN" | "SELECT" | "MULTI_SELECT"; unit: string | null };
    }>;
  }>,
): { rows: ProductExcelExportRow[]; attributeNames: string[] } {
  const attrNameSet = new Set<string>();
  for (const p of products) {
    for (const av of p.attributeValues) attrNameSet.add(av.attribute.name);
  }
  const attributeNames = Array.from(attrNameSet).sort((a, b) => a.localeCompare(b, "tr"));

  const rows: ProductExcelExportRow[] = [];
  for (const p of products) {
    const attrs: Record<string, string> = {};
    for (const av of p.attributeValues) {
      attrs[av.attribute.name] = formatAttributeDisplay(av);
    }
    const sortedMedia = [...p.media].sort(
      (a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder,
    );
    const imageUrls = sortedMedia.map((m) => m.url);
    if (imageUrls.length === 0 && p.imageUrl) imageUrls.push(p.imageUrl);

    const variants = p.variants.length
      ? p.variants
      : [
          {
            sku: "",
            barcode: null,
            packagingType: "KOLI",
            packSize: null,
            unitFactor: "1",
            moq: 1,
            pricePerUnitKurus: 0,
            vatRateBasisPoints: 100,
            isActive: true,
          },
        ];

    for (const v of variants) {
      if (!v.sku) continue;
      rows.push({
        name: p.name,
        description: p.description,
        active: p.active,
        categoryName: p.primaryCategory.name,
        producerName: p.producer.name,
        storageCondition: p.storageCondition,
        shelfLifeDays: p.shelfLifeDays,
        requiresColdChain: p.requiresColdChain,
        usageTips: p.usageTips,
        imageUrls,
        variant: v,
        attributes: attrs,
      });
    }
  }

  return { rows, attributeNames };
}
