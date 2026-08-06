"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
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
import {
  PANEL_NAV_GROUPS,
  type PanelNavItem,
} from "@/components/admin/panel-nav";
import { cn } from "@/lib/utils";

const GROUP_COLLAPSE_KEY = "yetis-panel-nav-groups";

function isActivePath(pathname: string, href: string, exact?: boolean) {
  if (exact || href === "/panel") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavGroup({
  groupId,
  label,
  items,
  openLeadsCount,
  collapsed,
  onToggle,
}: {
  groupId: string;
  label: string;
  items: PanelNavItem[];
  openLeadsCount: number;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupLabel asChild>
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-2"
          aria-expanded={!collapsed}
          aria-controls={`nav-group-${groupId}`}
        >
          <span>{label}</span>
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform",
              collapsed && "-rotate-90",
            )}
            aria-hidden
          />
        </button>
      </SidebarGroupLabel>
      {!collapsed ? (
        <SidebarGroupContent id={`nav-group-${groupId}`}>
          <SidebarMenu>
            {items.map((item) => {
              const { href, label: itemLabel, icon: Icon, badgeKey, exact, status } = item;
              const active = status === "ready" && isActivePath(pathname, href, exact);
              const soon = status === "soon";

              return (
                <SidebarMenuItem key={href}>
                  {soon ? (
                    <SidebarMenuButton
                      disabled
                      tooltip={`${itemLabel} (yakında)`}
                      className="cursor-not-allowed rounded-lg border-l-[3px] border-transparent pl-2.5 opacity-55"
                      aria-disabled
                    >
                      <Icon />
                      <span className="flex-1 truncate">{itemLabel}</span>
                      <span className="rounded-full bg-[var(--neutral-subtle)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                        Yakında
                      </span>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={itemLabel}
                      className={cn(
                        "rounded-lg border-l-[3px] pl-2.5",
                        active
                          ? "border-[var(--primary-solid)] bg-[var(--primary-subtle)] font-semibold text-[var(--primary-text)] hover:bg-[var(--primary-subtle)] hover:text-[var(--primary-text)]"
                          : "border-transparent",
                      )}
                    >
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => {
                          if (isMobile) setOpenMobile(false);
                        }}
                      >
                        <Icon />
                        <span>{itemLabel}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                  {badgeKey === "leads" && openLeadsCount > 0 && !soon ? (
                    <SidebarMenuBadge className="rounded-full bg-[var(--primary-subtle)] text-[var(--primary-text)]">
                      {openLeadsCount}
                    </SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      ) : null}
    </SidebarGroup>
  );
}

export function AdminSidebar({ openLeadsCount }: { openLeadsCount: number }) {
  const { theme } = useAdminTheme();
  const { setOpenMobile, isMobile } = useSidebar();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(GROUP_COLLAPSE_KEY);
      if (raw) setCollapsedGroups(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* ignore */
    }
  }, []);

  function toggleGroup(id: string) {
    setCollapsedGroups((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      window.localStorage.setItem(GROUP_COLLAPSE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <Sidebar collapsible="icon" className="w-[260px]">
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border px-4">
        <Link
          href="/panel"
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
          <BrandMark size={26} className="hidden group-data-[collapsible=icon]:block" />
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-1">
        {PANEL_NAV_GROUPS.map((group) => (
          <NavGroup
            key={group.id}
            groupId={group.id}
            label={group.label}
            items={group.items}
            openLeadsCount={openLeadsCount}
            collapsed={Boolean(collapsedGroups[group.id])}
            onToggle={() => toggleGroup(group.id)}
          />
        ))}
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
