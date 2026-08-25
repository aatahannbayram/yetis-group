"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  ShoppingBag,
  Wallet,
  MessageSquare,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/portal", label: "Ana ekran", icon: Home, exact: true },
  { href: "/portal/katalog", label: "Katalog", icon: Package },
  { href: "/portal/siparisler", label: "Siparişlerim", icon: ShoppingBag },
  { href: "/portal/cari", label: "Cari Hesabım", icon: Wallet },
  { href: "/portal/talepler", label: "Talepler", icon: MessageSquare },
  { href: "/portal/profil", label: "Profil", icon: User },
] as const;

export function DealerRail() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Bayi menüsü"
      className="flex h-full w-[var(--yg-rail-w)] shrink-0 flex-col rounded-[var(--yg-radius-xl)] bg-[var(--yg-rail)] p-3"
    >
      <div className="px-3 py-3">
        <p className="text-[length:var(--yg-text-12)] font-medium tracking-[0.06em] text-[var(--yg-text-muted)] uppercase">
          Yetiş
        </p>
        <p className="text-[length:var(--yg-text-16)] font-semibold text-[var(--yg-text)]">Bayi</p>
      </div>
      <ul className="mt-2 flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active = "exact" in item && item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-[44px] items-center gap-3 rounded-[var(--yg-radius-md)] px-3 text-[length:var(--yg-text-14)] transition-colors",
                  active
                    ? "bg-[var(--yg-primary-subtle)] text-[var(--yg-primary-text)]"
                    : "text-[var(--yg-text-muted)] hover:bg-[var(--yg-panel-2)] hover:text-[var(--yg-text)]",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
