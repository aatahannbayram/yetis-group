"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingCart, ClipboardList, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/portal", label: "Ana", icon: Home, exact: true },
  { href: "/portal/katalog", label: "Katalog", icon: Package },
  { href: "/portal/sepet", label: "Sepet", icon: ShoppingCart, badge: true },
  { href: "/portal/siparisler", label: "Siparişler", icon: ClipboardList },
  { href: "/portal/profil", label: "Profil", icon: User },
] as const;

export function DealerMobileTabbar({ cartCount = 0 }: { cartCount?: number }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobil gezinme"
      className="fixed inset-x-[var(--yg-shell-pad)] bottom-[var(--yg-shell-pad)] z-40 flex h-16 items-center justify-around rounded-[var(--yg-radius-xl)] bg-[var(--yg-rail)] px-1 lg:hidden"
    >
      {TABS.map((tab) => {
        const active = "exact" in tab && tab.exact
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-[var(--yg-radius-md)] px-2 text-[length:var(--yg-text-12)]",
              active ? "text-[var(--yg-primary-text)]" : "text-[var(--yg-text-muted)]",
            )}
          >
            <span className="relative">
              <Icon className="size-5" aria-hidden />
              {"badge" in tab && tab.badge && cartCount > 0 ? (
                <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--yg-primary)] px-1 text-[length:var(--yg-text-12)] font-semibold text-[var(--yg-text-inverse)]">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              ) : null}
            </span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
