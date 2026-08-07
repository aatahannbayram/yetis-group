import PDFDocument from "pdfkit";
import fs from "node:fs";
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
const LOGO_PATH = path.join(process.cwd(), "public", "brand", "logo-light.png");

const BRAND = "#00693E";
const BRAND_SOFT = "#E8F5EE";
const INK = "#1C1917";
const MUTED = "#78716C";
const LINE = "#E7E5E4";
const SURFACE = "#FAF8F3";

/** @types/pdfkit types `font` as string-only; runtime accepts `false` to skip the eager built-in Helvetica load, which breaks under Turbopack bundling. */
type PDFDocumentOptionsPatched = Omit<
  NonNullable<ConstructorParameters<typeof PDFDocument>[0]>,
  "font"
> & { font?: string | false };

function drawRoundedRect(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
  stroke?: string,
) {
  doc.save();
  doc.roundedRect(x, y, w, h, r);
  if (fill) doc.fillColor(fill).fill();
  if (stroke) {
    doc.roundedRect(x, y, w, h, r);
    doc.strokeColor(stroke).lineWidth(0.8).stroke();
  }
  doc.restore();
}

export async function renderProformaPdf(input: ProformaPdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const options: PDFDocumentOptionsPatched = {
      size: "A4",
      margins: { top: 40, bottom: 48, left: 40, right: 40 },
      font: false,
    };
    const doc = new PDFDocument(options as ConstructorParameters<typeof PDFDocument>[0]);
    doc.registerFont("TR", FONT_REG);
    doc.registerFont("TR-Bold", FONT_BOLD);

    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const pageWidth = right - left;
    const top = doc.page.margins.top;

    // Brand accent strip at top of page
    doc.save();
    doc.rect(0, 0, doc.page.width, 6).fill(BRAND);
    doc.restore();

    // Header: logo + document meta
    const logoExists = fs.existsSync(LOGO_PATH);
    const logoW = 118;
    const logoH = logoW * (1151 / 2250);
    if (logoExists) {
      doc.image(LOGO_PATH, left, top, { width: logoW, height: logoH });
    } else {
      doc
        .font("TR-Bold")
        .fontSize(16)
        .fillColor(BRAND)
        .text(SITE.name, left, top, { width: 160 });
    }

    const metaX = left + 200;
    const metaW = pageWidth - 200;
    let metaY = top;

    doc
      .font("TR-Bold")
      .fontSize(13)
      .fillColor(BRAND)
      .text("PROFORMA FATURA", metaX, metaY, { width: metaW, align: "right" });
    metaY = doc.y + 2;
    doc
      .font("TR")
      .fontSize(9)
      .fillColor(MUTED)
      .text("Sipariş sözleşmesi / ticari teklif", metaX, metaY, {
        width: metaW,
        align: "right",
      });
    metaY = doc.y + 8;

    const metaRows: Array<[string, string]> = [
      ["Belge no", input.number],
      ["Tarih", formatDate(input.issuedAt)],
      ["Sürüm", String(input.version)],
      ["Sipariş ref", `#${input.orderId.slice(-8)}`],
    ];
    for (const [label, value] of metaRows) {
      doc.font("TR").fontSize(8).fillColor(MUTED).text(label, metaX, metaY, {
        width: metaW * 0.42,
        align: "right",
      });
      doc
        .font("TR-Bold")
        .fontSize(8)
        .fillColor(INK)
        .text(value, metaX + metaW * 0.45, metaY, {
          width: metaW * 0.55,
          align: "right",
        });
      metaY += 12;
    }

    const headerBottom = Math.max(top + logoH, metaY) + 10;
    doc
      .moveTo(left, headerBottom)
      .lineTo(right, headerBottom)
      .strokeColor(LINE)
      .lineWidth(1)
      .stroke();

    // Disclaimer banner
    const bannerY = headerBottom + 10;
    drawRoundedRect(doc, left, bannerY, pageWidth, 28, 6, BRAND_SOFT);
    doc
      .font("TR")
      .fontSize(7.5)
      .fillColor(BRAND)
      .text(
        "Bu belge e-Fatura / e-Arşiv değildir. Ticari teklif ve sipariş teyididir; resmi fatura ayrıca kesilir.",
        left + 10,
        bannerY + 9,
        { width: pageWidth - 20 },
      );

    // Parties cards
    const partiesY = bannerY + 40;
    const gap = 12;
    const cardW = (pageWidth - gap) / 2;
    const cardPad = 10;
    const cardInnerW = cardW - cardPad * 2;

    const sellerLines: string[] = [input.sellerName];
    if (input.sellerEmail) sellerLines.push(input.sellerEmail);
    if (input.sellerPhone) sellerLines.push(input.sellerPhone);
    sellerLines.push(SITE.slogan);

    const buyerLines: string[] = [input.buyerUnvan];
    if (input.buyerVergiNo) buyerLines.push(`VKN/TCKN: ${input.buyerVergiNo}`);
    if (input.buyerVergiDairesi) buyerLines.push(`Vergi dairesi: ${input.buyerVergiDairesi}`);
    if (input.buyerAddress) buyerLines.push(input.buyerAddress);

    const lineH = 11;
    const titleH = 16;
    const sellerH = cardPad * 2 + titleH + sellerLines.length * lineH + 4;
    const buyerH = cardPad * 2 + titleH + buyerLines.length * lineH + 4;
    const cardH = Math.max(sellerH, buyerH, 78);

    drawRoundedRect(doc, left, partiesY, cardW, cardH, 8, SURFACE, LINE);
    drawRoundedRect(doc, left + cardW + gap, partiesY, cardW, cardH, 8, SURFACE, LINE);

    // Left accent on seller card
    doc.save();
    doc.rect(left, partiesY, 3, cardH).fill(BRAND);
    doc.rect(left + cardW + gap, partiesY, 3, cardH).fill(BRAND);
    doc.restore();

    doc
      .font("TR-Bold")
      .fontSize(8)
      .fillColor(BRAND)
      .text("SATICI", left + cardPad + 4, partiesY + cardPad, { width: cardInnerW - 4 });
    let sy = partiesY + cardPad + titleH;
    doc.font("TR").fontSize(8).fillColor(INK);
    for (const line of sellerLines) {
      doc.text(line, left + cardPad + 4, sy, { width: cardInnerW - 4 });
      sy += lineH;
    }

    const buyerX = left + cardW + gap;
    doc
      .font("TR-Bold")
      .fontSize(8)
      .fillColor(BRAND)
      .text("ALICI (MÜŞTERİ)", buyerX + cardPad + 4, partiesY + cardPad, {
        width: cardInnerW - 4,
      });
    let by = partiesY + cardPad + titleH;
    doc.font("TR").fontSize(8).fillColor(INK);
    for (const line of buyerLines) {
      doc.text(line, buyerX + cardPad + 4, by, { width: cardInnerW - 4 });
      by += lineH;
    }

    // Line items table
    let tableY = partiesY + cardH + 18;
    const cols = {
      desc: left + 8,
      qty: left + 228,
      unit: left + 278,
      vat: left + 358,
      total: left + 408,
    };
    const colWidths = { desc: 214, qty: 44, unit: 72, vat: 44, total: 72 };
    const headerH = 22;

    drawRoundedRect(doc, left, tableY, pageWidth, headerH, 6, BRAND);
    // square bottom corners of header so it connects to rows visually
    doc.save();
    doc.rect(left, tableY + 10, pageWidth, 12).fill(BRAND);
    doc.restore();

    const headerTextY = tableY + 6;
    doc.font("TR-Bold").fontSize(8).fillColor("#FFFFFF");
    doc.text("Açıklama", cols.desc, headerTextY, { width: colWidths.desc });
    doc.text("Adet", cols.qty, headerTextY, { width: colWidths.qty, align: "right" });
    doc.text("Birim", cols.unit, headerTextY, { width: colWidths.unit, align: "right" });
    doc.text("KDV", cols.vat, headerTextY, { width: colWidths.vat, align: "right" });
    doc.text("Tutar", cols.total, headerTextY, { width: colWidths.total, align: "right" });

    tableY += headerH;
    doc.font("TR").fontSize(8).fillColor(INK);

    input.lines.forEach((line, index) => {
      const rowPad = 6;
      const descHeight = doc.heightOfString(line.description, { width: colWidths.desc });
      const rowH = Math.max(22, descHeight + rowPad * 2);

      if (tableY + rowH > doc.page.height - doc.page.margins.bottom - 180) {
        doc.addPage();
        doc.save();
        doc.rect(0, 0, doc.page.width, 6).fill(BRAND);
        doc.restore();
        tableY = doc.page.margins.top;
      }

      if (index % 2 === 1) {
        doc.save();
        doc.rect(left, tableY, pageWidth, rowH).fill(BRAND_SOFT);
        doc.restore();
      }

      const textY = tableY + rowPad;
      doc.fillColor(INK).font("TR").fontSize(8);
      doc.text(line.description, cols.desc, textY, { width: colWidths.desc });
      doc.text(String(line.quantity), cols.qty, textY, {
        width: colWidths.qty,
        align: "right",
      });
      doc.text(formatMoney(money(line.unitPriceKurus)), cols.unit, textY, {
        width: colWidths.unit,
        align: "right",
      });
      doc.text(vatLabel(line.vatRateBasisPoints), cols.vat, textY, {
        width: colWidths.vat,
        align: "right",
      });
      doc
        .font("TR-Bold")
        .text(formatMoney(money(line.lineTotalKurus)), cols.total, textY, {
          width: colWidths.total,
          align: "right",
        });

      tableY += rowH;
      doc
        .moveTo(left, tableY)
        .lineTo(right, tableY)
        .strokeColor(LINE)
        .lineWidth(0.5)
        .stroke();
    });

    // Totals box
    const totalsW = 220;
    const totalsX = right - totalsW;
    let totalsY = tableY + 14;
    const totalsH = 64;
    drawRoundedRect(doc, totalsX, totalsY, totalsW, totalsH, 8, SURFACE, LINE);

    const labelX = totalsX + 12;
    const valueX = totalsX + 110;
    const valueW = totalsW - 122;

    doc.font("TR").fontSize(8).fillColor(MUTED);
    doc.text("Ara toplam (KDV hariç)", labelX, totalsY + 10, { width: 100 });
    doc.fillColor(INK).text(formatMoney(money(input.subtotalKurus)), valueX, totalsY + 10, {
      width: valueW,
      align: "right",
    });

    doc.fillColor(MUTED).text("KDV tutarı", labelX, totalsY + 24, { width: 100 });
    doc.fillColor(INK).text(formatMoney(money(input.vatKurus)), valueX, totalsY + 24, {
      width: valueW,
      align: "right",
    });

    doc
      .moveTo(totalsX + 10, totalsY + 40)
      .lineTo(totalsX + totalsW - 10, totalsY + 40)
      .strokeColor(LINE)
      .stroke();

    doc.font("TR-Bold").fontSize(10).fillColor(BRAND);
    doc.text("Genel toplam", labelX, totalsY + 46, { width: 100 });
    doc.text(formatMoney(money(input.totalKurus)), valueX, totalsY + 46, {
      width: valueW,
      align: "right",
    });

    // Terms
    let termsY = totalsY + totalsH + 20;
    if (termsY > doc.page.height - doc.page.margins.bottom - 160) {
      doc.addPage();
      doc.save();
      doc.rect(0, 0, doc.page.width, 6).fill(BRAND);
      doc.restore();
      termsY = doc.page.margins.top;
    }

    doc.font("TR-Bold").fontSize(9).fillColor(BRAND).text("Sözleşme / ticari koşullar", left, termsY);
    termsY = doc.y + 6;

    const terms = [
      "1. Bu proforma, sipariş kalemleri ve birim fiyatların teyididir; fiyatlar sipariş anındaki listeye göre kilitlenmiştir.",
      "2. Ödeme ve vade, bayi cari hesabı / sözleşme koşullarına tabidir. Kredi limiti aşıldığında sevkiyat gecikebilir.",
      "3. Teslimat soğuk zincir ve bölge × gün kısıtlarına uyar; SKT’si geçmiş lot sevk edilmez.",
      "4. İptal ve iade talepleri yazılı olarak iletilir; onaylanmış sevkiyatlar için cari hareket oluşabilir.",
      "5. Resmi e-Fatura / e-Arşiv, yasal süreç tamamlandığında ayrıca düzenlenir.",
    ];

    doc.font("TR").fontSize(7.5).fillColor(MUTED);
    for (const t of terms) {
      doc.text(t, left, termsY, { width: pageWidth });
      termsY = doc.y + 3;
    }

    if (input.note) {
      termsY += 8;
      drawRoundedRect(doc, left, termsY, pageWidth, 36, 6, SURFACE, LINE);
      doc
        .font("TR-Bold")
        .fontSize(8)
        .fillColor(BRAND)
        .text("Sipariş notu", left + 10, termsY + 8, { width: pageWidth - 20 });
      doc
        .font("TR")
        .fontSize(8)
        .fillColor(INK)
        .text(input.note, left + 10, termsY + 20, { width: pageWidth - 20 });
      termsY += 44;
    }

    // Footer must stay above PDFKit maxY (page height - bottom margin) or a blank page is created
    const footerY = doc.page.height - doc.page.margins.bottom - 14;
    doc
      .moveTo(left, footerY - 8)
      .lineTo(right, footerY - 8)
      .strokeColor(LINE)
      .lineWidth(0.8)
      .stroke();
    doc
      .font("TR")
      .fontSize(7.5)
      .fillColor(MUTED)
      .text(`${SITE.name}  ·  ${SITE.slogan}  ·  ${SITE.email}`, left, footerY, {
        width: pageWidth,
        align: "center",
        lineBreak: false,
      });

    doc.end();
  });
}
