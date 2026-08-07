"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
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
  type PanelNavGroup,
  type PanelNavItem,
} from "@/components/admin/panel-nav";
import { cn } from "@/lib/utils";

const GROUP_COLLAPSE_KEY = "yetis-panel-nav-groups-v2";

function isActivePath(pathname: string, href: string, exact?: boolean) {
  if (exact || href === "/panel") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function defaultCollapsedMap() {
  return Object.fromEntries(
    PANEL_NAV_GROUPS.filter((g) => g.defaultCollapsed).map((g) => [g.id, true]),
  ) as Record<string, boolean>;
}

function NavItem({
  item,
  openLeadsCount,
}: {
  item: PanelNavItem;
  openLeadsCount: number;
}) {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();
  const { href, label, icon: Icon, badgeKey, exact, status } = item;
  const active = status === "ready" && isActivePath(pathname, href, exact);
  const soon = status === "soon";
  const showBadge = badgeKey === "leads" && openLeadsCount > 0 && !soon;

  if (soon) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          disabled
          tooltip={`${label} — yakında`}
          className="h-9 cursor-not-allowed rounded-lg px-2.5 text-sidebar-foreground/40 opacity-70"
          aria-disabled
        >
          <Icon className="!size-[18px] stroke-[1.5] opacity-70" aria-hidden />
          <span className="flex-1 truncate font-normal">{label}</span>
          <span className="text-[10px] font-medium text-sidebar-foreground/35">Yakında</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={label}
        className={cn(
          "h-9 rounded-lg px-2.5 transition-colors duration-150",
          active
            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            : "font-normal text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
        )}
      >
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          onClick={() => {
            if (isMobile) setOpenMobile(false);
          }}
        >
          <Icon
            className={cn(
              "!size-[18px] stroke-[1.5]",
              active ? "text-sidebar-primary" : "text-sidebar-foreground/45",
            )}
            aria-hidden
          />
          <span className="truncate">{label}</span>
        </Link>
      </SidebarMenuButton>
      {showBadge ? (
        <SidebarMenuBadge className="right-2 rounded-full bg-sidebar-primary text-[10px] font-semibold text-sidebar-primary-foreground tabular-nums">
          {openLeadsCount > 99 ? "99+" : openLeadsCount}
        </SidebarMenuBadge>
      ) : null}
    </SidebarMenuItem>
  );
}

function NavGroup({
  group,
  openLeadsCount,
  collapsed,
  onToggle,
  isFirst,
}: {
  group: PanelNavGroup;
  openLeadsCount: number;
  collapsed: boolean;
  onToggle: () => void;
  isFirst: boolean;
}) {
  const ready = group.items.filter((i) => i.status === "ready");
  const soon = group.items.filter((i) => i.status === "soon");
  const visible = collapsed ? [] : [...ready, ...soon];

  return (
    <SidebarGroup className={cn("px-2 pb-1", isFirst ? "pt-1.5" : "pt-4")}>
      <SidebarGroupLabel asChild>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "mb-1.5 flex h-7 w-full items-center gap-1.5 px-2.5 text-[11px] font-bold tracking-[0.08em] text-sidebar-foreground/60 uppercase hover:text-sidebar-foreground/90",
            isFirst ? "pt-0" : "border-t border-sidebar-border/70 pt-3",
          )}
          aria-expanded={!collapsed}
          aria-controls={`nav-group-${group.id}`}
        >
          <ChevronRight
            className={cn(
              "size-3 shrink-0 transition-transform duration-200",
              !collapsed && "rotate-90",
            )}
            aria-hidden
          />
          <span className="truncate">{group.label}</span>
          {collapsed && ready.length > 0 ? (
            <span className="ml-auto font-normal tracking-normal text-sidebar-foreground/40 tabular-nums">
              {ready.length}
            </span>
          ) : null}
        </button>
      </SidebarGroupLabel>
      {!collapsed ? (
        <SidebarGroupContent id={`nav-group-${group.id}`}>
          <SidebarMenu className="gap-0.5">
            {visible.map((item) => (
              <NavItem key={item.href} item={item} openLeadsCount={openLeadsCount} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      ) : null}
    </SidebarGroup>
  );
}

export function AdminSidebar({ openLeadsCount }: { openLeadsCount: number }) {
  const { theme } = useAdminTheme();
  const { setOpenMobile, isMobile } = useSidebar();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(defaultCollapsedMap);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(GROUP_COLLAPSE_KEY);
      if (raw) {
        setCollapsedGroups({ ...defaultCollapsedMap(), ...(JSON.parse(raw) as Record<string, boolean>) });
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  function toggleGroup(id: string) {
    setCollapsedGroups((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      window.localStorage.setItem(GROUP_COLLAPSE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <Sidebar
      collapsible="icon"
      className="w-[248px] border-sidebar-border bg-sidebar text-sidebar-foreground"
    >
      <SidebarHeader className="h-14 shrink-0 justify-center gap-0 border-b border-sidebar-border bg-transparent p-0 px-4 md:h-16">
        <Link
          href="/panel"
          className="flex h-full items-center justify-center transition-opacity hover:opacity-80"
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

      <SidebarContent
        className={cn(
          "gap-0 px-0 py-3",
          !hydrated && "opacity-0",
          hydrated && "opacity-100 transition-opacity duration-150",
        )}
      >
        {PANEL_NAV_GROUPS.map((group, index) => (
          <NavGroup
            key={group.id}
            group={group}
            openLeadsCount={openLeadsCount}
            collapsed={Boolean(collapsedGroups[group.id])}
            onToggle={() => toggleGroup(group.id)}
            isFirst={index === 0}
          />
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <p className="px-1 text-[10px] leading-relaxed text-sidebar-foreground/40 group-data-[collapsible=icon]:hidden">
          Yetiş operasyon paneli
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
