import PDFDocument from "pdfkit";
import path from "node:path";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { formatDate } from "@/lib/format/date";
import { SITE } from "@/lib/site";
import type { FaturaExportRow } from "@/infra/export/faturalar-excel";

const FONT_REG = path.join(process.cwd(), "public", "fonts", "NotoSans-Regular.ttf");
const FONT_BOLD = path.join(process.cwd(), "public", "fonts", "NotoSans-Bold.ttf");

const STATUS_LABEL: Record<FaturaExportRow["status"], string> = {
  DRAFT: "Taslak",
  ISSUED: "Düzenlendi",
  VOID: "İptal",
};

/** @types/pdfkit types `font` as string-only; runtime accepts `false` to skip the eager built-in Helvetica load, which breaks under Turbopack bundling. */
type PDFDocumentOptionsPatched = Omit<
  NonNullable<ConstructorParameters<typeof PDFDocument>[0]>,
  "font"
> & { font?: string | false };

export async function buildFaturalarPdf(rows: FaturaExportRow[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const options: PDFDocumentOptionsPatched = {
      size: "A4",
      margin: 40,
      layout: "landscape",
      font: false,
    };
    const doc = new PDFDocument(options as ConstructorParameters<typeof PDFDocument>[0]);
    doc.registerFont("TR", FONT_REG);
    doc.registerFont("TR-Bold", FONT_BOLD);

    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const left = doc.page.margins.left;

    doc.font("TR-Bold").fontSize(15).text(`${SITE.name} · Faturalar`, { align: "left" });
    doc
      .font("TR")
      .fontSize(9)
      .fillColor("#666666")
      .text(`Oluşturulma: ${formatDate(new Date())} · ${rows.length} kayıt`, {
        align: "left",
      });
    doc.fillColor("#000000");
    doc.moveDown(1);

    const cols = {
      number: left,
      date: left + 130,
      dealer: left + 210,
      subtotal: left + 460,
      vat: left + 555,
      total: left + 640,
      status: left + 730,
    };

    function drawHeader() {
      const y = doc.y;
      doc.font("TR-Bold").fontSize(8);
      doc.text("Fatura no", cols.number, y, { width: 120 });
      doc.text("Tarih", cols.date, y, { width: 70 });
      doc.text("Bayi / Müşteri", cols.dealer, y, { width: 240 });
      doc.text("Ara toplam", cols.subtotal, y, { width: 85, align: "right" });
      doc.text("KDV", cols.vat, y, { width: 75, align: "right" });
      doc.text("Toplam", cols.total, y, { width: 85, align: "right" });
      doc.text("Durum", cols.status, y, { width: 90 });
      doc.y = y + 14;
      doc
        .moveTo(left, doc.y)
        .lineTo(left + pageWidth, doc.y)
        .strokeColor("#cccccc")
        .stroke();
      doc.moveDown(0.4);
      doc.strokeColor("#000000");
    }

    drawHeader();

    doc.font("TR").fontSize(8);
    for (const row of rows) {
      if (doc.y > doc.page.height - doc.page.margins.bottom - 40) {
        doc.addPage();
        drawHeader();
        doc.font("TR").fontSize(8);
      }
      const y = doc.y;
      doc.text(`${row.number}${row.version > 1 ? ` · v${row.version}` : ""}`, cols.number, y, {
        width: 120,
      });
      doc.text(formatDate(new Date(row.issuedAt)), cols.date, y, { width: 70 });
      doc.text(row.dealerName, cols.dealer, y, { width: 240 });
      doc.text(formatMoney(money(row.subtotalKurus)), cols.subtotal, y, {
        width: 85,
        align: "right",
      });
      doc.text(formatMoney(money(row.vatKurus)), cols.vat, y, { width: 75, align: "right" });
      doc.text(formatMoney(money(row.totalKurus)), cols.total, y, {
        width: 85,
        align: "right",
      });
      doc.text(STATUS_LABEL[row.status], cols.status, y, { width: 90 });
      doc.y = y + 16;
    }

    doc.moveDown(0.5);
    doc
      .moveTo(left, doc.y)
      .lineTo(left + pageWidth, doc.y)
      .strokeColor("#cccccc")
      .stroke();
    doc.moveDown(0.5);
    doc.strokeColor("#000000");

    const totalKurus = rows.reduce((s, r) => s + r.totalKurus, 0);
    doc
      .font("TR-Bold")
      .fontSize(10)
      .text(`Genel toplam: ${formatMoney(money(totalKurus))}`, left, doc.y, {
        width: pageWidth,
        align: "right",
      });

    doc.end();
  });
}
