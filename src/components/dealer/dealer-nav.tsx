"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgePercent,
  BellRing,
  CircleDollarSign,
  FileStack,
  Headphones,
  History,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Package,
  ShoppingBag,
  Store,
  Truck,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { AppIcon } from "@/components/ui/app-icon";
import { useDealerCart } from "@/components/dealer/dealer-cart-context";
import { DealerNotificationsSheet } from "@/components/dealer/dealer-notifications-sheet";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import { useWorkspace } from "@/components/workspace/workspace-shell";
import { authClient } from "@/infra/auth/client";
import type { NotificationItem } from "@/components/ui/notification-bell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { LucideIcon } from "lucide-react";

const nav: {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  primary?: boolean;
}[] = [
  { href: "/bayi", label: "Özet", icon: LayoutDashboard, exact: true, primary: true },
  { href: "/bayi/siparis", label: "Sipariş", icon: ShoppingBag, primary: true },
  { href: "/bayi/katalog", label: "Katalog", icon: Package, primary: true },
  { href: "/bayi/siparislerim", label: "Geçmiş", icon: History, primary: true },
  { href: "/bayi/teslimat", label: "Teslimat", icon: Truck },
  { href: "/bayi/cari", label: "Cari", icon: CircleDollarSign, primary: true },
  { href: "/bayi/belgeler", label: "Belgeler", icon: FileStack },
  { href: "/bayi/firsatlar", label: "Fırsatlar", icon: BadgePercent },
  { href: "/bayi/adreslerim", label: "Adresler", icon: MapPinned },
  { href: "/bayi/firmam", label: "Firma", icon: Warehouse },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DealerNav({
  dealerName,
  unreadNotifications = 0,
  notifications = [],
}: {
  dealerName: string;
  unreadNotifications?: number;
  notifications?: NotificationItem[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, open } = useDealerCart();
  const { theme } = useWorkspace();
  const [hidden, setHidden] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const lastY = useRef(0);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  useEffect(() => {
    lastY.current = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (y < 80) {
        setHidden(false);
      } else if (delta > 4) {
        setHidden(true);
      } else if (delta < -4) {
        setHidden(false);
      }
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logoVariant = theme === "dark" ? "dark" : "light";

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 border-b border-[var(--panel-border)]/80 bg-[color-mix(in_srgb,var(--panel-canvas)_88%,var(--panel-surface))]/92 shadow-[var(--shadow-sm)] backdrop-blur-xl transition-transform duration-300 ease-out",
          hidden ? "-translate-y-full" : "translate-y-0",
        )}
      >
        <div className="mx-auto grid h-[4.25rem] max-w-6xl grid-cols-[1fr_auto] items-center gap-3 px-3 sm:px-4 md:grid-cols-[1fr_auto_1fr]">
          <Link href="/bayi" className="flex min-w-0 items-center gap-2.5">
            <Logo variant={logoVariant} size="lg" />
            <span
              className="hidden max-w-[10rem] truncate rounded-full bg-[var(--panel-surface)]/90 px-2.5 py-1 text-[12px] font-medium text-[var(--panel-ink)] ring-1 ring-[var(--panel-border)] lg:inline lg:max-w-[14rem]"
              title={dealerName}
            >
              {dealerName}
            </span>
          </Link>

          <nav
            className="hidden items-center gap-0.5 rounded-full bg-[var(--panel-surface)]/80 p-1 ring-1 ring-[var(--panel-border)] md:flex"
            aria-label="Bayi menü"
          >
            {nav.slice(0, 6).map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold tracking-[-0.01em] transition-colors",
                    active
                      ? "bg-[var(--brand-700)] text-white shadow-sm dark:bg-[var(--primary-solid)] dark:text-[#06231a]"
                      : "text-[var(--panel-ink-muted)] hover:bg-muted hover:text-[var(--panel-ink)]",
                  )}
                >
                  <AppIcon
                    icon={item.icon}
                    size={15}
                    className={active ? "text-current" : "opacity-80"}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={open}
              aria-label="Sepeti aç"
              className="relative mr-0.5 inline-flex h-10 items-center gap-1.5 rounded-full bg-[var(--brand-700)] px-3.5 text-[13px] font-semibold text-white shadow-[0_1px_2px_rgb(0_105_62/0.25)] transition-colors hover:bg-[var(--brand-600)] dark:bg-[var(--primary-solid)] dark:text-[#06231a] dark:hover:bg-[var(--primary-hover)]"
            >
              <AppIcon icon={ShoppingBag} size={15} />
              <span className="hidden sm:inline">Sepet</span>
              {itemCount > 0 ? (
                <span className="flex min-w-5 items-center justify-center rounded-full bg-[var(--panel-surface)] px-1.5 text-[11px] font-bold text-[var(--brand-700)] tabular-nums dark:bg-[#06231a] dark:text-[var(--primary-solid)]">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => setNotifOpen(true)}
              aria-label={
                unreadNotifications > 0
                  ? `Bildirimler (${unreadNotifications} okunmamış)`
                  : "Bildirimler"
              }
              title="Bildirimler"
              className={cn(
                "relative flex size-10 items-center justify-center rounded-full transition-colors",
                notifOpen || pathname.startsWith("/bayi/bildirimler")
                  ? "bg-[var(--primary-subtle)] text-[var(--primary-text)]"
                  : "text-[var(--panel-ink-muted)] hover:bg-muted hover:text-[var(--panel-ink)]",
              )}
            >
              <AppIcon icon={BellRing} size={18} />
              {unreadNotifications > 0 ? (
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[var(--danger-solid)] ring-2 ring-[var(--panel-canvas)]" />
              ) : null}
            </button>

            <Link
              href="/bayi/destek"
              aria-label="Destek"
              title="Destek"
              className={cn(
                "flex size-10 items-center justify-center rounded-full transition-colors",
                pathname.startsWith("/bayi/destek")
                  ? "bg-[var(--primary-subtle)] text-[var(--primary-text)]"
                  : "text-[var(--panel-ink-muted)] hover:bg-muted hover:text-[var(--panel-ink)]",
              )}
            >
              <AppIcon icon={Headphones} size={18} />
            </Link>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Hesap menüsü"
                  className="ml-0.5 flex size-10 items-center justify-center rounded-full text-[var(--panel-ink-muted)] transition-colors hover:bg-muted hover:text-[var(--panel-ink)]"
                >
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-[var(--panel-surface)] text-[11px] font-semibold text-[var(--brand-700)] ring-1 ring-[var(--panel-border)] dark:text-[var(--primary-text)]">
                      {initials(dealerName)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <Store />
                    Mağazaya dön
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} variant="destructive">
                  <LogOut />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="mx-auto flex max-w-6xl gap-1.5 overflow-x-auto px-3 pb-3 sm:px-4">
            {nav.slice(6).map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex h-9 shrink-0 items-center gap-2 rounded-xl px-3 text-[12px] font-semibold tracking-[-0.01em] transition-colors",
                    active
                      ? "bg-[var(--panel-surface)] text-[var(--panel-ink)] shadow-sm ring-1 ring-[var(--panel-border)]"
                      : "text-[var(--panel-ink-muted)] hover:bg-[var(--panel-surface)]/70 hover:text-[var(--panel-ink)]",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-lg",
                      active
                        ? "bg-[var(--primary-subtle)] text-[var(--primary-text)]"
                        : "bg-muted/80 text-[var(--panel-ink-muted)]",
                    )}
                  >
                    <AppIcon icon={item.icon} size={14} />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--panel-border)] bg-[color-mix(in_srgb,var(--panel-canvas)_92%,var(--panel-surface))]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
        aria-label="Bayi mobil menü"
      >
        <ul className="grid grid-cols-5 px-2 pt-1.5 pb-1">
          {nav
            .filter((item) => item.primary)
            .map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-semibold",
                      active
                        ? "bg-[var(--panel-surface)] text-[var(--brand-700)] shadow-sm dark:text-[var(--primary-text)]"
                        : "text-[var(--panel-ink-muted)]",
                    )}
                  >
                    <AppIcon icon={item.icon} size={20} strokeWidth={active ? 1.75 : 1.5} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>

      <DealerNotificationsSheet
        open={notifOpen}
        onOpenChange={setNotifOpen}
        items={notifications}
        unreadCount={unreadNotifications}
      />
    </>
  );
}
