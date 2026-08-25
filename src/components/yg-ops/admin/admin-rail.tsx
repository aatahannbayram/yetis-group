"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Tags,
  Truck,
  Wallet,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/yonetim", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/yonetim/siparisler", label: "Siparişler", icon: ShoppingCart },
  { href: "/yonetim/urunler", label: "Ürünler", icon: Package },
  { href: "/yonetim/bayiler", label: "Bayiler", icon: Users },
  { href: "/yonetim/fiyatlar", label: "Fiyatlar", icon: Tags },
  { href: "/yonetim/sevkiyat", label: "Sevkiyat", icon: Truck },
  { href: "/yonetim/cari", label: "Cari", icon: Wallet },
  { href: "/yonetim/raporlar", label: "Raporlar", icon: BarChart3 },
  { href: "/yonetim/ayarlar", label: "Ayarlar", icon: Settings },
] as const;

export function AdminRail() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Yönetim menüsü"
      className="flex h-full w-[var(--yg-rail-w)] shrink-0 flex-col rounded-[var(--yg-radius-xl)] bg-[var(--yg-rail)] p-3"
    >
      <div className="px-3 py-3">
        <p className="text-[length:var(--yg-text-12)] font-medium tracking-[0.06em] text-[var(--yg-text-muted)] uppercase">
          Yetiş
        </p>
        <p className="text-[length:var(--yg-text-16)] font-semibold text-[var(--yg-text)]">Yönetim</p>
      </div>
      <ul className="mt-2 flex flex-1 flex-col gap-1 overflow-y-auto">
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
