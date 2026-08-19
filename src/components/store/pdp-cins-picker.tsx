"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { kg } from "@/domain/weight";
import { formatKg } from "@/lib/format/weight";
import {
  kgPerPackLabel,
  packSummary,
  packagingTypeLabel,
  salesUnitLabel,
} from "@/lib/format/packaging";
import { PdpCommerceGate } from "@/components/store/pdp-commerce-gate";
import { cn } from "@/lib/utils";

export type PdpCins = {
  id: string;
  packLabel: string;
  packagingType: string;
  packSize: string | null;
  unitFactor: string;
};

export function PdpCinsPicker({
  cinsler,
  slug,
  isDealer,
  children,
}: {
  cinsler: PdpCins[];
  slug: string;
  isDealer: boolean;
  children?: ReactNode;
}) {
  const [selectedId, setSelectedId] = useState(cinsler[0]?.id ?? "");
  const selected = useMemo(
    () => cinsler.find((c) => c.id === selectedId) ?? cinsler[0] ?? null,
    [cinsler, selectedId],
  );

  if (!selected) return null;

  const summary = packSummary({
    packSize: selected.packSize,
    packagingType: selected.packagingType,
    unitFactor: selected.unitFactor,
  });
  const net =
    kgPerPackLabel(selected.unitFactor) ?? formatKg(kg(selected.unitFactor));

  return (
    <div>
      <p className="mkt-body mt-2">{summary}</p>

      <dl className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-[1rem] bg-[#FAF8F3] px-3 py-3">
          <dt className="mkt-label text-mkt-ink-muted">Ambalaj</dt>
          <dd className="mt-1 text-[14px] font-semibold text-mkt-ink">
            {packagingTypeLabel(selected.packagingType)}
          </dd>
        </div>
        <div className="rounded-[1rem] bg-[#FAF8F3] px-3 py-3">
          <dt className="mkt-label text-mkt-ink-muted">Net</dt>
          <dd className="mt-1 text-[14px] font-semibold tabular-nums text-mkt-ink">{net}</dd>
        </div>
        <div className="rounded-[1rem] bg-[#FAF8F3] px-3 py-3">
          <dt className="mkt-label text-mkt-ink-muted">Satış</dt>
          <dd className="mt-1 text-[14px] font-semibold text-mkt-ink">
            {salesUnitLabel(selected.packagingType)}
          </dd>
        </div>
      </dl>

      {cinsler.length > 1 ? (
        <div className="mt-5">
          <p className="mkt-label text-mkt-ink">Cins</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {cinsler.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "mkt-pill mkt-label px-3 py-1.5",
                    c.id === selected.id
                      ? "bg-mkt-accent text-mkt-accent-ink"
                      : "bg-[#FAF8F3] text-mkt-ink hover:bg-white",
                  )}
                >
                  {c.packLabel}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {children}

      <PdpCommerceGate slug={slug} cinsId={selected.id} isDealer={isDealer} />
    </div>
  );
}
