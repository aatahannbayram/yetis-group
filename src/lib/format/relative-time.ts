const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

const rtf = new Intl.RelativeTimeFormat("tr-TR", { numeric: "auto" });

/** "3 saat önce" / "az önce" - no external dependency. */
export function formatRelativeTime(value: Date, now: Date = new Date()): string {
  const diffSeconds = Math.round((value.getTime() - now.getTime()) / 1000);
  if (Math.abs(diffSeconds) < 45) return "az önce";
  for (const [unit, secondsInUnit] of UNITS) {
    if (Math.abs(diffSeconds) >= secondsInUnit) {
      return rtf.format(Math.round(diffSeconds / secondsInUnit), unit);
    }
  }
  return rtf.format(Math.round(diffSeconds / 60), "minute");
}
