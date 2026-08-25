"use client";

import { useMemo, useState } from "react";
import { LotManager } from "@/components/admin/lot-manager";
import { cn } from "@/lib/utils";

export type StockVariantOption = {
  id: string;
  sku: string;
  packLabel: string;
};

export type StockLotPayload = {
  id: string;
  lotNumber: string;
  expirationDate: string;
  expired: boolean;
  availableKg: string;
  movements: {
    id: string;
    type: "GIRIS" | "CIKIS" | "FIRE" | "REPACK";
    quantityKg: string;
    note: string | null;
    createdAt: string;
  }[];
};

export function ProductStockTab({
  slug,
  variants,
  lotsByVariantId,
  initialVariantId,
}: {
  slug: string;
  variants: StockVariantOption[];
  lotsByVariantId: Record<string, StockLotPayload[]>;
  initialVariantId: string;
}) {
  const [selectedId, setSelectedId] = useState(
    variants.some((v) => v.id === initialVariantId)
      ? initialVariantId
      : (variants[0]?.id ?? ""),
  );

  const selected = useMemo(
    () => variants.find((v) => v.id === selectedId) ?? variants[0] ?? null,
    [variants, selectedId],
  );

  if (!selected) {
    return (
      <p className="text-sm text-stone-500 dark:text-zinc-400">
        Bu ürün için aktif paket (varyant) yok. Önce Fiyat &amp; Varyantlar sekmesinden paket ekleyin.
      </p>
    );
  }

  const lots = lotsByVariantId[selected.id] ?? [];

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-stone-700 dark:text-zinc-300">
          Stok eklenecek paket
        </p>
        {variants.length === 1 ? (
          <p className="rounded-xl bg-stone-100 px-3 py-2.5 text-sm text-stone-700 dark:bg-zinc-800 dark:text-zinc-300">
            {selected.packLabel}
            <span className="ml-2 font-mono text-xs text-stone-500 dark:text-zinc-400">
              {selected.sku}
            </span>
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2" role="listbox" aria-label="Paket seçimi">
            {variants.map((v) => {
              const active = v.id === selected.id;
              return (
                <li key={v.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => setSelectedId(v.id)}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-[#1B5E3A] text-white"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700",
                    )}
                  >
                    <span>{v.packLabel}</span>
                    <span
                      className={cn(
                        "font-mono text-xs",
                        active ? "text-white/80" : "text-stone-500 dark:text-zinc-400",
                      )}
                    >
                      {v.sku}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-3 text-sm text-stone-500 dark:text-zinc-400">
          Lotlar seçili paket (
          <code className="font-mono text-stone-700 dark:text-zinc-300">{selected.sku}</code>
          ) seviyesindedir. Süresi geçmiş lottan satış/çıkış yapılamaz; eldeki miktar fire (imha) ile
          düşülür.
        </p>
      </div>

      <LotManager key={selected.id} variantId={selected.id} slug={slug} lots={lots} />
    </div>
  );
}
