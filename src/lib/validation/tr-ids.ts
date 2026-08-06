/** TR vergi no: 10 (VKN) or 11 (TCKN) digits */
export function isValidVergiNo(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}

/** Basic TR IBAN: TR + 24 digits (26 chars total), mod-97 check */
export function isValidTrIban(value: string): boolean {
  const iban = value.replace(/\s+/g, "").toUpperCase();
  if (!/^TR\d{24}$/.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const expanded = rearranged.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let remainder = 0;
  for (const ch of expanded) {
    remainder = (remainder * 10 + Number(ch)) % 97;
  }
  return remainder === 1;
}

export function normalizeIban(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}
