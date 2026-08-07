"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  ClipboardList,
  FileText,
  Home,
  MapPin,
  MessageCircle,
  ShoppingCart,
  Sparkles,
  Truck,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

const nav: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  primary?: boolean;
}[] = [
  { href: "/bayi", label: "Özet", icon: Home, exact: true, primary: true },
  { href: "/bayi/siparis", label: "Sipariş", icon: ShoppingCart, primary: true },
  { href: "/bayi/siparislerim", label: "Geçmiş", icon: ClipboardList, primary: true },
  { href: "/bayi/teslimat", label: "Teslimat", icon: Truck },
  { href: "/bayi/cari", label: "Cari", icon: Wallet, primary: true },
  { href: "/bayi/belgeler", label: "Belgeler", icon: FileText },
  { href: "/bayi/firsatlar", label: "Fırsatlar", icon: Sparkles },
  { href: "/bayi/adreslerim", label: "Adresler", icon: MapPin },
  { href: "/bayi/firmam", label: "Firma", icon: Building2 },
];

const headerIcons: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { href: "/bayi/bildirimler", label: "Bildirimler", icon: Bell },
  { href: "/bayi/destek", label: "Destek", icon: MessageCircle },
];

export function DealerNav({
  dealerName,
  unreadNotifications = 0,
  cartCount = 0,
}: {
  dealerName: string;
  unreadNotifications?: number;
  cartCount?: number;
}) {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[var(--panel-border)] bg-[var(--panel-surface)]/92 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-3 sm:px-4">
          <Link href="/bayi" className="flex min-w-0 items-center gap-2.5">
            <Logo variant="light" size="sm" />
            <span className="hidden min-w-0 truncate text-sm text-[var(--panel-ink-muted)] sm:block" title={dealerName}>
              {dealerName}
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Bayi menü">
            {nav.slice(0, 5).map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "text-[var(--panel-ink)]"
                      : "text-[var(--panel-ink-muted)] hover:text-[var(--panel-ink)]",
                  )}
                >
                  {item.label}
                  {active ? (
                    <span className="absolute inset-x-3 -bottom-[calc(0.5rem+1px)] h-0.5 rounded-full bg-[var(--primary-solid)]" />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/bayi/siparis"
              className="relative mr-1 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--primary-solid)] px-3 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
            >
              <ShoppingCart className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">Sipariş</span>
              {cartCount > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 flex min-w-4.5 items-center justify-center rounded-full bg-[var(--panel-ink)] px-1 text-[10px] font-bold text-white tabular-nums">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </Link>
            {headerIcons.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={
                    item.href === "/bayi/bildirimler" && unreadNotifications > 0
                      ? `${item.label} (${unreadNotifications} okunmamış)`
                      : item.label
                  }
                  title={item.label}
                  className={cn(
                    "relative flex size-9 items-center justify-center rounded-lg transition-colors",
                    active
                      ? "bg-[var(--primary-subtle)] text-[var(--primary-text)]"
                      : "text-[var(--panel-ink-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--panel-ink)]",
                  )}
                >
                  <item.icon className="size-4.5" aria-hidden />
                  {item.href === "/bayi/bildirimler" && unreadNotifications > 0 ? (
                    <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[var(--danger-solid)]" />
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Secondary links: desktop only, quieter row */}
        <div className="hidden border-t border-[var(--panel-border)]/70 md:block">
          <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 py-1.5 sm:px-4">
            {nav.slice(5).map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium",
                    active
                      ? "bg-[var(--surface-3)] text-[var(--panel-ink)]"
                      : "text-[var(--panel-ink-muted)] hover:text-[var(--panel-ink)]",
                  )}
                >
                  <item.icon className="size-3.5" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--panel-border)] bg-[var(--panel-surface)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        aria-label="Bayi mobil menü"
      >
        <ul className="grid grid-cols-4 px-1 pt-1 pb-1">
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
                      "flex min-h-12 flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                      active ? "text-[var(--primary-text)]" : "text-[var(--panel-ink-muted)]",
                    )}
                  >
                    <item.icon className="size-5" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>
    </>
  );
}
