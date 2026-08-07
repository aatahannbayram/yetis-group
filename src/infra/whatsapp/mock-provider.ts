/**
 * Dev-only mock provider. Never calls the real Meta API (CLAUDE.md).
 * Logs the rendered body and returns a fake provider message id.
 */
export type WhatsAppSendResult =
  | { ok: true; providerMessageId: string }
  | { ok: false; error: string };

export async function sendMockWhatsAppMessage(input: {
  toPhone: string;
  body: string;
}): Promise<WhatsAppSendResult> {
  console.log(`[whatsapp:mock] -> ${input.toPhone}: ${input.body}`);
  return {
    ok: true,
    providerMessageId: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
}
