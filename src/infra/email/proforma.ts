import { sendEmail } from "@/infra/email/resend";
import { env } from "@/lib/env";
import { SITE } from "@/lib/site";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { Resend } from "resend";

export type SendProformaEmailInput = {
  to: string;
  buyerUnvan: string;
  number: string;
  totalKurus: number;
  pdf: Buffer;
  filename: string;
};

/**
 * Sends proforma PDF. Without RESEND_API_KEY, logs (mock) and still reports ok.
 */
export async function sendProformaEmail(
  input: SendProformaEmailInput,
): Promise<{ ok: true; mocked: boolean } | { ok: false; error: string }> {
  const subject = `${SITE.name}: Proforma ${input.number}`;
  const html = `
    <p>Sayın ${escapeHtml(input.buyerUnvan)},</p>
    <p><strong>${escapeHtml(input.number)}</strong> numaralı proforma fatura / sipariş sözleşmeniz ekte yer almaktadır.</p>
    <p>Toplam: <strong>${formatMoney(money(input.totalKurus))}</strong></p>
    <p>Bu belge e-Fatura değildir; sipariş teyidi niteliğindedir.</p>
    <p>Saygılarımızla,<br/>${escapeHtml(SITE.name)}</p>
  `;

  if (!env.RESEND_API_KEY) {
    console.log(
      `[email:mock] proforma to=${input.to} number=${input.number} pdfBytes=${input.pdf.length}`,
    );
    // Still exercise the plain sendEmail path in mock for observability
    await sendEmail({ to: input.to, subject, html });
    return { ok: true, mocked: true };
  }

  try {
    const client = new Resend(env.RESEND_API_KEY);
    const { error } = await client.emails.send({
      from: env.EMAIL_FROM,
      to: input.to,
      subject,
      html,
      attachments: [
        {
          filename: input.filename,
          content: input.pdf,
        },
      ],
    });
    if (error) {
      console.error("[email] proforma Resend error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true, mocked: false };
  } catch (err) {
    console.error("[email] proforma send failed:", err);
    return { ok: false, error: err instanceof Error ? err.message : "unknown error" };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
