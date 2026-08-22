export type AnnouncementKind = "DUYURU" | "KAMPANYA";

export type AnnouncementWindow = {
  active: boolean;
  kind: AnnouncementKind;
  startDate: Date | null;
  endDate: Date | null;
};

export type SiteAnnouncement = {
  id: string;
  name: string;
  note: string;
  href: string;
  ctaLabel: string;
  imageUrl: string | null;
};

export function isPublishedAnnouncement(row: AnnouncementWindow, now: Date = new Date()): boolean {
  if (!row.active) return false;
  if (row.kind !== "DUYURU") return false;
  const t = now.getTime();
  if (row.startDate && row.startDate.getTime() > t) return false;
  if (row.endDate && row.endDate.getTime() < t) return false;
  return true;
}

/** Only same-origin paths. Blocks protocol-relative and backslash tricks. */
export function safeSiteHref(href: string | null | undefined): string {
  const t = (href ?? "").trim() || "/urunler";
  if (!t.startsWith("/") || t.startsWith("//") || t.includes("\\")) return "/urunler";
  return t;
}
