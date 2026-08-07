import PDFDocument from "pdfkit";
import path from "node:path";
import { SITE } from "@/lib/site";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { formatDate } from "@/lib/format/date";

export type ProformaPdfLine = {
  description: string;
  quantity: number;
  unitPriceKurus: number;
  vatRateBasisPoints: number;
  lineTotalKurus: number;
};

export type ProformaPdfInput = {
  number: string;
  issuedAt: Date;
  version: number;
  buyerUnvan: string;
  buyerVergiNo: string | null;
  buyerVergiDairesi: string | null;
  buyerAddress: string | null;
  sellerName: string;
  sellerEmail: string | null;
  sellerPhone: string | null;
  subtotalKurus: number;
  vatKurus: number;
  totalKurus: number;
  note: string | null;
  orderId: string;
  lines: ProformaPdfLine[];
};

function vatLabel(bp: number): string {
  const pct = bp / 100;
  return Number.isInteger(pct) ? `%${pct}` : `%${(bp / 100).toFixed(2)}`;
}

const FONT_REG = path.join(process.cwd(), "public", "fonts", "NotoSans-Regular.ttf");
const FONT_BOLD = path.join(process.cwd(), "public", "fonts", "NotoSans-Bold.ttf");

/** @types/pdfkit types `font` as string-only; runtime accepts `false` to skip the eager built-in Helvetica load, which breaks under Turbopack bundling. */
type PDFDocumentOptionsPatched = Omit<
  NonNullable<ConstructorParameters<typeof PDFDocument>[0]>,
  "font"
> & { font?: string | false };

export async function renderProformaPdf(input: ProformaPdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const options: PDFDocumentOptionsPatched = { size: "A4", margin: 48, font: false };
    const doc = new PDFDocument(options as ConstructorParameters<typeof PDFDocument>[0]);
    doc.registerFont("TR", FONT_REG);
    doc.registerFont("TR-Bold", FONT_BOLD);

    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    doc.fontSize(15).font("TR-Bold").text("PROFORMA FATURA / SİPARİŞ SÖZLEŞMESİ", {
      align: "left",
    });
    doc.moveDown(0.3);
    doc
      .fontSize(9)
      .font("TR")
      .fillColor("#666666")
      .text(
        "Bu belge e-Fatura / e-Arşiv değildir. Ticari teklif ve sipariş teyididir; resmi fatura ayrıca kesilir.",
        { width: pageWidth },
      );
    doc.fillColor("#000000");
    doc.moveDown(1);

    doc.fontSize(10).font("TR-Bold").text(`Belge no: ${input.number}`);
    doc.font("TR").text(`Tarih: ${formatDate(input.issuedAt)}`);
    doc.text(`Sürüm: ${input.version}`);
    doc.text(`Sipariş ref: #${input.orderId.slice(-8)}`);
    doc.moveDown(1);

    const colLeft = doc.page.margins.left;
    const colRight = doc.page.margins.left + pageWidth / 2 + 8;
    const yParties = doc.y;

    doc.font("TR-Bold").fontSize(10).text("SATICI", colLeft, yParties);
    doc
      .font("TR")
      .fontSize(9)
      .text(input.sellerName, colLeft, doc.y, { width: pageWidth / 2 - 12 });
    if (input.sellerEmail) doc.text(input.sellerEmail, { width: pageWidth / 2 - 12 });
    if (input.sellerPhone) doc.text(input.sellerPhone, { width: pageWidth / 2 - 12 });
    doc.text(SITE.slogan, { width: pageWidth / 2 - 12 });
    const yAfterSeller = doc.y;

    doc.font("TR-Bold").fontSize(10).text("ALICI (MÜŞTERİ)", colRight, yParties);
    doc
      .font("TR")
      .fontSize(9)
      .text(input.buyerUnvan, colRight, doc.y, { width: pageWidth / 2 - 12 });
    if (input.buyerVergiNo) {
      doc.text(`VKN/TCKN: ${input.buyerVergiNo}`, colRight, doc.y, { width: pageWidth / 2 - 12 });
    }
    if (input.buyerVergiDairesi) {
      doc.text(`Vergi dairesi: ${input.buyerVergiDairesi}`, colRight, doc.y, {
        width: pageWidth / 2 - 12,
      });
    }
    if (input.buyerAddress) {
      doc.text(input.buyerAddress, colRight, doc.y, { width: pageWidth / 2 - 12 });
    }
    const yAfterBuyer = doc.y;
    doc.y = Math.max(yAfterSeller, yAfterBuyer) + 16;

    const cols = {
      desc: colLeft,
      qty: colLeft + 220,
      unit: colLeft + 265,
      vat: colLeft + 345,
      total: colLeft + 400,
    };

    const headerY = doc.y;
    doc.font("TR-Bold").fontSize(8);
    doc.text("Açıklama", cols.desc, headerY, { width: 210 });
    doc.text("Adet", cols.qty, headerY, { width: 40, align: "right" });
    doc.text("Birim", cols.unit, headerY, { width: 70, align: "right" });
    doc.text("KDV", cols.vat, headerY, { width: 45, align: "right" });
    doc.text("Tutar", cols.total, headerY, { width: 70, align: "right" });
    doc.y = headerY + 14;
    doc
      .moveTo(colLeft, doc.y)
      .lineTo(colLeft + pageWidth, doc.y)
      .strokeColor("#cccccc")
      .stroke();
    doc.moveDown(0.5);
    doc.strokeColor("#000000");

    doc.font("TR").fontSize(8);
    for (const line of input.lines) {
      const rowY = doc.y;
      doc.text(line.description, cols.desc, rowY, { width: 210 });
      const afterDesc = doc.y;
      doc.text(String(line.quantity), cols.qty, rowY, { width: 40, align: "right" });
      doc.text(formatMoney(money(line.unitPriceKurus)), cols.unit, rowY, {
        width: 70,
        align: "right",
      });
      doc.text(vatLabel(line.vatRateBasisPoints), cols.vat, rowY, { width: 45, align: "right" });
      doc.text(formatMoney(money(line.lineTotalKurus)), cols.total, rowY, {
        width: 70,
        align: "right",
      });
      doc.y = Math.max(afterDesc, rowY + 12) + 4;
    }

    doc.moveDown(0.5);
    doc
      .moveTo(colLeft, doc.y)
      .lineTo(colLeft + pageWidth, doc.y)
      .strokeColor("#cccccc")
      .stroke();
    doc.moveDown(0.5);
    doc.strokeColor("#000000");

    const totalsX = colLeft + 280;
    doc.font("TR").fontSize(9);
    const y1 = doc.y;
    doc.text("Ara toplam (KDV hariç)", totalsX, y1, { width: 120 });
    doc.text(formatMoney(money(input.subtotalKurus)), totalsX + 120, y1, {
      width: 80,
      align: "right",
    });
    const y2 = y1 + 14;
    doc.text("KDV tutarı", totalsX, y2, { width: 120 });
    doc.text(formatMoney(money(input.vatKurus)), totalsX + 120, y2, {
      width: 80,
      align: "right",
    });
    const y3 = y2 + 16;
    doc.font("TR-Bold").fontSize(11);
    doc.text("Genel toplam", totalsX, y3, { width: 120 });
    doc.text(formatMoney(money(input.totalKurus)), totalsX + 120, y3, {
      width: 80,
      align: "right",
    });
    doc.y = y3 + 24;

    doc.font("TR-Bold").fontSize(10).text("Sözleşme / ticari koşullar", colLeft);
    doc.font("TR").fontSize(8).fillColor("#333333");
    const terms = [
      "1. Bu proforma, sipariş kalemleri ve birim fiyatların teyididir; fiyatlar sipariş anındaki listeye göre kilitlenmiştir.",
      "2. Ödeme ve vade, bayi cari hesabı / sözleşme koşullarına tabidir. Kredi limiti aşıldığında sevkiyat gecikebilir.",
      "3. Teslimat soğuk zincir ve bölge × gün kısıtlarına uyar; SKT’si geçmiş lot sevk edilmez.",
      "4. İptal ve iade talepleri yazılı olarak iletilir; onaylanmış sevkiyatlar için cari hareket oluşabilir.",
      "5. Resmi e-Fatura / e-Arşiv, yasal süreç tamamlandığında ayrıca düzenlenir.",
    ];
    for (const t of terms) {
      doc.text(t, { width: pageWidth });
      doc.moveDown(0.25);
    }
    doc.fillColor("#000000");

    if (input.note) {
      doc.moveDown(0.5);
      doc.font("TR-Bold").fontSize(9).text("Sipariş notu");
      doc.font("TR").fontSize(8).text(input.note, { width: pageWidth });
    }

    doc.moveDown(1.5);
    doc.fontSize(8).fillColor("#666666").text(`Hazırlayan: ${SITE.name} · ${SITE.email}`, {
      align: "center",
    });

    doc.end();
  });
}
