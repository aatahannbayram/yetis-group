"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Search, Store, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NotificationBell, type NotificationItem } from "@/components/ui/notification-bell";
import {
  markStaffNotificationReadAction,
  markAllStaffNotificationsReadAction,
} from "@/app/(panel)/panel/bildirimler/actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import { panelTitleFromPath } from "@/components/admin/panel-nav";
import { authClient } from "@/infra/auth/client";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AdminTopbar({
  userName,
  userEmail,
  notifications,
  unreadCount,
}: {
  userName: string;
  userEmail: string;
  notifications: NotificationItem[];
  unreadCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const section = panelTitleFromPath(pathname);

  useEffect(() => {
    document.title = `${section} · Yetiş Grup`;
  }, [section]);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/auth");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/50 bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-3 backdrop-blur-xl md:h-16 md:gap-3 md:px-5">
      <SidebarTrigger className="size-10 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground md:size-9" />
      <Separator orientation="vertical" className="hidden h-5 sm:block" />

      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem className="hidden sm:inline-flex">
            <Link href="/panel" className="text-muted-foreground hover:text-foreground">
              Panel
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate font-semibold text-foreground">
              {section}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Button
        variant="outline"
        size="sm"
        className="hidden h-9 w-52 justify-start gap-2 rounded-[var(--radius-sm)] bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground lg:flex lg:w-64"
        onClick={() =>
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))
        }
      >
        <Search className="size-3.5" aria-hidden />
        Bayi, sipariş, SKU ara...
        <kbd className="ml-auto rounded border border-border bg-background px-1.5 py-0.5 text-caption leading-caption text-muted-foreground">
          ⌘K
        </kbd>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="size-10 shrink-0 text-muted-foreground lg:hidden"
        aria-label="Ara"
        onClick={() =>
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))
        }
      >
        <Search className="size-4" aria-hidden />
      </Button>

      <Link
        href="/urunler"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex md:size-9"
        aria-label="Mağazayı aç"
      >
        <Store className="size-4" aria-hidden />
      </Link>

      <NotificationBell
        items={notifications}
        unreadCount={unreadCount}
        viewAllHref="/panel/bildirimler"
        onMarkRead={markStaffNotificationReadAction}
        onMarkAllRead={markAllStaffNotificationsReadAction}
        triggerClassName="md:size-9"
      />

      <ThemeToggle />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full py-1 pr-1 pl-1 transition-colors hover:bg-muted md:pr-2"
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-[var(--primary-solid)] text-white">
                {initials(userName) || <User className="size-4" />}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-left md:block">
              <span className="block max-w-[9rem] truncate text-body-sm leading-body-sm font-semibold text-foreground">
                {userName}
              </span>
              <span className="block max-w-[9rem] truncate text-caption text-muted-foreground">
                {userEmail}
              </span>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="font-normal">
            <p className="text-body-sm leading-body-sm font-medium text-foreground">
              {userName}
            </p>
            <p className="truncate text-caption text-muted-foreground">{userEmail}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/urunler" target="_blank" rel="noopener noreferrer">
              <Store />
              Mağazayı aç
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/panel/ayarlar">Ayarlar</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} variant="destructive">
            <LogOut />
            Çıkış yap
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
