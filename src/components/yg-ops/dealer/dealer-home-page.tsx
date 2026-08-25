"use client";

import { useState } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { QtyStepper } from "@/components/yg-ops/dealer/qty-stepper";
import { CartDrawer } from "@/components/yg-ops/dealer/cart-drawer";
import { BlockingNotice } from "@/components/yg-ops/dealer/blocking-notice";
import { OrderTimeline } from "@/components/yg-ops/dealer/order-timeline";
import {
  CreditBar,
  PageHeaderSlot,
  ProductCard,
  StatusBadge,
  YgButton,
} from "@/components/yg-ops/shared";
import { formatYgMoney, formatYgQty } from "@/lib/yg-ops/format";
import {
  MOCK_CATALOG,
  MOCK_DEALER_CREDIT,
  MOCK_LAST_ORDER,
} from "@/lib/yg-ops/mock-data";

export function DealerHomePage() {
  const [qtyBySku, setQtyBySku] = useState<Record<string, number>>({
    "sku-beyaz": 2,
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [activeSkuId, setActiveSkuId] = useState("sku-beyaz");

  const activeSku = MOCK_CATALOG.find((s) => s.id === activeSkuId) ?? MOCK_CATALOG[0];
  const packs = qtyBySku[activeSku.id] ?? 0;
  const belowMin = activeSku.id === "sku-beyaz" && packs > 0 && packs < 3;
  const lineTotal = packs * activeSku.priceKurus;
  const remaining = MOCK_DEALER_CREDIT.limitKurus - MOCK_DEALER_CREDIT.usedKurus;
  const overLimit = lineTotal > remaining;
  const canAdd = packs > 0 && !belowMin && !overLimit;

  return (
    <div className="space-y-6">
      <PageHeaderSlot
        title={`Merhaba, ${MOCK_DEALER_CREDIT.dealerName}`}
        description="Kredi, tekrar sipariş ve katalog kısayolları (mock)."
      >
        {!cartOpen ? (
          packs > 0 ? (
            <YgButton
              variant="primary"
              disabled={!canAdd}
              onClick={() => setCartOpen(true)}
            >
              Sepete ekle
            </YgButton>
          ) : (
            <Link href="/portal/katalog">
              <YgButton variant="primary">Kataloğa git</YgButton>
            </Link>
          )
        ) : null}
      </PageHeaderSlot>

      <div className="flex flex-wrap gap-2">
        {packs > 0 && !cartOpen ? (
          <Link href="/portal/katalog">
            <YgButton variant="ghost">Kataloğa git</YgButton>
          </Link>
        ) : null}
        <Link href="/portal/siparisler">
          <YgButton variant="ghost">Siparişlerim</YgButton>
        </Link>
        <Link href="/portal/cari">
          <YgButton variant="ghost">Cari</YgButton>
        </Link>
      </div>

      <div className="rounded-[var(--yg-radius-lg)] bg-[var(--yg-panel-2)] p-4">
        <p className="mb-3 text-[length:var(--yg-text-13)] text-[var(--yg-text-muted)]">
          Kredi limiti
        </p>
        <CreditBar
          usedKurus={MOCK_DEALER_CREDIT.usedKurus}
          limitKurus={MOCK_DEALER_CREDIT.limitKurus}
        />
      </div>

      <div className="rounded-[var(--yg-radius-lg)] bg-[var(--yg-panel-2)] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[length:var(--yg-text-13)] text-[var(--yg-text-muted)]">
              Son sipariş
            </p>
            <p className="mt-1 text-[length:var(--yg-text-16)] font-medium text-[var(--yg-text)]">
              {MOCK_LAST_ORDER.id} · {formatYgMoney(MOCK_LAST_ORDER.totalKurus)}
            </p>
            <p className="mt-1 text-[length:var(--yg-text-13)] text-[var(--yg-text-muted)]">
              {MOCK_LAST_ORDER.summary}
            </p>
            <div className="mt-2">
              <StatusBadge stage={MOCK_LAST_ORDER.stage} />
            </div>
          </div>
          <YgButton variant="ghost" className="gap-2">
            <RotateCcw className="size-4" aria-hidden />
            Tekrarla
          </YgButton>
        </div>
      </div>

      {(belowMin || overLimit) && packs > 0 ? (
        <div className="space-y-2">
          {belowMin ? (
            <BlockingNotice
              tone="warning"
              title="Minimum sipariş"
              reason="Bu ürün için en az 3 teneke gerekir. Adet artırılmadan sepete eklenemez."
            />
          ) : null}
          {overLimit ? (
            <BlockingNotice
              tone="danger"
              title="Limit yetersiz"
              reason="Seçilen tutar kalan kredi limitini aşıyor. Miktarı düşürün veya limit artırımı talep edin."
            />
          ) : null}
          <p className="text-[length:var(--yg-text-12)] text-[var(--yg-text-muted)]">
            Üstteki yeşil aksiyon pasif kalır; önce engeli giderin.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-3">
          <h2 className="text-[length:var(--yg-text-16)] font-medium text-[var(--yg-text)]">
            Hızlı ekle
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {MOCK_CATALOG.slice(0, 2).map((sku) => {
              const q = qtyBySku[sku.id] ?? 0;
              return (
                <ProductCard
                  key={sku.id}
                  name={sku.name}
                  imageUrl={sku.imageUrl}
                  priceKurus={sku.priceKurus}
                  stockKg={sku.stockKg}
                  packCount={sku.packCount}
                  packLabel={sku.packLabel}
                  expirationDate={sku.expirationDate}
                  footer={
                    <QtyStepper
                      packs={q}
                      kgPerPack={sku.kgPerPack}
                      packLabel={sku.packLabel}
                      onChange={(next) => {
                        setActiveSkuId(sku.id);
                        setQtyBySku((prev) => ({ ...prev, [sku.id]: next }));
                      }}
                    />
                  }
                />
              );
            })}
          </div>
        </div>

        <div className="rounded-[var(--yg-radius-lg)] bg-[var(--yg-panel-2)] p-4">
          <p className="text-[length:var(--yg-text-16)] font-medium text-[var(--yg-text)]">
            Aktif sipariş
          </p>
          <p className="mt-1 text-[length:var(--yg-text-13)] text-[var(--yg-text-muted)]">
            YG-1040 · {formatYgMoney(4530000)}
          </p>
          <div className="mt-4">
            <OrderTimeline current="preparing" />
          </div>
        </div>
      </div>

      <BlockingNotice
        tone="info"
        title="Teslimat günü"
        reason="Bölgeniz için bir sonraki soğuk zincir günü Perşembe. Kapalı güne sipariş yazılamaz."
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        lineCount={packs > 0 ? 1 : 0}
        footer={
          <YgButton variant="ghost" className="w-full" onClick={() => setCartOpen(false)}>
            Alışverişe dön
          </YgButton>
        }
      >
        {packs > 0 ? (
          <div className="space-y-2">
            <p className="text-[length:var(--yg-text-14)] font-medium text-[var(--yg-text)]">
              {activeSku.name}
            </p>
            <p className="text-[length:var(--yg-text-13)] text-[var(--yg-text-muted)]">
              {formatYgQty(packs, packs * activeSku.kgPerPack, activeSku.packLabel)} ·{" "}
              {formatYgMoney(lineTotal)}
            </p>
          </div>
        ) : (
          <p className="text-[length:var(--yg-text-14)] text-[var(--yg-text-muted)]">Sepet boş.</p>
        )}
      </CartDrawer>
    </div>
  );
}
