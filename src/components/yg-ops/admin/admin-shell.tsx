"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminRail } from "@/components/yg-ops/admin/admin-rail";
import { AdminTopbar } from "@/components/yg-ops/admin/admin-topbar";
import { AdminPillStrip } from "@/components/yg-ops/admin/admin-pill-strip";

const TITLE: Record<string, string> = {
  "/yonetim": "Dashboard",
  "/yonetim/siparisler": "Siparişler",
  "/yonetim/urunler": "Ürünler",
  "/yonetim/bayiler": "Bayiler",
  "/yonetim/fiyatlar": "Fiyatlar",
  "/yonetim/sevkiyat": "Sevkiyat",
  "/yonetim/cari": "Cari",
  "/yonetim/raporlar": "Raporlar",
  "/yonetim/ayarlar": "Ayarlar",
};

function breadcrumbFor(pathname: string): string {
  const title = TITLE[pathname] ?? "Yönetim";
  return `Yönetim / ${title}`;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      data-yg-ops="true"
      className="min-h-dvh bg-[var(--yg-bg)] p-[var(--yg-shell-pad)] text-[var(--yg-text)]"
    >
      <div className="mx-auto flex min-h-[calc(100dvh-2*var(--yg-shell-pad))] max-w-[1600px] gap-[var(--yg-shell-gap)]">
        <div className="hidden lg:block">
          <AdminRail />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="rounded-[var(--yg-radius-xl)] bg-[var(--yg-panel)] px-4 pt-2 pb-3 sm:px-5">
            <AdminTopbar breadcrumb={breadcrumbFor(pathname)} />
            <div className="mt-2 lg:hidden">
              <AdminPillStrip />
            </div>
          </div>
          <main className="flex-1 rounded-[var(--yg-radius-xl)] bg-[var(--yg-panel)] p-4 sm:p-5">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
