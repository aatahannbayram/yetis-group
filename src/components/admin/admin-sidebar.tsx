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
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/ui/logo";
import { useAdminTheme } from "@/components/admin/admin-theme-context";

const navItems = [{ href: "/admin", label: "Pano", icon: LayoutDashboard }];

const crmItems = [{ href: "/admin/bayi-adaylari", label: "Bayi Adayları", icon: Target }];

const managementItems = [
  { href: "/admin/urunler", label: "Ürünler", icon: Package },
  { href: "/admin/fiyat-listeleri", label: "Fiyat Listeleri", icon: Tags },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: UserCog },
  { href: "/admin/bayiler", label: "Bayiler", icon: Users2 },
  { href: "/admin/siparisler", label: "Siparişler", icon: ClipboardList },
  { href: "/admin/cari", label: "Cari", icon: Wallet },
  { href: "/admin/sevkiyat", label: "Sevkiyat", icon: Truck },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: MessageCircleMore },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { theme } = useAdminTheme();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border px-3">
        <Link href="/admin" className="flex items-center px-1">
          <Logo
            variant={theme === "dark" ? "dark" : "light"}
            size="sm"
            className="group-data-[collapsible=icon]:hidden"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === href}
                    tooltip={label}
                    className="rounded-xl"
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
                    className="rounded-xl"
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
          <SidebarGroupLabel>Yönetim</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === href}
                    tooltip={label}
                    className="rounded-xl"
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/admin/ayarlar"}
              tooltip="Ayarlar"
              className="rounded-xl"
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
