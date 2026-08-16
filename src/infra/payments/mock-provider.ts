/**
 * Dev-only mock provider. Never calls a real payment gateway (CLAUDE.md).
 * Captures the payment instantly and returns a fake provider reference.
 */
export type PaymentCaptureResult =
  | { ok: true; providerRef: string }
  | { ok: false; error: string };

export async function captureMockPayment(input: {
  orderId: string;
  amountKurus: number;
}): Promise<PaymentCaptureResult> {
  console.log(`[payments:mock] captured ${input.amountKurus} kuruş for order ${input.orderId}`);
  return {
    ok: true,
    providerRef: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
}
