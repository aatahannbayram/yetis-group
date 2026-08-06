/** Impersonation cookie helpers (client + server readable). */

export const IMPERSONATE_COOKIE = "yetis_impersonate_dealer";

export function parseImpersonationCookie(value: string | undefined | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
