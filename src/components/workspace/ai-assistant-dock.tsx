"use client";

import { useEffect, useState } from "react";
import { Bot, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dockable AI assistant shell. Reads page context only; never invents
 * price / stock / balance — tools must fetch and cite sources.
 */
export function AiAssistantDock({
  pageContext,
}: {
  pageContext?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-6 bottom-6 z-20 inline-flex size-11 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--panel-surface)] text-[var(--panel-accent-action)] shadow-[var(--shadow-md)] transition-colors duration-[var(--motion-hover)] hover:bg-[var(--primary-subtle)]"
        aria-label="AI asistan (⌘J)"
        title="AI asistan (⌘J)"
      >
        <Bot className="size-5" aria-hidden />
      </button>
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col border-l border-[var(--panel-border)] bg-[var(--panel-surface)] transition-transform duration-[var(--motion-drawer)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-[var(--panel-border)] px-4 py-3">
          <div>
            <p className="font-semibold text-[var(--panel-ink)]">Asistan</p>
            <p className="text-caption text-[var(--panel-ink-muted)]">
              Veriyi tool ile okur, üretmez
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex size-8 items-center justify-center rounded-[var(--radius-sm)] hover:bg-neutral-100"
            aria-label="Kapat"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4 text-[length:var(--panel-font-size)]">
          <p className="rounded-[var(--radius-sm)] bg-neutral-50 p-3 text-[var(--panel-ink-muted)]">
            Sayfa bağlamı: {pageContext ?? "genel panel"}
          </p>
          <p className="text-[var(--panel-ink-muted)]">
            Fiyat, stok veya bakiye için kaynaklı okuma araçları bağlandığında yanıt verilir.
            Şimdilik isteklerinizi not alın; değer üretimi kapalıdır.
          </p>
        </div>
      </aside>
    </>
  );
}
