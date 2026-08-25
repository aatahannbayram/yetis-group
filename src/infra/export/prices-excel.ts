import ExcelJS from "exceljs";
import { SITE } from "@/lib/site";
import {
  PRICE_EXCEL_HEADERS,
  matchPriceField,
  matchPriceListHeader,
  parseNumber,
  priceListColumnHeader,
  type ParsedPriceRow,
  type PriceExcelField,
} from "@/domain/pricing/price-excel";

export type PriceExcelExportRow = {
  sku: string;
  productName: string;
  packLabel: string;
  basePriceTl: number;
  /** priceListId → TL (override yoksa boş) */
  listPrices: Record<string, number | null>;
};

export type PriceListRef = { id: string; name: string };

const FIELD_ORDER: PriceExcelField[] = ["sku", "productName", "packLabel", "basePriceTl"];

function styleHeader(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF00693E" },
  };
  row.alignment = { vertical: "middle", wrapText: true };
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
  return String(value).trim();
}

function addGuideSheet(workbook: ExcelJS.Workbook, lists: PriceListRef[]) {
  const guide = workbook.addWorksheet("Kolon_Aciklama");
  guide.columns = [
    { header: "Kolon", key: "col", width: 28 },
    { header: "Alan", key: "field", width: 16 },
    { header: "Not", key: "note", width: 56 },
  ];
  styleHeader(guide.getRow(1));
  const notes: [string, string][] = [
    [PRICE_EXCEL_HEADERS.sku, "Zorunlu. Mevcut stok kodu ile eşleşmeli."],
    [PRICE_EXCEL_HEADERS.productName, "Bilgi amaçlı; içe aktarımda güncellenmez."],
    [PRICE_EXCEL_HEADERS.packLabel, "Bilgi amaçlı; içe aktarımda güncellenmez."],
    [PRICE_EXCEL_HEADERS.basePriceTl, "Katalog baz fiyatı (₺). Boş bırakılırsa baz fiyat değişmez."],
  ];
  for (const [col, note] of notes) guide.addRow({ col, field: "price", note });
  for (const list of lists) {
    guide.addRow({
      col: priceListColumnHeader(list.name),
      field: "list",
      note: `${list.name} listesi override fiyatı (₺). Boş = dokunma.`,
    });
  }
}

export async function buildPricesExcel(
  rows: PriceExcelExportRow[],
  lists: PriceListRef[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = SITE.name;
  workbook.created = new Date();

  const listHeaders = lists.map((l) => priceListColumnHeader(l.name));
  const headers = [...FIELD_ORDER.map((f) => PRICE_EXCEL_HEADERS[f]), ...listHeaders];

  const sheet = workbook.addWorksheet("Fiyatlar", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sheet.columns = headers.map((header, i) => ({
    header,
    key: `c${i}`,
    width: Math.min(36, Math.max(14, header.length + 2)),
  }));
  styleHeader(sheet.getRow(1));

  for (const row of rows) {
    const base: unknown[] = [
      row.sku,
      row.productName,
      row.packLabel,
      row.basePriceTl,
      ...lists.map((l) => row.listPrices[l.id] ?? ""),
    ];
    sheet.addRow(base);
  }

  addGuideSheet(workbook, lists);
  const buf = await workbook.xlsx.writeBuffer();
  return Buffer.from(buf);
}

export async function buildPricesExcelTemplate(lists: PriceListRef[]): Promise<Buffer> {
  return buildPricesExcel([], lists);
}

export async function parsePricesExcel(
  buffer: Buffer,
  lists: PriceListRef[],
): Promise<{ rows: ParsedPriceRow[]; errors: string[] }> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);

  const sheet =
    workbook.getWorksheet("Fiyatlar") ??
    workbook.worksheets.find((s) => s.name !== "Kolon_Aciklama") ??
    workbook.worksheets[0];

  if (!sheet) return { rows: [], errors: ["Excel sayfası bulunamadı"] };

  const headerRow = sheet.getRow(1);
  const colMap: { field?: PriceExcelField; priceListId?: string }[] = [];
  const maxCol = Math.max(headerRow.cellCount, FIELD_ORDER.length + lists.length + 2);

  for (let c = 1; c <= maxCol; c++) {
    const header = cellText(headerRow.getCell(c).value);
    if (!header) {
      colMap[c] = {};
      continue;
    }
    const field = matchPriceField(header);
    if (field) {
      colMap[c] = { field };
      continue;
    }
    const priceListId = matchPriceListHeader(header, lists);
    colMap[c] = priceListId ? { priceListId } : {};
  }

  const rows: ParsedPriceRow[] = [];
  const errors: string[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const bag: Partial<Record<PriceExcelField, string>> = {};
    const listBag: Record<string, string> = {};

    for (let c = 1; c <= maxCol; c++) {
      const map = colMap[c];
      if (!map) continue;
      const text = cellText(row.getCell(c).value);
      if (!text && map.field !== "basePriceTl") continue;
      if (map.field) bag[map.field] = text;
      if (map.priceListId && text) listBag[map.priceListId] = text;
    }

    const sku = (bag.sku ?? "").trim();
    if (!sku) return;

    const baseRaw = bag.basePriceTl?.trim();
    const basePriceTl = baseRaw ? parseNumber(baseRaw) : null;
    if (baseRaw && basePriceTl == null) {
      errors.push(`Satır ${rowNumber}: geçersiz baz fiyat «${baseRaw}»`);
      return;
    }
    if (basePriceTl != null && basePriceTl < 0) {
      errors.push(`Satır ${rowNumber}: baz fiyat negatif olamaz`);
      return;
    }

    const listPrices: Record<string, number | null> = {};
    for (const [listId, raw] of Object.entries(listBag)) {
      const n = parseNumber(raw);
      if (n == null) {
        errors.push(`Satır ${rowNumber}: geçersiz liste fiyatı «${raw}»`);
        return;
      }
      if (n < 0) {
        errors.push(`Satır ${rowNumber}: liste fiyatı negatif olamaz`);
        return;
      }
      listPrices[listId] = n;
    }

    const hasListPrice = Object.keys(listPrices).length > 0;
    if (basePriceTl == null && !hasListPrice) return;

    rows.push({
      rowNumber,
      sku: sku.toUpperCase(),
      basePriceTl,
      listPrices,
    });
  });

  return { rows, errors };
}
