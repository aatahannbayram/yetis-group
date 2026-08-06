import { differenceInCalendarDays } from "date-fns";

/** Days in current stage approximated from last update. */
export function leadStaleDays(updatedAt: string | Date, now = new Date()): number {
  const d = typeof updatedAt === "string" ? new Date(updatedAt) : updatedAt;
  return Math.max(0, differenceInCalendarDays(now, d));
}

export function leadStaleTone(days: number): "ok" | "warn" | "urgent" | "critical" {
  if (days >= 15) return "critical";
  if (days >= 8) return "urgent";
  if (days >= 4) return "warn";
  return "ok";
}

export function leadStaleBorder(days: number): string | null {
  const tone = leadStaleTone(days);
  if (tone === "critical") return "var(--stale-critical)";
  if (tone === "urgent") return "var(--stale-urgent)";
  if (tone === "warn") return "var(--stale-warn)";
  return null;
}

export function leadStaleLabel(days: number): string {
  if (days <= 0) return "Bugün";
  if (days === 1) return "1 gün";
  return `${days} gün`;
}
