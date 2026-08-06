"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingCart,
  ClipboardList,
  Wallet,
  FileText,
  Sparkles,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

const nav: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}[] = [
  { href: "/bayi", label: "Ana Sayfa", icon: Home, exact: true },
  { href: "/bayi/siparis", label: "Sipariş Ver", icon: ShoppingCart },
  { href: "/bayi/siparislerim", label: "Siparişlerim", icon: ClipboardList },
  { href: "/bayi/cari", label: "Cari Hesabım", icon: Wallet },
  { href: "/bayi/belgeler", label: "Belgelerim", icon: FileText },
  { href: "/bayi/firsatlar", label: "Fırsatlar", icon: Sparkles },
  { href: "/bayi/firmam", label: "Firmam", icon: Building2 },
];

export function DealerNav({ dealerName }: { dealerName: string }) {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[var(--panel-border)] bg-[var(--panel-surface)]">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-3 sm:px-4">
          <Link href="/bayi" className="flex min-w-0 items-center gap-2">
            <Logo variant="light" size="sm" />
            <span className="truncate text-caption font-medium text-[var(--panel-ink-muted)]" title={dealerName}>
              {dealerName}
            </span>
          </Link>
          <Link
            href="/urunler"
            className="shrink-0 text-caption font-semibold text-[var(--panel-accent-action)]"
          >
            Katalog
          </Link>
        </div>
        <nav
          className="mx-auto hidden max-w-5xl gap-1 overflow-x-auto px-3 pb-2 sm:flex sm:px-4"
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
                  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[length:var(--panel-font-size)] font-medium whitespace-nowrap",
                  active
                    ? "bg-[var(--panel-accent-action)] text-white"
                    : "text-[var(--panel-ink-muted)] hover:bg-neutral-100 hover:text-[var(--panel-ink)]",
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
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--panel-border)] bg-[var(--panel-surface)] sm:hidden"
        aria-label="Bayi mobil menü"
      >
        <ul className="grid grid-cols-4 gap-0.5 px-1 py-1">
          {nav.slice(0, 4).map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-sm)] text-[10px] font-medium",
                    active
                      ? "text-[var(--panel-accent-action)]"
                      : "text-[var(--panel-ink-muted)]",
                  )}
                >
                  <item.icon className="size-5" aria-hidden />
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
