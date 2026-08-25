"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BlockingNotice } from "@/components/yg-ops/dealer/blocking-notice";
import {
  PageHeaderSlot,
  YgButton,
} from "@/components/yg-ops/shared";
import { formatYgMoney, formatYgQty } from "@/lib/yg-ops/format";
import { MOCK_DEALER_CREDIT } from "@/lib/yg-ops/mock-data";

type CartLine = {
  id: string;
  name: string;
  packs: number;
  kgPerPack: number;
  packLabel: string;
  priceKurus: number;
  moq: number;
};

const SEED: CartLine[] = [
  {
    id: "sku-beyaz",
    name: "Tazelim Beyaz Peynir",
    packs: 2,
    kgPerPack: 17,
    packLabel: "teneke",
    priceKurus: 1850000,
    moq: 3,
  },
  {
    id: "sku-kasar",
    name: "Eski Kaşar",
    packs: 10,
    kgPerPack: 1,
    packLabel: "vakum",
    priceKurus: 980000,
    moq: 1,
  },
];

export function DealerCartPage() {
  const [lines, setLines] = useState(SEED);
  const [confirmed, setConfirmed] = useState(false);

  const subtotal = lines.reduce((s, l) => s + l.packs * l.priceKurus, 0);
  const remaining = MOCK_DEALER_CREDIT.limitKurus - MOCK_DEALER_CREDIT.usedKurus;
  const moqFails = lines.filter((l) => l.packs > 0 && l.packs < l.moq);
  const overLimit = subtotal > remaining;
  const empty = lines.every((l) => l.packs === 0) || lines.length === 0;
  const blocked = empty || moqFails.length > 0 || overLimit;

  const reasons = useMemo(() => {
    const list: { tone: "warning" | "danger" | "info"; title: string; reason: string }[] = [];
    if (empty) {
      list.push({
        tone: "info",
        title: "Sepet boş",
        reason: "Onay için en az bir kalem gerekir. Katalogdan ürün ekleyin.",
      });
    }
    for (const l of moqFails) {
      list.push({
        tone: "warning",
        title: `${l.name}: minimum adet`,
        reason: `En az ${l.moq} ${l.packLabel} seçilmeli.`,
      });
    }
    if (overLimit) {
      list.push({
        tone: "danger",
        title: "Limit yetersiz",
        reason: `Sepet tutarı (${formatYgMoney(subtotal)}) kalan limiti (${formatYgMoney(remaining)}) aşıyor.`,
      });
    }
    return list;
  }, [empty, moqFails, overLimit, remaining, subtotal]);

  return (
    <div className="space-y-6">
      <PageHeaderSlot title="Sepet" description="Engel kuralları ve onay (mock).">
        {!confirmed ? (
          <YgButton
            variant="primary"
            disabled={blocked}
            onClick={() => setConfirmed(true)}
          >
            Siparişi onayla
          </YgButton>
        ) : null}
      </PageHeaderSlot>

      {confirmed ? (
        <BlockingNotice
          tone="info"
          title="Sipariş alındı (mock)"
          reason="YG-1043 incelemede. Canlı akış /bayi üzerinde çalışır."
        />
      ) : null}

      {reasons.map((r) => (
        <BlockingNotice key={r.title} tone={r.tone} title={r.title} reason={r.reason} />
      ))}

      {blocked && !confirmed ? (
        <p className="text-[length:var(--yg-text-12)] text-[var(--yg-text-muted)]">
          Yeşil onay butonu pasif: önce yukarıdaki engelleri giderin.
        </p>
      ) : null}

      <ul className="space-y-3">
        {lines.map((line) => (
          <li
            key={line.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--yg-radius-lg)] bg-[var(--yg-panel-2)] p-4"
          >
            <div>
              <p className="text-[length:var(--yg-text-14)] font-medium text-[var(--yg-text)]">
                {line.name}
              </p>
              <p className="mt-1 text-[length:var(--yg-text-13)] text-[var(--yg-text-muted)]">
                {formatYgQty(line.packs, line.packs * line.kgPerPack, line.packLabel)} ·{" "}
                {formatYgMoney(line.packs * line.priceKurus)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <YgButton
                variant="ghost"
                className="min-h-[44px] px-3"
                onClick={() =>
                  setLines((prev) =>
                    prev.map((l) =>
                      l.id === line.id ? { ...l, packs: Math.max(0, l.packs - 1) } : l,
                    ),
                  )
                }
              >
                −
              </YgButton>
              <span className="min-w-[2rem] text-center tabular-nums text-[length:var(--yg-text-16)]">
                {line.packs}
              </span>
              <YgButton
                variant="ghost"
                className="min-h-[44px] px-3"
                onClick={() =>
                  setLines((prev) =>
                    prev.map((l) =>
                      l.id === line.id ? { ...l, packs: l.packs + 1 } : l,
                    ),
                  )
                }
              >
                +
              </YgButton>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--yg-radius-lg)] bg-[var(--yg-panel-2)] p-4">
        <span className="text-[length:var(--yg-text-14)] text-[var(--yg-text-muted)]">Ara toplam</span>
        <span className="text-[length:var(--yg-text-16)] font-semibold tabular-nums text-[var(--yg-text)]">
          {formatYgMoney(subtotal)}
        </span>
      </div>

      <Link href="/portal/katalog">
        <YgButton variant="ghost">Kataloga dön</YgButton>
      </Link>
    </div>
  );
}
