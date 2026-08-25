"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DealerRail } from "@/components/yg-ops/dealer/dealer-rail";
import { DealerTopbar } from "@/components/yg-ops/dealer/dealer-topbar";
import { DealerPillStrip } from "@/components/yg-ops/dealer/dealer-pill-strip";
import { DealerMobileTabbar } from "@/components/yg-ops/dealer/dealer-mobile-tabbar";

const TITLE: Record<string, string> = {
  "/portal": "Ana ekran",
  "/portal/katalog": "Katalog",
  "/portal/siparisler": "Siparişlerim",
  "/portal/cari": "Cari Hesabım",
  "/portal/talepler": "Talepler",
  "/portal/profil": "Profil",
  "/portal/sepet": "Sepet",
};

function breadcrumbFor(pathname: string): string {
  const title = TITLE[pathname] ?? "Portal";
  return `Bayi / ${title}`;
}

/** Mock credit for Adım 1 shell chrome. */
const DEMO_USED = 11550000;
const DEMO_LIMIT = 20000000;

export function DealerShell({
  children,
  cartCount = 2,
}: {
  children: ReactNode;
  cartCount?: number;
}) {
  const pathname = usePathname();

  return (
    <div
      data-yg-ops="true"
      className="min-h-dvh bg-[var(--yg-bg)] p-[var(--yg-shell-pad)] pb-[calc(var(--yg-shell-pad)+4.5rem)] text-[var(--yg-text)] lg:pb-[var(--yg-shell-pad)]"
    >
      <div className="mx-auto flex min-h-[calc(100dvh-2*var(--yg-shell-pad))] max-w-[1400px] gap-[var(--yg-shell-gap)]">
        <div className="hidden lg:block">
          <DealerRail />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="rounded-[var(--yg-radius-xl)] bg-[var(--yg-panel)] px-4 pt-2 pb-3 sm:px-5">
            <DealerTopbar
              breadcrumb={breadcrumbFor(pathname)}
              usedKurus={DEMO_USED}
              limitKurus={DEMO_LIMIT}
            />
            <div className="mt-2">
              <DealerPillStrip />
            </div>
          </div>
          <main className="flex-1 rounded-[var(--yg-radius-xl)] bg-[var(--yg-panel)] p-4 sm:p-5">
            {children}
          </main>
        </div>
      </div>
      <DealerMobileTabbar cartCount={cartCount} />
    </div>
  );
}
