"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { YgButton } from "@/components/yg-ops/shared/button";
import { cn } from "@/lib/utils";

export function DetailDrawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Kapat"
        className="absolute inset-0 bg-[var(--yg-overlay)]"
        onClick={onClose}
      />
      <aside
        className={cn(
          "relative flex h-full w-full max-w-[var(--yg-drawer-w)] flex-col bg-[var(--yg-panel)]",
        )}
        style={{ boxShadow: "var(--yg-shadow-lg)" }}
      >
        <header className="flex h-[var(--yg-topbar-h)] items-center justify-between gap-3 border-b border-[color:var(--yg-border)] px-5">
          <h2 className="text-[length:var(--yg-text-20)] font-semibold text-[var(--yg-text)]">{title}</h2>
          <YgButton variant="ghost" className="size-11 min-h-[44px] px-0" onClick={onClose} aria-label="Kapat">
            <X className="size-4" aria-hidden />
          </YgButton>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <footer className="border-t border-[color:var(--yg-border)] px-5 py-4">{footer}</footer>
        ) : null}
      </aside>
    </div>
  );
}
