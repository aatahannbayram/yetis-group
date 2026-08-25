/** Yetiş personel rolleri (Prisma StaffRole ile uyumlu). */
export type StaffRole = "YONETICI" | "SATIS" | "PLASIYER" | "MUHASEBE" | "DEPO";

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  YONETICI: "Yönetici",
  SATIS: "Satış",
  PLASIYER: "Plasiyer",
  MUHASEBE: "Muhasebe",
  DEPO: "Depo",
};

/** Plasiyer panelinde görünen path önekleri (`/panel` hariç exact). */
export const PLASIYER_PANEL_PREFIXES = [
  "/panel/siparisler",
  "/panel/sevkiyat",
  "/panel/bildirimler",
  "/panel/b2b/sepetler",
  "/panel/bayiler",
  "/panel/rotalar",
  "/panel/rota",
  "/panel/ziyaretler",
] as const;

export function effectiveStaffRole(
  accountType: "STAFF" | "DEALER" | string,
  staffRole: StaffRole | null | undefined,
): StaffRole | null {
  if (accountType !== "STAFF") return null;
  return staffRole ?? "YONETICI";
}

export function isPlasiyerRole(role: StaffRole | null | undefined): boolean {
  return role === "PLASIYER";
}

/** Tam panel (katalog, finans, sistem…) — plasiyer hariç. */
export function hasFullPanelAccess(role: StaffRole | null | undefined): boolean {
  return !isPlasiyerRole(role);
}

export function canAccessPanelPath(
  pathname: string,
  role: StaffRole | null | undefined,
): boolean {
  if (!isPlasiyerRole(role)) return true;
  if (pathname === "/panel") return true;
  return PLASIYER_PANEL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
