import { z } from "zod";

export const CONSENT_STORAGE_KEY = "yg_consent_v1";

export const consentSchema = z.object({
  necessary: z.literal(true),
  analytics: z.boolean(),
  marketing: z.boolean(),
  updatedAt: z.string(),
});

export type ConsentState = z.infer<typeof consentSchema>;

export function defaultConsent(): ConsentState {
  return {
    necessary: true,
    analytics: false,
    marketing: false,
    updatedAt: new Date(0).toISOString(),
  };
}

export function parseConsent(raw: unknown): ConsentState | null {
  const parsed = consentSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export function acceptAllConsent(): ConsentState {
  return {
    necessary: true,
    analytics: true,
    marketing: true,
    updatedAt: new Date().toISOString(),
  };
}

export function rejectOptionalConsent(): ConsentState {
  return {
    necessary: true,
    analytics: false,
    marketing: false,
    updatedAt: new Date().toISOString(),
  };
}
