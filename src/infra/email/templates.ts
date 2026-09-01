/**
 * Plain-HTML transactional email templates (inline styles - email clients
 * don't reliably support CSS custom properties, so brand hex values are
 * repeated here rather than imported from tokens.css).
 */

const BRAND_GREEN = "#00693e";
const CANVAS = "#f0eee8";
const INK = "#211c16";
const INK_MUTED = "#6b6255";
const BORDER = "#e6e1d6";

function emailShell(input: { preheader: string; heading: string; bodyHtml: string; ctaLabel: string; ctaUrl: string }): string {
  return `<!doctype html>
<html lang="tr">
  <body style="margin:0;padding:0;background:${CANVAS};font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <span style="display:none;font-size:1px;color:${CANVAS};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${input.preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CANVAS};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${BORDER};">
            <tr>
              <td style="padding:28px 32px 8px;">
                <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:0.02em;color:${BRAND_GREEN};text-transform:uppercase;">Yetiş Grup</p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 0;">
                <h1 style="margin:0;font-size:20px;line-height:1.3;color:${INK};font-weight:600;">${input.heading}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 32px 24px;font-size:14px;line-height:1.6;color:${INK_MUTED};">
                ${input.bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px;">
                <a href="${input.ctaUrl}" style="display:inline-block;background:${BRAND_GREEN};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:999px;">${input.ctaLabel}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 24px;border-top:1px solid ${BORDER};">
                <p style="margin:0;font-size:12px;color:${INK_MUTED};">Bu e-posta Yetiş Grup B2B platformu tarafından otomatik gönderildi.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function orderCreatedStaffEmail(input: {
  dealerName: string;
  totalLabel: string;
  orderId: string;
  siteUrl: string;
}): { subject: string; html: string } {
  const shortId = input.orderId.slice(-6).toUpperCase();
  return {
    subject: `Yeni sipariş: ${input.dealerName} (${input.totalLabel})`,
    html: emailShell({
      preheader: `${input.dealerName} yeni bir sipariş verdi.`,
      heading: "Yeni sipariş geldi",
      bodyHtml: `<p style="margin:0 0 8px;"><strong style="color:${INK};">${input.dealerName}</strong> #${shortId} numaralı siparişi verdi.</p><p style="margin:0;">Tutar: <strong style="color:${INK};">${input.totalLabel}</strong></p>`,
      ctaLabel: "Siparişi incele",
      ctaUrl: `${input.siteUrl}/panel/siparisler`,
    }),
  };
}

export function orderCreatedDealerEmail(input: {
  dealerName: string;
  totalLabel: string;
  orderId: string;
  siteUrl: string;
}): { subject: string; html: string } {
  const shortId = input.orderId.slice(-6).toUpperCase();
  return {
    subject: `Siparişiniz alındı (#${shortId})`,
    html: emailShell({
      preheader: `#${shortId} numaralı siparişiniz alındı.`,
      heading: "Siparişiniz alındı",
      bodyHtml: `<p style="margin:0 0 8px;">Merhaba ${input.dealerName},</p><p style="margin:0 0 8px;">#${shortId} numaralı siparişiniz (<strong style="color:${INK};">${input.totalLabel}</strong>) tarafımıza ulaştı, inceleniyor.</p><p style="margin:0;">Durumu değiştiğinde sizi tekrar bilgilendireceğiz.</p>`,
      ctaLabel: "Siparişlerimi gör",
      ctaUrl: `${input.siteUrl}/bayi/siparislerim`,
    }),
  };
}

export function orderStatusChangedDealerEmail(input: {
  dealerName: string;
  statusLabel: string;
  orderId: string;
  siteUrl: string;
}): { subject: string; html: string } {
  const shortId = input.orderId.slice(-6).toUpperCase();
  return {
    subject: `Sipariş #${shortId}: ${input.statusLabel}`,
    html: emailShell({
      preheader: `#${shortId} numaralı siparişinizin durumu güncellendi.`,
      heading: "Sipariş durumu güncellendi",
      bodyHtml: `<p style="margin:0 0 8px;">Merhaba ${input.dealerName},</p><p style="margin:0;">#${shortId} numaralı siparişinizin durumu <strong style="color:${INK};">"${input.statusLabel}"</strong> olarak güncellendi.</p>`,
      ctaLabel: "Siparişlerimi gör",
      ctaUrl: `${input.siteUrl}/bayi/siparislerim`,
    }),
  };
}

export function sampleRequestCreatedStaffEmail(input: {
  dealerName: string;
  requestNo: string;
  itemCount: number;
  siteUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Yeni numune talebi: ${input.dealerName} (${input.requestNo})`,
    html: emailShell({
      preheader: `${input.dealerName} yeni bir numune talebi açtı.`,
      heading: "Yeni numune talebi",
      bodyHtml: `<p style="margin:0 0 8px;"><strong style="color:${INK};">${input.dealerName}</strong> ${input.requestNo} numaralı talepte ${input.itemCount} ürün istedi.</p>`,
      ctaLabel: "Talebi incele",
      ctaUrl: `${input.siteUrl}/panel/numuneler`,
    }),
  };
}

export function sampleRequestCreatedDealerEmail(input: {
  dealerName: string;
  requestNo: string;
  siteUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Numune talebiniz alındı (${input.requestNo})`,
    html: emailShell({
      preheader: `${input.requestNo} numaralı numune talebiniz alındı.`,
      heading: "Numune talebiniz alındı",
      bodyHtml: `<p style="margin:0 0 8px;">Merhaba ${input.dealerName},</p><p style="margin:0;">${input.requestNo} numaralı numune talebiniz tarafımıza ulaştı, inceleniyor.</p>`,
      ctaLabel: "Taleplerimi gör",
      ctaUrl: `${input.siteUrl}/bayi/numune`,
    }),
  };
}

export function sampleRequestStatusChangedDealerEmail(input: {
  dealerName: string;
  requestNo: string;
  statusLabel: string;
  siteUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Numune talebi ${input.requestNo}: ${input.statusLabel}`,
    html: emailShell({
      preheader: `${input.requestNo} numaralı numune talebinizin durumu güncellendi.`,
      heading: "Numune talebi güncellendi",
      bodyHtml: `<p style="margin:0 0 8px;">Merhaba ${input.dealerName},</p><p style="margin:0;">${input.requestNo} numaralı numune talebinizin durumu <strong style="color:${INK};">"${input.statusLabel}"</strong> olarak güncellendi.</p>`,
      ctaLabel: "Taleplerimi gör",
      ctaUrl: `${input.siteUrl}/bayi/numune`,
    }),
  };
}

export function returnRequestCreatedStaffEmail(input: {
  dealerName: string;
  returnNo: string;
  itemCount: number;
  siteUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Yeni iade talebi: ${input.dealerName} (${input.returnNo})`,
    html: emailShell({
      preheader: `${input.dealerName} yeni bir iade talebi açtı.`,
      heading: "Yeni iade talebi",
      bodyHtml: `<p style="margin:0 0 8px;"><strong style="color:${INK};">${input.dealerName}</strong> ${input.returnNo} numaralı talepte ${input.itemCount} kalem iade istedi.</p>`,
      ctaLabel: "Talebi incele",
      ctaUrl: `${input.siteUrl}/panel/iadeler`,
    }),
  };
}

export function returnRequestCreatedDealerEmail(input: {
  dealerName: string;
  returnNo: string;
  siteUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `İade talebiniz alındı (${input.returnNo})`,
    html: emailShell({
      preheader: `${input.returnNo} numaralı iade talebiniz alındı.`,
      heading: "İade talebiniz alındı",
      bodyHtml: `<p style="margin:0 0 8px;">Merhaba ${input.dealerName},</p><p style="margin:0;">${input.returnNo} numaralı iade talebiniz tarafımıza ulaştı, inceleniyor.</p>`,
      ctaLabel: "İadelerimi gör",
      ctaUrl: `${input.siteUrl}/bayi/iade`,
    }),
  };
}

export function returnRequestStatusChangedDealerEmail(input: {
  dealerName: string;
  returnNo: string;
  statusLabel: string;
  siteUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `İade talebi ${input.returnNo}: ${input.statusLabel}`,
    html: emailShell({
      preheader: `${input.returnNo} numaralı iade talebinizin durumu güncellendi.`,
      heading: "İade talebi güncellendi",
      bodyHtml: `<p style="margin:0 0 8px;">Merhaba ${input.dealerName},</p><p style="margin:0;">${input.returnNo} numaralı iade talebinizin durumu <strong style="color:${INK};">"${input.statusLabel}"</strong> olarak güncellendi.</p>`,
      ctaLabel: "İadelerimi gör",
      ctaUrl: `${input.siteUrl}/bayi/iade`,
    }),
  };
}
