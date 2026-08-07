/**
 * Depo barkodları (YG-KS01-VAK-C) kullanıcıya "Parti C" olarak gösterilir.
 * Kod ikincil bilgi olarak kalır — etiket / barkod eşlemesi için.
 */
export function lotPartyLabel(lotNumber: string): string {
  const suffix = lotNumber.split("-").pop()?.trim() ?? "";
  if (!suffix) return "Parti";
  if (/^exp$/i.test(suffix)) return "Süresi geçmiş parti";
  if (/^[a-z]$/i.test(suffix)) return `Parti ${suffix.toUpperCase()}`;
  if (/^\d+$/.test(suffix)) return `Parti ${suffix}`;
  return `Parti ${suffix}`;
}

export function lotSktLine(input: {
  expirationDate: string | Date;
  daysUntilExpiry: number;
  expired: boolean;
  formatDate: (d: Date) => string;
}): string {
  const date = input.formatDate(new Date(input.expirationDate));
  if (input.expired) return `SKT geçti · ${date}`;
  if (input.daysUntilExpiry === 0) return `SKT bugün · ${date}`;
  if (input.daysUntilExpiry === 1) return `SKT yarın · ${date}`;
  if (input.daysUntilExpiry < 0) return `SKT geçti · ${date}`;
  return `SKT ${date} · ${input.daysUntilExpiry} gün kaldı`;
}
