"use client";

import { Bell, Search } from "lucide-react";
import { CreditBar } from "@/components/yg-ops/shared/credit-bar";
import { YgButton } from "@/components/yg-ops/shared/button";

export function DealerTopbar({
  breadcrumb,
  usedKurus,
  limitKurus,
}: {
  breadcrumb: string;
  usedKurus: number;
  limitKurus: number;
}) {
  return (
    <header className="flex min-h-[var(--yg-topbar-h)] flex-wrap items-center gap-3 px-1 py-1">
      <nav aria-label="Konum" className="min-w-0 flex-1 basis-[140px]">
        <p className="truncate text-[length:var(--yg-text-13)] text-[var(--yg-text-muted)]">
          {breadcrumb}
        </p>
      </nav>
      <CreditBar
        compact
        usedKurus={usedKurus}
        limitKurus={limitKurus}
        className="max-w-full sm:max-w-[280px]"
      />
      <div className="flex items-center gap-1">
        <YgButton variant="ghost" className="size-11 min-h-[44px] px-0" aria-label="Ara">
          <Search className="size-4" aria-hidden />
        </YgButton>
        <YgButton variant="ghost" className="size-11 min-h-[44px] px-0" aria-label="Bildirimler">
          <Bell className="size-4" aria-hidden />
        </YgButton>
        <div
          className="flex size-9 items-center justify-center rounded-full bg-[var(--yg-primary-subtle)] text-[length:var(--yg-text-12)] font-semibold text-[var(--yg-primary-text)]"
          aria-hidden
        >
          BY
        </div>
      </div>
    </header>
  );
}
