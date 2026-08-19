# Cursor handoff: Blok A0 (ledger tutarlılığı)

Bu oturum **D4 (SKT fire)** uygulandı. Bu dosyayı **ayrı bir Cursor agent** ile çalıştır: ledger / cari / proforma. D4 dosyalarına dokunma.

## Kapsam (yalnızca bunlar)

Master prompt: `docs/master-prompt-yetis-grup.md` → **Alt-prompt A0** + A3’ün proforma rozet kısmı.

### 1) `/bayi/cari` kullanılabilir limit

**Bug:** `/bayi/cari` `limit - ledgerBalance` kullanır. `/bayi/siparis` `getDealerCreditExposure` kullanır (ledger + açık CARI siparişler).

**Düzelt:** `/bayi/cari` kullanılabilir limiti `getDealerCreditExposure` ile aynı yap.

Dosya: `src/app/(dealer-portal)/bayi/cari/page.tsx`  
Kaynak: `src/infra/db/orders.ts` → `getDealerCreditExposure`

### 2) Onayda CARI limit tekrar

**Bug:** `canUseOnAccount` yalnızca `createOrderFromCart` içinde. `transitionOrder` `UNDER_REVIEW` → `CONFIRMED` için tekrar kontrol yok.

**Düzelt:** CARI siparişlerde `CONFIRMED` geçişinde taze `getDealerCreditExposure` + `canUseOnAccount`. Reddet: mevcut `eligibility.reason`.

Dosya: `src/infra/db/orders.ts` → `transitionOrder`  
Domain: `src/domain/ledger.ts` (`canUseOnAccount` imzasını bozma)

### 3) `DELIVERED` → BORC

**Bug:** Teslimatta her zaman `LedgerEntry` BORC. ONLINE veya `paidAt` dolu siparişlerde çift borç riski.

**Düzelt (seç ve test et):**

- `paymentMethod === "ONLINE"` veya `paidAt != null` ise teslimatta BORC açma; **veya**
- Teslimatta BORC aç, paid ise aynı tutarda ODEME (net sıfır). Mevcut havale akışı (`confirmOrderPayment`) ile çakışmayı oku.

Havale: ödeme onayı ODEME yazar; teslimatta BORC beklenir (net = sipariş tutarı). ONLINE mock `paidAt` set eder ama ODEME yazmaz.

Dosya: `src/infra/db/orders.ts` (`transitionOrder`, `confirmOrderPayment`)

### 4) Proforma slide-over ödeme görünürlüğü (A3 ince dilim)

Dosya: `src/components/admin/fatura-list.tsx`

Ekle (yeni model yok): sipariş `paymentMethod`, `paidAt`, bayi `paymentTermDays` ile rozetler:

- "Proforma" (zorunlu, e-fatura değil)
- "Ödendi" / "Cari açık" / "Gönderilmedi"

e-Fatura adapter yazma. PDF şablonunu bozma.

## Yapma

- `StockMovementType.FIRE`, `lot-manager`, `stock-board`, `domain/inventory/movements.ts` (D4, bu oturum)
- Teminat, risk skoru, aging bucket, gecikme faizi (A1/A2, sonra)
- `domain/pricing/`

## Test

- `tests/unit/ledger.test.ts` genişlet
- Teslimat + ONLINE / HAVALE / CARI senaryoları
- `pnpm test` + `pnpm typecheck`

## Para kuralı

Integer kuruş. Ledger append-only. Undo yok; ters kayıt.

## Referans

`docs/master-prompt-yetis-grup.md` bölüm BLOK A, boşluk tablosu satır 1-3 ve 11.
