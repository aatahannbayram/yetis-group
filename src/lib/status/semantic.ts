import type { StatusTone } from "@/components/ui/status-badge";

/** SKT days remaining → tone. Brief: >30 ok, 15-30 info, 4-14 warn, ≤3/past danger */
export function sktToneFromDays(daysRemaining: number): StatusTone {
  if (daysRemaining < 0 || daysRemaining <= 3) return "skt-danger";
  if (daysRemaining <= 14) return "skt-warn";
  if (daysRemaining <= 30) return "skt-info";
  return "skt-ok";
}

export function sktLabelFromDays(daysRemaining: number): string {
  if (daysRemaining < 0) return `Geçti ${Math.abs(daysRemaining)}g`;
  if (daysRemaining === 0) return "Bugün bitiyor";
  return `${daysRemaining} gün`;
}

/** Credit utilization 0–1 → bar tone */
export function creditUtilTone(ratio: number): "neutral" | "warning" | "danger" {
  if (ratio >= 0.9) return "danger";
  if (ratio >= 0.7) return "warning";
  return "neutral";
}
