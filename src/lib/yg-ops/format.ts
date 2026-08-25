/** Yetiş Ops format helpers: money, date, pack+kg. Locale: tr-TR. */

const trMoney = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const trNumber = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const trKg = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** Integer kuruş → ₺1.245,00 */
export function formatYgMoney(kurus: number): string {
  return trMoney.format(kurus / 100);
}

/** Date → GG.AA.YYYY (Europe/Istanbul calendar day) */
export function formatYgDate(input: Date | string | number): string {
  const d = input instanceof Date ? input : new Date(input);
  const parts = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(d);
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  return `${day}.${month}.${year}`;
}

/** Dual unit: "3 koli (54,0 kg)" */
export function formatYgQty(packs: number, kg: number, packLabel = "koli"): string {
  return `${trNumber.format(packs)} ${packLabel} (${trKg.format(kg)} kg)`;
}

export function daysUntil(date: Date | string | number, now = new Date()): number {
  const target = date instanceof Date ? date : new Date(date);
  const ms = target.getTime() - now.getTime();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

export type SktTone = "ok" | "warn" | "soon" | "critical";

export function sktToneFromDays(days: number): SktTone {
  if (days <= 0) return "critical";
  if (days <= 7) return "soon";
  if (days <= 30) return "warn";
  return "ok";
}
