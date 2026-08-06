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
};

/** Sentence case labels; soon items are non-navigable in shell + ⌘K. */
export const PANEL_NAV_GROUPS: PanelNavGroup[] = [
  {
    id: "bugun",
    label: "Bugün",
    items: [
      { href: "/panel", label: "Pano", icon: LayoutDashboard, exact: true, status: "ready" },
      { href: "/panel/onay-kuyrugu", label: "Onay kuyruğu", icon: ClipboardCheck, status: "soon" },
      { href: "/panel/sevkiyat", label: "Sevkiyat planı", icon: Truck, status: "ready" },
    ],
  },
  {
    id: "satis",
    label: "Satış",
    items: [
      { href: "/panel/bayi-adaylari", label: "Bayi adayları", icon: Target, badgeKey: "leads", status: "ready" },
      { href: "/panel/bayiler", label: "Bayiler", icon: Users2, status: "ready" },
      { href: "/panel/teklifler", label: "Teklifler", icon: FileText, status: "soon" },
      { href: "/panel/siparisler", label: "Siparişler", icon: ClipboardList, status: "ready" },
      { href: "/panel/b2b/sepetler", label: "Açık sepetler", icon: ShoppingCart, status: "ready" },
      { href: "/panel/kampanyalar", label: "Kampanyalar", icon: Megaphone, status: "soon" },
    ],
  },
  {
    id: "urun",
    label: "Ürün",
    items: [
      { href: "/panel/urunler", label: "Ürünler", icon: Package, status: "ready" },
      { href: "/panel/kategoriler", label: "Kategoriler", icon: FolderTree, status: "ready" },
      { href: "/panel/ureticiler", label: "Üreticiler", icon: Boxes, status: "soon" },
      { href: "/panel/fiyat-listeleri", label: "Fiyat listeleri", icon: Tags, status: "ready" },
      { href: "/panel/stok", label: "Stok & lot", icon: CheckSquare, status: "soon" },
      { href: "/panel/nitelikler", label: "Nitelikler", icon: Shapes, status: "ready" },
    ],
  },
  {
    id: "finans",
    label: "Finans",
    items: [
      { href: "/panel/cari", label: "Cari", icon: Wallet, status: "ready" },
      { href: "/panel/faturalar", label: "Faturalar", icon: FileText, status: "soon" },
      { href: "/panel/tahsilat", label: "Tahsilat", icon: Wallet, status: "soon" },
    ],
  },
  {
    id: "saha",
    label: "Saha",
    items: [
      { href: "/panel/plasiyerler", label: "Plasiyerler", icon: UserRound, status: "soon" },
      { href: "/panel/rotalar", label: "Rotalar", icon: Route, status: "soon" },
      { href: "/panel/ziyaretler", label: "Ziyaretler", icon: MapPin, status: "soon" },
    ],
  },
  {
    id: "iletisim",
    label: "İletişim",
    items: [
      { href: "/panel/whatsapp", label: "WhatsApp", icon: MessageCircleMore, status: "soon" },
      { href: "/panel/icerikler", label: "İçerik & blog", icon: Newspaper, status: "ready" },
      { href: "/panel/tarifler", label: "Reçeteler", icon: ChefHat, status: "ready" },
    ],
  },
  {
    id: "sistem",
    label: "Sistem",
    items: [
      { href: "/panel/kullanicilar", label: "Kullanıcılar", icon: UserCog, status: "ready" },
      { href: "/panel/crm-alanlari", label: "CRM alanları", icon: FormInput, status: "ready" },
      { href: "/panel/analytics", label: "Analytics", icon: ChartColumn, status: "ready" },
      { href: "/panel/seo", label: "SEO", icon: SearchCheck, status: "ready" },
      { href: "/panel/entegrasyonlar", label: "Entegrasyonlar", icon: Plug, status: "soon" },
      { href: "/panel/ayarlar", label: "Ayarlar", icon: Settings, status: "ready" },
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
