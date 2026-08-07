import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  Users2,
  Target,
  ClipboardList,
  Wallet,
  Truck,
  MessageCircleMore,
  Settings,
  Tags,
  UserCog,
  FolderTree,
  Shapes,
  Newspaper,
  ChefHat,
  SearchCheck,
  FormInput,
  ChartColumn,
  ShoppingCart,
  CheckSquare,
  Route,
  MapPin,
  UserRound,
  FileText,
  Megaphone,
  Boxes,
  Plug,
  ClipboardCheck,
  Bell,
  Receipt,
} from "lucide-react";

export type NavStatus = "ready" | "soon";

export type PanelNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  status: NavStatus;
  badgeKey?: "leads";
  exact?: boolean;
};

export type PanelNavGroup = {
  id: string;
  label: string;
  items: PanelNavItem[];
  /** Collapsed on first visit (low-frequency sections). */
  defaultCollapsed?: boolean;
};

/**
 * Nav ordered by daily B2B ops priority:
 * Sipariş → katalog → müşteri → sevkiyat → cari → CRM → sistem.
 * "soon" items stay at the end of each group and are visually muted.
 */
export const PANEL_NAV_GROUPS: PanelNavGroup[] = [
  {
    id: "operasyon",
    label: "Operasyon",
    items: [
      { href: "/panel", label: "Pano", icon: LayoutDashboard, exact: true, status: "ready" },
      { href: "/panel/siparisler", label: "Siparişler", icon: ClipboardList, status: "ready" },
      { href: "/panel/sevkiyat", label: "Sevkiyat", icon: Truck, status: "ready" },
      { href: "/panel/b2b/sepetler", label: "Açık sepetler", icon: ShoppingCart, status: "ready" },
      { href: "/panel/bildirimler", label: "Bildirimler", icon: Bell, status: "ready" },
      { href: "/panel/onay-kuyrugu", label: "Onay kuyruğu", icon: ClipboardCheck, status: "soon" },
    ],
  },
  {
    id: "satis",
    label: "Satış",
    items: [
      { href: "/panel/bayiler", label: "Bayi/Müşteriler", icon: Users2, status: "ready" },
      {
        href: "/panel/bayi-adaylari",
        label: "Bayi adayları",
        icon: Target,
        badgeKey: "leads",
        status: "ready",
      },
      { href: "/panel/teklifler", label: "Teklifler", icon: FileText, status: "soon" },
      { href: "/panel/kampanyalar", label: "Kampanyalar", icon: Megaphone, status: "soon" },
    ],
  },
  {
    id: "katalog",
    label: "Katalog",
    items: [
      { href: "/panel/urunler", label: "Ürünler", icon: Package, status: "ready" },
      { href: "/panel/kategoriler", label: "Kategoriler", icon: FolderTree, status: "ready" },
      { href: "/panel/fiyat-listeleri", label: "Fiyat listeleri", icon: Tags, status: "ready" },
      { href: "/panel/nitelikler", label: "Ürün özellikleri", icon: Shapes, status: "ready" },
      { href: "/panel/stok", label: "Stok & lot", icon: CheckSquare, status: "ready" },
      { href: "/panel/ureticiler", label: "Üreticiler", icon: Boxes, status: "soon" },
    ],
  },
  {
    id: "finans",
    label: "Finans",
    items: [
      { href: "/panel/cari", label: "Cari", icon: Wallet, status: "ready" },
      { href: "/panel/faturalar", label: "Faturalar", icon: Receipt, status: "ready" },
      { href: "/panel/tahsilat", label: "Tahsilat", icon: Wallet, status: "soon" },
    ],
  },
  {
    id: "icerik",
    label: "İçerik",
    defaultCollapsed: true,
    items: [
      { href: "/panel/icerikler", label: "İçerik & blog", icon: Newspaper, status: "ready" },
      { href: "/panel/tarifler", label: "Reçeteler", icon: ChefHat, status: "ready" },
      { href: "/panel/whatsapp", label: "WhatsApp", icon: MessageCircleMore, status: "soon" },
    ],
  },
  {
    id: "saha",
    label: "Saha",
    defaultCollapsed: true,
    items: [
      { href: "/panel/plasiyerler", label: "Plasiyerler", icon: UserRound, status: "soon" },
      { href: "/panel/rotalar", label: "Rotalar", icon: Route, status: "soon" },
      { href: "/panel/ziyaretler", label: "Ziyaretler", icon: MapPin, status: "soon" },
    ],
  },
  {
    id: "sistem",
    label: "Sistem",
    defaultCollapsed: true,
    items: [
      { href: "/panel/kullanicilar", label: "Kullanıcılar", icon: UserCog, status: "ready" },
      { href: "/panel/ayarlar", label: "Ayarlar", icon: Settings, status: "ready" },
      { href: "/panel/crm-alanlari", label: "CRM alanları", icon: FormInput, status: "ready" },
      { href: "/panel/analytics", label: "Analytics", icon: ChartColumn, status: "ready" },
      { href: "/panel/seo", label: "SEO", icon: SearchCheck, status: "ready" },
      { href: "/panel/entegrasyonlar", label: "Entegrasyonlar", icon: Plug, status: "soon" },
    ],
  },
];

export const PANEL_PAGE_TITLES: Record<string, string> = Object.fromEntries(
  PANEL_NAV_GROUPS.flatMap((g) => g.items.map((i) => [i.href, i.label])),
);

export function panelTitleFromPath(pathname: string): string {
  if (PANEL_PAGE_TITLES[pathname]) return PANEL_PAGE_TITLES[pathname];
  const match = Object.keys(PANEL_PAGE_TITLES)
    .filter((k) => k !== "/panel" && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return match ? PANEL_PAGE_TITLES[match]! : "Pano";
}

export function isReadyHref(href: string): boolean {
  return PANEL_NAV_GROUPS.some((g) =>
    g.items.some((i) => i.href === href && i.status === "ready"),
  );
}
