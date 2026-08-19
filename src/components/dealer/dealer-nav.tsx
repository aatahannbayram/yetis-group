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
      <header className="sticky top-0 z-30 border-b border-[var(--panel-border)] bg-[color-mix(in_srgb,var(--panel-canvas)_88%,white)]/90 shadow-[0_8px_24px_-18px_rgb(33_28_22/0.35)] backdrop-blur-xl">
        <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto] items-center gap-3 px-3 sm:px-4 md:grid-cols-[1fr_auto_1fr]">
          <Link href="/bayi" className="flex min-w-0 items-center gap-2.5">
            <Logo variant="light" size="sm" />
            <span
              className="hidden max-w-[10rem] truncate rounded-full bg-white/80 px-2.5 py-1 text-[12px] font-medium text-[var(--panel-ink)] ring-1 ring-black/8 lg:inline lg:max-w-[14rem]"
              title={dealerName}
            >
              {dealerName}
            </span>
          </Link>

          <nav
            className="hidden items-center rounded-full bg-white/70 p-1 ring-1 ring-black/6 md:flex"
            aria-label="Bayi menü"
          >
            {nav.slice(0, 5).map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-[13px] font-semibold tracking-[-0.01em] transition-colors",
                    active
                      ? "bg-[var(--brand-700)] text-white shadow-sm"
                      : "text-[var(--panel-ink-muted)] hover:bg-black/[0.04] hover:text-[var(--panel-ink)]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-1">
            <Link
              href="/bayi/siparis"
              className="relative mr-1 inline-flex h-10 items-center gap-1.5 rounded-full bg-[var(--brand-700)] px-3.5 text-[13px] font-semibold text-white shadow-[0_1px_2px_rgb(0_105_62/0.25)] hover:bg-[var(--brand-600)]"
            >
              <ShoppingCart className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">Sipariş</span>
              {cartCount > 0 ? (
                <span className="flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-bold text-[var(--brand-700)] tabular-nums">
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
                    "relative flex size-10 items-center justify-center rounded-full transition-colors",
                    active
                      ? "bg-[var(--primary-subtle)] text-[var(--primary-text)]"
                      : "text-[var(--panel-ink-muted)] hover:bg-white hover:text-[var(--panel-ink)]",
                  )}
                >
                  <item.icon className="size-4.5" aria-hidden />
                  {item.href === "/bayi/bildirimler" && unreadNotifications > 0 ? (
                    <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[var(--danger-solid)] ring-2 ring-[var(--panel-canvas)]" />
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden md:block">
          <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-2.5 sm:px-4">
            {nav.slice(5).map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition-colors",
                    active
                      ? "bg-white text-[var(--panel-ink)] shadow-sm ring-1 ring-black/8"
                      : "text-[var(--panel-ink-muted)] hover:bg-white/70 hover:text-[var(--panel-ink)]",
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
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--panel-border)] bg-[color-mix(in_srgb,var(--panel-canvas)_92%,white)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
        aria-label="Bayi mobil menü"
      >
        <ul className="grid grid-cols-4 px-2 pt-1.5 pb-1">
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
                        ? "bg-white text-[var(--brand-700)] shadow-sm"
                        : "text-[var(--panel-ink-muted)]",
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
