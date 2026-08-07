"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Home,
  ShoppingCart,
  ClipboardList,
  Truck,
  Wallet,
  FileText,
  Sparkles,
  MapPin,
  Building2,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

const nav: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  /** Shown in the 4-slot mobile bottom tab bar. */
  primary?: boolean;
}[] = [
  { href: "/bayi", label: "Ana Sayfa", icon: Home, exact: true, primary: true },
  { href: "/bayi/siparis", label: "Sipariş Ver", icon: ShoppingCart, primary: true },
  { href: "/bayi/siparislerim", label: "Siparişlerim", icon: ClipboardList, primary: true },
  { href: "/bayi/teslimat", label: "Teslimatım", icon: Truck },
  { href: "/bayi/cari", label: "Cari Hesabım", icon: Wallet, primary: true },
  { href: "/bayi/belgeler", label: "Belgelerim", icon: FileText },
  { href: "/bayi/firsatlar", label: "Fırsatlar", icon: Sparkles },
  { href: "/bayi/adreslerim", label: "Adreslerim", icon: MapPin },
  { href: "/bayi/firmam", label: "Firmam", icon: Building2 },
];

const headerIcons: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { href: "/bayi/bildirimler", label: "Bildirimler", icon: Bell },
  { href: "/bayi/destek", label: "Destek", icon: MessageCircle },
];

export function DealerNav({
  dealerName,
  unreadNotifications = 0,
}: {
  dealerName: string;
  unreadNotifications?: number;
}) {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[var(--panel-border)] bg-[var(--panel-surface)]/95 backdrop-blur-sm shadow-[var(--shadow-sm)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-3 sm:px-4">
          <Link href="/bayi" className="flex min-w-0 items-center gap-2">
            <Logo variant="light" size="sm" />
            <span className="truncate text-caption font-medium text-[var(--panel-ink-muted)]" title={dealerName}>
              {dealerName}
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-1.5">
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
                    "relative flex size-8 items-center justify-center rounded-full transition-colors duration-200",
                    active
                      ? "bg-[var(--primary-subtle)] text-[var(--primary-text)]"
                      : "text-[var(--panel-ink-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--panel-ink)]",
                  )}
                >
                  <item.icon className="size-4.5" aria-hidden />
                  {item.href === "/bayi/bildirimler" && unreadNotifications > 0 ? (
                    <span className="absolute top-1 right-1 flex size-2 items-center justify-center rounded-full bg-[var(--danger-solid)] ring-2 ring-[var(--panel-surface)]" />
                  ) : null}
                </Link>
              );
            })}
            <Link
              href="/urunler"
              className="inline-flex h-8 items-center gap-1 rounded-full border border-[var(--primary-solid)]/25 bg-[var(--primary-subtle)] px-3 text-caption font-semibold text-[var(--primary-text)] transition-colors hover:bg-[var(--primary-solid)] hover:text-white"
            >
              Katalog
            </Link>
          </div>
        </div>
        <nav
          className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-2 sm:px-4"
          aria-label="Bayi menü"
        >
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[length:var(--panel-font-size)] font-medium whitespace-nowrap transition-all duration-200",
                  active
                    ? "bg-[var(--primary-solid)] text-white shadow-[var(--shadow-sm)]"
                    : "text-[var(--panel-ink-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--panel-ink)]",
                )}
              >
                <item.icon className="size-3.5" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--panel-border)] bg-[var(--panel-surface)]/95 backdrop-blur-sm shadow-[0_-4px_16px_rgb(33_28_22/0.08)] sm:hidden"
        aria-label="Bayi mobil menü"
      >
        <ul className="grid grid-cols-4 gap-0.5 px-1 py-1.5">
          {nav.filter((item) => item.primary).map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center gap-1 rounded-[var(--radius-sm)] text-[10px] font-medium transition-colors duration-200",
                    active ? "text-[var(--primary-text)]" : "text-[var(--panel-ink-muted)]",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full transition-colors duration-200",
                      active && "bg-[var(--primary-subtle)]",
                    )}
                  >
                    <item.icon className="size-4.5" aria-hidden />
                  </span>
                  <span className="max-w-full truncate px-0.5">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
