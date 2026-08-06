"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Store,
  ExternalLink,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { BrandMark, Logo } from "@/components/ui/logo";
import { useAdminTheme } from "@/components/admin/admin-theme-context";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: "leads";
  exact?: boolean;
};

const overviewItems: NavItem[] = [
  { href: "/admin", label: "Pano", icon: LayoutDashboard, exact: true },
  { href: "/admin/analytics", label: "Analytics", icon: ChartColumn },
];

const crmItems: NavItem[] = [
  { href: "/admin/bayi-adaylari", label: "Bayi Adayları", icon: Target, badgeKey: "leads" },
  { href: "/admin/bayiler", label: "Bayiler", icon: Users2 },
  { href: "/admin/crm-alanlari", label: "CRM Alanları", icon: FormInput },
];

const b2bItems: NavItem[] = [
  { href: "/admin/siparisler", label: "Siparişler", icon: ClipboardList },
  { href: "/admin/b2b/sepetler", label: "Açık Sepetler", icon: ShoppingCart },
  { href: "/admin/cari", label: "Cari", icon: Wallet },
  { href: "/admin/sevkiyat", label: "Sevkiyat", icon: Truck },
  { href: "/admin/b2b/katalog", label: "B2B Katalog", icon: Store },
];

const catalogItems: NavItem[] = [
  { href: "/admin/urunler", label: "Ürün Yönetimi", icon: Package },
  { href: "/admin/fiyat-listeleri", label: "Fiyat Listeleri", icon: Tags },
  { href: "/admin/kategoriler", label: "Kategoriler", icon: FolderTree },
  { href: "/admin/nitelikler", label: "Nitelikler", icon: Shapes },
];

const contentItems: NavItem[] = [
  { href: "/admin/icerikler", label: "Haberler", icon: Newspaper },
  { href: "/admin/tarifler", label: "Tarifler", icon: ChefHat },
  { href: "/admin/seo", label: "SEO / AEO", icon: SearchCheck },
];

const systemItems: NavItem[] = [
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: UserCog },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: MessageCircleMore },
];

function isActivePath(pathname: string, href: string, exact?: boolean) {
  if (exact || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function activeButtonClass(isActive: boolean) {
  return isActive
    ? "rounded-xl border-l-[3px] border-brand-600 bg-brand-50 pl-2.5 font-semibold text-brand-700 hover:bg-brand-50 hover:text-brand-700"
    : "rounded-xl border-l-[3px] border-transparent pl-2.5";
}

function NavGroup({
  label,
  items,
  openLeadsCount,
}: {
  label: string;
  items: NavItem[];
  openLeadsCount: number;
}) {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(({ href, label: itemLabel, icon: Icon, badgeKey, exact }) => {
            const active = isActivePath(pathname, href, exact);
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={itemLabel}
                  className={activeButtonClass(active)}
                >
                  <Link
                    href={href}
                    onClick={() => {
                      if (isMobile) setOpenMobile(false);
                    }}
                  >
                    <Icon />
                    <span>{itemLabel}</span>
                  </Link>
                </SidebarMenuButton>
                {badgeKey === "leads" && openLeadsCount > 0 ? (
                  <SidebarMenuBadge className="rounded-full bg-brand-100 text-brand-700 peer-data-[active=true]/menu-button:text-brand-700">
                    {openLeadsCount}
                  </SidebarMenuBadge>
                ) : null}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AdminSidebar({ openLeadsCount }: { openLeadsCount: number }) {
  const pathname = usePathname();
  const { theme } = useAdminTheme();
  const { setOpenMobile, isMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border px-4 md:h-20">
        <Link
          href="/admin"
          className="flex items-center justify-center px-1 transition-opacity hover:opacity-80"
          onClick={() => {
            if (isMobile) setOpenMobile(false);
          }}
        >
          <Logo
            variant={theme === "dark" ? "dark" : "light"}
            size="md"
            className="group-data-[collapsible=icon]:hidden"
          />
          <BrandMark
            size={26}
            className="hidden group-data-[collapsible=icon]:block"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-1">
        <NavGroup label="Genel bakış" items={overviewItems} openLeadsCount={openLeadsCount} />
        <NavGroup label="CRM" items={crmItems} openLeadsCount={openLeadsCount} />
        <NavGroup label="B2B sipariş" items={b2bItems} openLeadsCount={openLeadsCount} />
        <NavGroup label="Katalog" items={catalogItems} openLeadsCount={openLeadsCount} />
        <NavGroup label="İçerik" items={contentItems} openLeadsCount={openLeadsCount} />
        <NavGroup label="Sistem" items={systemItems} openLeadsCount={openLeadsCount} />
      </SidebarContent>
      <SidebarFooter className="gap-3">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-brand-600 p-4 text-white group-data-[collapsible=icon]:hidden">
          <p className="text-body-sm leading-body-sm font-semibold">Mağaza önizleme</p>
          <p className="mt-1 text-caption text-white/70">
            Bayinin gördüğü katalog ve sepet deneyimine geçin.
          </p>
          <Link
            href="/urunler"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-white px-3 py-2 text-caption font-semibold text-brand-700 transition-colors hover:bg-brand-50"
          >
            <ExternalLink className="size-3.5" aria-hidden />
            Mağazayı aç
          </Link>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActivePath(pathname, "/admin/ayarlar")}
              tooltip="Ayarlar"
              className={activeButtonClass(isActivePath(pathname, "/admin/ayarlar"))}
            >
              <Link
                href="/admin/ayarlar"
                onClick={() => {
                  if (isMobile) setOpenMobile(false);
                }}
              >
                <Settings />
                <span>Ayarlar</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
