import ExcelJS from "exceljs";
import { formatDate } from "@/lib/format/date";
import { SITE } from "@/lib/site";

export type FaturaExportRow = {
  number: string;
  status: "DRAFT" | "ISSUED" | "VOID";
  version: number;
  dealerName: string;
  dealerType: string;
  subtotalKurus: number;
  vatKurus: number;
  totalKurus: number;
  sentAt: string | null;
  issuedAt: string;
};

const STATUS_LABEL: Record<FaturaExportRow["status"], string> = {
  DRAFT: "Taslak",
  ISSUED: "Düzenlendi",
  VOID: "İptal",
};

export async function buildFaturalarExcel(rows: FaturaExportRow[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = SITE.name;
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Faturalar", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "Fatura no", key: "number", width: 18 },
    { header: "Sürüm", key: "version", width: 8 },
    { header: "Tarih", key: "issuedAt", width: 12 },
    { header: "Bayi / Müşteri", key: "dealerName", width: 30 },
    { header: "Tür", key: "dealerType", width: 16 },
    { header: "Ara toplam (₺)", key: "subtotal", width: 16 },
    { header: "KDV (₺)", key: "vat", width: 14 },
    { header: "Genel toplam (₺)", key: "total", width: 16 },
    { header: "Durum", key: "status", width: 14 },
    { header: "Gönderim", key: "sent", width: 14 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF00693E" },
  };
  headerRow.alignment = { vertical: "middle" };

  for (const row of rows) {
    sheet.addRow({
      number: row.number,
      version: row.version,
      issuedAt: formatDate(new Date(row.issuedAt)),
      dealerName: row.dealerName,
      dealerType: row.dealerType,
      subtotal: row.subtotalKurus / 100,
      vat: row.vatKurus / 100,
      total: row.totalKurus / 100,
      status: STATUS_LABEL[row.status],
      sent: row.sentAt ? formatDate(new Date(row.sentAt)) : "Gönderilmedi",
    });
  }

  for (const key of ["subtotal", "vat", "total"]) {
    sheet.getColumn(key).numFmt = "#,##0.00";
  }

  const totalRow = sheet.addRow({
    number: "",
    dealerName: "Toplam",
    subtotal: rows.reduce((s, r) => s + r.subtotalKurus, 0) / 100,
    vat: rows.reduce((s, r) => s + r.vatKurus, 0) / 100,
    total: rows.reduce((s, r) => s + r.totalKurus, 0) / 100,
  });
  totalRow.font = { bold: true };

  sheet.autoFilter = { from: "A1", to: "J1" };

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
