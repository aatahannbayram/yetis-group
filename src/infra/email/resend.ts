import { Resend } from "resend";
import { env } from "@/lib/env";

const client = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export type SendEmailResult =
  | { ok: true; mocked: boolean }
  | { ok: false; error: string };

/**
 * Dev-safe: without RESEND_API_KEY, logs instead of sending (mirrors the
 * WhatsApp mock-provider pattern - no real provider calls outside prod).
 * Never throws; callers treat email as a best-effort side effect.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!client) {
    console.log(`[email:mock] to=${input.to} subject="${input.subject}"`);
    return { ok: true, mocked: true };
  }

  try {
    const { error } = await client.emails.send({
      from: env.EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
    if (error) {
      console.error("[email] Resend error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true, mocked: false };
  } catch (err) {
    console.error("[email] Resend send failed:", err);
    return { ok: false, error: err instanceof Error ? err.message : "unknown error" };
  }
}
