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
  Download,
  FolderTree,
  Shapes,
  Newspaper,
  ChefHat,
  SearchCheck,
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
} from "@/components/ui/sidebar";
import { BrandMark, Logo } from "@/components/ui/logo";
import { useAdminTheme } from "@/components/admin/admin-theme-context";

const navItems = [{ href: "/admin", label: "Pano", icon: LayoutDashboard }];

const crmItems = [{ href: "/admin/bayi-adaylari", label: "Bayi Adayları", icon: Target }];

const managementItems = [
  { href: "/admin/urunler", label: "Ürünler", icon: Package },
  { href: "/admin/kategoriler", label: "Kategoriler", icon: FolderTree },
  { href: "/admin/nitelikler", label: "Nitelikler", icon: Shapes },
  { href: "/admin/icerikler", label: "Haberler", icon: Newspaper },
  { href: "/admin/tarifler", label: "Tarifler", icon: ChefHat },
  { href: "/admin/seo", label: "SEO / AEO", icon: SearchCheck },
  { href: "/admin/fiyat-listeleri", label: "Fiyat Listeleri", icon: Tags },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: UserCog },
  { href: "/admin/bayiler", label: "Bayiler", icon: Users2 },
  { href: "/admin/siparisler", label: "Siparişler", icon: ClipboardList },
  { href: "/admin/cari", label: "Cari", icon: Wallet },
  { href: "/admin/sevkiyat", label: "Sevkiyat", icon: Truck },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: MessageCircleMore },
];

function activeButtonClass(isActive: boolean) {
  return isActive
    ? "rounded-xl border-l-[3px] border-brand-600 bg-brand-50 pl-2.5 font-semibold text-brand-700 hover:bg-brand-50 hover:text-brand-700"
    : "rounded-xl border-l-[3px] border-transparent pl-2.5";
}

export function AdminSidebar({ openLeadsCount }: { openLeadsCount: number }) {
  const pathname = usePathname();
  const { theme } = useAdminTheme();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border px-3">
        <Link href="/admin" className="flex items-center justify-center px-1">
          <Logo
            variant={theme === "dark" ? "dark" : "light"}
            size="sm"
            className="group-data-[collapsible=icon]:hidden"
          />
          <BrandMark
            size={22}
            className="hidden group-data-[collapsible=icon]:block"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menü</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === href}
                    tooltip={label}
                    className={activeButtonClass(pathname === href)}
                  >
                    <Link href={href}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>CRM</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {crmItems.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === href}
                    tooltip={label}
                    className={activeButtonClass(pathname === href)}
                  >
                    <Link href={href}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                  {openLeadsCount > 0 ? (
                    <SidebarMenuBadge className="rounded-full bg-brand-100 text-brand-700 peer-data-[active=true]/menu-button:text-brand-700">
                      {openLeadsCount}
                    </SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Genel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === href}
                    tooltip={label}
                    className={activeButtonClass(pathname === href)}
                  >
                    <Link href={href}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-3">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-brand-600 p-4 text-white group-data-[collapsible=icon]:hidden">
          <p className="text-body-sm leading-body-sm font-semibold">Yardıma mı ihtiyacınız var?</p>
          <p className="mt-1 text-caption text-white/70">
            Satış ekibiyle WhatsApp&apos;tan iletişime geçin.
          </p>
          <Link
            href="/admin/whatsapp"
            className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-white px-3 py-2 text-caption font-semibold text-brand-700 transition-colors hover:bg-brand-50"
          >
            <Download className="size-3.5" aria-hidden />
            WhatsApp&apos;a git
          </Link>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/admin/ayarlar"}
              tooltip="Ayarlar"
              className={activeButtonClass(pathname === "/admin/ayarlar")}
            >
              <Link href="/admin/ayarlar">
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
