"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "quick", label: "Hızlı sipariş" },
  { id: "catalog", label: "Katalogdan seç" },
  { id: "lists", label: "Listelerimden" },
] as const;

export function OrderTabs({ defaultTab }: { defaultTab: "quick" | "catalog" | "lists" }) {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>(defaultTab);

  return (
    <div className="space-y-4 pb-20 sm:pb-6">
      <h1 className="text-xl font-bold text-[var(--panel-ink)]">Sipariş ver</h1>
      <div
        className="flex gap-1 overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--panel-border)] bg-white p-1"
        role="tablist"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "min-h-11 flex-1 rounded-[6px] px-3 text-[length:var(--panel-font-size)] font-medium whitespace-nowrap",
              tab === t.id
                ? "bg-[var(--panel-accent-action)] text-white"
                : "text-[var(--panel-ink-muted)]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "quick" ? (
        <section className="rounded-[var(--radius-md)] border border-[var(--panel-border)] bg-white p-4">
          <p className="text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
            SKU veya ürün adıyla satır satır ekleme. Excel yapıştırma yakında.
          </p>
          <label className="mt-3 block text-caption font-medium" htmlFor="quick-sku">
            Ürün / SKU
          </label>
          <input
            id="quick-sku"
            className="mt-1 h-12 w-full rounded-[var(--radius-sm)] border border-[var(--panel-border)] px-3"
            placeholder="Örn. beyaz peynir veya SKU"
          />
        </section>
      ) : null}

      {tab === "catalog" ? (
        <section className="rounded-[var(--radius-md)] border border-[var(--panel-border)] bg-white p-4">
          <p className="text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
            Tam katalog mağaza deneyiminde.
          </p>
          <Link
            href="/urunler"
            className="mt-3 inline-flex min-h-12 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--panel-accent-action)] px-4 font-semibold text-white"
          >
            Kataloğu aç
          </Link>
        </section>
      ) : null}

      {tab === "lists" ? (
        <section className="rounded-[var(--radius-md)] border border-[var(--panel-border)] bg-white p-4">
          <p className="text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
            Kayıtlı listeleriniz burada listelenecek.
          </p>
        </section>
      ) : null}
    </div>
  );
}
