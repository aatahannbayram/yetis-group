"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/urunler", label: "Ürünler" },
  { href: "/haberler", label: "Haberler" },
  { href: "/tarifler", label: "Tarifler" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
] as const;

export function StoreHeaderNav({ overlay }: { overlay: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "hidden items-center md:flex",
        overlay
          ? "text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] group-data-[stuck=true]/hdr:text-mkt-ink group-data-[stuck=true]/hdr:[text-shadow:none]"
          : "text-mkt-ink",
      )}
      aria-label="Ana menü"
    >
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-[14px] font-semibold tracking-[-0.015em] transition-colors lg:px-3.5 lg:text-[15px]",
              overlay
                ? cn(
                    "text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.55)] hover:bg-white/15 hover:text-white",
                    "group-data-[stuck=true]/hdr:text-neutral-700 group-data-[stuck=true]/hdr:[text-shadow:none] group-data-[stuck=true]/hdr:hover:bg-black/[0.05] group-data-[stuck=true]/hdr:hover:text-mkt-green-text",
                    active &&
                      "bg-white/15 text-white group-data-[stuck=true]/hdr:bg-black/[0.06] group-data-[stuck=true]/hdr:text-mkt-green-text",
                  )
                : cn(
                    "text-neutral-700 hover:bg-black/[0.05] hover:text-mkt-green-text",
                    active && "bg-black/[0.06] text-mkt-green-text",
                  ),
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
