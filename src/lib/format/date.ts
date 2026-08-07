// DB stores UTC; every presentation surface renders in this timezone.
// Not read from env - this file must stay usable in client components too.
const PRESENTATION_TIMEZONE = "Europe/Istanbul";

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  timeZone: PRESENTATION_TIMEZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateShortFormatter = new Intl.DateTimeFormat("tr-TR", {
  timeZone: PRESENTATION_TIMEZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("tr-TR", {
  timeZone: PRESENTATION_TIMEZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(value: Date): string {
  return dateFormatter.format(value);
}

/** Örn. "9 Ağu 2026" — lot / SKT satırları için. */
export function formatDateShort(value: Date): string {
  return dateShortFormatter.format(value);
}

export function formatDateTime(value: Date): string {
  return dateTimeFormatter.format(value);
}
