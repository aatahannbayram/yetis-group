/**
 * Generates docs/bayi-panel-giris.pdf for presentation (live site).
 * Usage: pnpm exec tsx scripts/generate-bayi-panel-guide-pdf.ts
 */
import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";

const FONT_REG = path.join(process.cwd(), "public", "fonts", "NotoSans-Regular.ttf");
const FONT_BOLD = path.join(process.cwd(), "public", "fonts", "NotoSans-Bold.ttf");
const LOGO = path.join(process.cwd(), "public", "brand", "logo-light.png");
const OUT = path.join(process.cwd(), "docs", "bayi-panel-giris.pdf");

const SITE = "https://yetisgrup.com";

const BRAND = "#00693E";
const BRAND_SOFT = "#E8F5EE";
const INK = "#1C1917";
const MUTED = "#57534E";
const LINE = "#E7E5E4";
const SURFACE = "#FAF8F3";

type PDFDoc = InstanceType<typeof PDFDocument>;

function roundedRect(
  doc: PDFDoc,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  stroke?: string,
) {
  doc.save();
  doc.roundedRect(x, y, w, h, 5).fill(fill);
  if (stroke) {
    doc.roundedRect(x, y, w, h, 5).strokeColor(stroke).lineWidth(0.6).stroke();
  }
  doc.restore();
}

async function main() {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  const buf = await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 26, bottom: 40, left: 34, right: 34 },
      font: false,
    } as ConstructorParameters<typeof PDFDocument>[0]);
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
    // Keep all content above this so PDFKit never auto-creates page 2
    const safeBottom = doc.page.height - doc.page.margins.bottom - 4;

    doc.save();
    doc.rect(0, 0, doc.page.width, 5).fill(BRAND);
    doc.restore();

    const logoW = 88;
    const logoH = logoW * (1151 / 2250);
    if (fs.existsSync(LOGO)) {
      doc.image(LOGO, left, top, { width: logoW, height: logoH });
    }

    doc
      .font("TR-Bold")
      .fontSize(12)
      .fillColor(BRAND)
      .text("Bayi paneli sunum rehberi", left + 100, top + 1, {
        width: pageWidth - 100,
        align: "right",
        lineBreak: false,
      });
    doc
      .font("TR")
      .fontSize(7.5)
      .fillColor(MUTED)
      .text(`${SITE}  |  ${new Date().toLocaleDateString("tr-TR")}`, left + 100, top + 18, {
        width: pageWidth - 100,
        align: "right",
        lineBreak: false,
      });

    let y = top + Math.max(logoH, 30) + 6;
    doc.moveTo(left, y).lineTo(right, y).strokeColor(LINE).lineWidth(0.7).stroke();
    y += 8;

    const h2 = (t: string) => {
      doc.font("TR-Bold").fontSize(9).fillColor(BRAND).text(t, left, y, {
        width: pageWidth,
        lineBreak: false,
      });
      y += 12;
    };

    const bullet = (t: string) => {
      doc.font("TR").fontSize(8).fillColor(INK).text(t, left, y, {
        width: pageWidth,
        lineBreak: false,
      });
      y += 11;
    };

    // --- 1 ---
    h2("1. Gosterim sonucu (canli dogrulama)");
    bullet("Degisiklik canlida dogrulandi. Bayi kontrol paneli: /bayi");

    const box1H = 72;
    roundedRect(doc, left, y, pageWidth, box1H, SURFACE, LINE);
    doc.save();
    doc.rect(left, y, 3, box1H).fill(BRAND);
    doc.restore();

    const showRows: Array<[string, string]> = [
      ["Baslik", "Hos geldiniz, Test Bayi"],
      ["Etiket", "MARKET / SARKUTERI"],
      ["Ust menu", "Ozet | Siparis | Gecmis | Teslimat | Cari"],
      ["Diger", "Belgeler / Firsatlar / Adresler / Firma"],
      ["Ozet", "Kredi limiti, gecen siparisi tekrarla, kayitli listeler, son siparis durumu"],
    ];
    let ry = y + 6;
    for (const [k, v] of showRows) {
      doc.font("TR").fontSize(7.5).fillColor(MUTED).text(k, left + 9, ry, {
        width: 54,
        lineBreak: false,
      });
      doc.font("TR-Bold").fontSize(8).fillColor(INK).text(v, left + 66, ry, {
        width: pageWidth - 78,
        lineBreak: false,
      });
      ry += 12.5;
    }
    y += box1H + 7;

    // --- 2 ---
    h2("2. Bayi paneline giris adimlari");
    bullet(`1. Magazada sag ust "Bayi Girisi" butonu -> ${SITE}/auth`);
    bullet('2. Bayi e-postasi + sifre ile "Giris Yap".');
    bullet("3. Otomatik /bayi paneline dusersin (oncesinde /urunler magazasina gidiyordu).");
    y += 2;

    // --- 3 ---
    h2("3. Demo giris bilgileri");
    const colGap = 8;
    const colW = (pageWidth - colGap) / 2;
    const box2H = 78;
    roundedRect(doc, left, y, colW, box2H, SURFACE, LINE);
    roundedRect(doc, left + colW + colGap, y, colW, box2H, SURFACE, LINE);
    doc.save();
    doc.rect(left, y, 3, box2H).fill(BRAND);
    doc.rect(left + colW + colGap, y, 3, box2H).fill(BRAND);
    doc.restore();

    const leftCreds: Array<[string, string]> = [
      ["Bayi e-posta", "bayi@yetisgrup.test"],
      ["Sifre", "YetisDemo1!"],
      ["HORECA e-posta", "horeca@yetisgrup.test"],
      ["HORECA sifre", "YetisDemo1!"],
    ];
    const rightCreds: Array<[string, string]> = [
      ["Site", SITE],
      ["Giris", `${SITE}/auth`],
      ["Bayi paneli", `${SITE}/bayi`],
      ["Yonetim", `${SITE}/panel`],
      ["Admin e-posta", "admin@yetisgrup.test"],
      ["Admin sifre", "YetisDemo1!"],
    ];

    ry = y + 7;
    for (const [k, v] of leftCreds) {
      doc.font("TR").fontSize(7).fillColor(MUTED).text(k, left + 9, ry, {
        width: 82,
        lineBreak: false,
      });
      doc.font("TR-Bold").fontSize(7.5).fillColor(INK).text(v, left + 94, ry, {
        width: colW - 104,
        lineBreak: false,
      });
      ry += 16;
    }

    ry = y + 5;
    for (const [k, v] of rightCreds) {
      doc.font("TR").fontSize(7).fillColor(MUTED).text(k, left + colW + colGap + 9, ry, {
        width: 72,
        lineBreak: false,
      });
      doc.font("TR-Bold").fontSize(7.5).fillColor(INK).text(v, left + colW + colGap + 84, ry, {
        width: colW - 94,
        lineBreak: false,
      });
      ry += 11.5;
    }
    y += box2H + 5;

    roundedRect(doc, left, y, pageWidth, 18, BRAND_SOFT);
    doc
      .font("TR")
      .fontSize(7)
      .fillColor(BRAND)
      .text("Sifreler DB'de yoksa bir kez: pnpm demo:passwords", left + 9, y + 5, {
        width: pageWidth - 18,
        lineBreak: false,
      });
    y += 24;

    // --- 4 ---
    h2("4. Yonlendirme notlari");
    bullet("- Personel (admin@yetisgrup.test) -> /panel");
    bullet("- Bayi kaydi olan kullanici -> /bayi");
    bullet("- Bayi kaydi olmayan / onay bekleyen -> /urunler");
    y += 2;

    // --- 5 ---
    h2("5. Bayi paneli ekran haritasi");
    const routes: Array<[string, string]> = [
      ["/bayi", "Ozet: hos geldin, kredi limiti, tekrarla, listeler, son siparis"],
      ["/bayi/siparis", "Siparis / sepet workspace"],
      ["/bayi/siparislerim", "Siparis gecmisi (Gecmis)"],
      ["/bayi/teslimat", "Teslimat takibi"],
      ["/bayi/cari", "Cari bakiye ve hareketler"],
      ["/bayi/belgeler", "Belgeler (proforma vb.)"],
      ["/bayi/firsatlar", "Firsatlar"],
      ["/bayi/adreslerim", "Teslimat adresleri"],
      ["/bayi/firmam", "Firma bilgileri"],
      ["/bayi/bildirimler", "Bildirimler"],
      ["/bayi/destek", "Destek"],
    ];

    const th = 14;
    doc.save();
    doc.roundedRect(left, y, pageWidth, th, 4).fill(BRAND);
    doc.rect(left, y + 5, pageWidth, 9).fill(BRAND);
    doc.restore();
    doc.font("TR-Bold").fontSize(7).fillColor("#FFFFFF");
    doc.text("Rota", left + 7, y + 3, { width: 120, lineBreak: false });
    doc.text("Aciklama", left + 135, y + 3, { width: pageWidth - 145, lineBreak: false });
    y += th;

    routes.forEach(([route, desc], i) => {
      const rh = 12.5;
      if (i % 2 === 1) {
        doc.save();
        doc.rect(left, y, pageWidth, rh).fill(BRAND_SOFT);
        doc.restore();
      }
      doc.font("TR-Bold").fontSize(7).fillColor(BRAND).text(route, left + 7, y + 2, {
        width: 120,
        lineBreak: false,
      });
      doc.font("TR").fontSize(7).fillColor(INK).text(desc, left + 135, y + 2, {
        width: pageWidth - 145,
        lineBreak: false,
      });
      y += rh;
    });
    y += 6;

    // --- 6 ---
    h2("6. Onerilen sunum akisi");
    bullet(`1. ${SITE} -> "Bayi Girisi" -> auth`);
    bullet("2. bayi@yetisgrup.test / YetisDemo1! -> /bayi ozet");
    bullet("3. Siparis -> urun ekle / sepet");
    bullet("4. Gecmis + Teslimat");
    bullet("5. Cari + Belgeler (proforma)");
    bullet(`6. Istege bagli: ${SITE}/panel (admin)`);
    y += 3;

    const noteH = 28;
    roundedRect(doc, left, y, pageWidth, noteH, SURFACE, LINE);
    doc
      .font("TR-Bold")
      .fontSize(7)
      .fillColor(BRAND)
      .text("Magaza vs bayi paneli", left + 9, y + 4, {
        width: pageWidth - 18,
        lineBreak: false,
      });
    doc
      .font("TR")
      .fontSize(7)
      .fillColor(INK)
      .text(
        `Vitrin: ${SITE} ve /urunler. Operasyon: /bayi. Bayi hesabi her iki yuzeye de erisebilir.`,
        left + 9,
        y + 15,
        { width: pageWidth - 18, lineBreak: false },
      );
    y += noteH + 8;

    // Footer inside safe area (prevents blank page 2)
    const footerY = Math.min(y + 4, safeBottom - 14);
    doc
      .moveTo(left, footerY)
      .lineTo(right, footerY)
      .strokeColor(LINE)
      .lineWidth(0.6)
      .stroke();
    doc
      .font("TR")
      .fontSize(6.5)
      .fillColor(MUTED)
      .text(
        "Yetis Grup  |  Temiz Gidaya Eris, Saglikli Yetis  |  info@yetisgrup.com",
        left,
        footerY + 4,
        { width: pageWidth, align: "center", lineBreak: false },
      );

    doc.end();
  });

  fs.writeFileSync(OUT, buf);
  console.log(OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
