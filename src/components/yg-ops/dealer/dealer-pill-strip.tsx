"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const PILLS = [
  { href: "/portal", label: "Ana" },
  { href: "/portal/katalog", label: "Katalog" },
  { href: "/portal/siparisler", label: "Siparişler" },
  { href: "/portal/cari", label: "Cari" },
] as const;

export function DealerPillStrip() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden">
      {PILLS.map((pill) => {
        const active =
          pill.href === "/portal"
            ? pathname === "/portal"
            : pathname.startsWith(pill.href);
        return (
          <Link
            key={pill.href}
            href={pill.href}
            className={cn(
              "inline-flex h-[var(--yg-pill-h)] min-h-[44px] shrink-0 items-center rounded-[var(--yg-radius-pill)] px-4 text-[length:var(--yg-text-13)] font-medium transition-colors",
              active
                ? "bg-[var(--yg-primary)] text-[var(--yg-text-inverse)]"
                : "bg-[var(--yg-panel-2)] text-[var(--yg-text-muted)] hover:text-[var(--yg-text)]",
            )}
          >
            {pill.label}
          </Link>
        );
      })}
    </div>
  );
}
