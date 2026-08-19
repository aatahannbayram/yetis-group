# Yetiş Grup: Strateji ve Ürün Master Prompt

Bu belge, Yetiş Grup B2B platformu için **tek parça master prompt** veya **blok blok alt-prompt** kaynağıdır. Her blok bağımsız çalıştırılabilir; birleşik kullanımda sıra: **C → A → B → D → E**.

**Son kod analizi:** 2026-08-19 · branch `main` · canlı: `https://yetisgrup.com`  
**Ekran kanıtı:** `/panel/urunler` lot kartı (YG-BP17-TNK) + `/panel/faturalar` proforma slide-over. Üçüncü kart (ipeksu denizcilik) repoda yok; ticari belge UX referansı olarak işlendi.

---

## Sistem durumu özeti (kod tabanından)

### Yüzler ve erişim

| Yüz | Path | Durum |
|-----|------|-------|
| Bayi mağazası | `/`, `/urunler`, `/sepet` | Canlı |
| Bayi portalı | `/bayi`, `/bayi/cari`, `/bayi/siparis`, `/bayi/firmam`, `/bayi/firsatlar` | Canlı (son UI polish: dealer-home-modules, firmam, firsatlar) |
| Yönetim paneli | `/panel/*` | Canlı; nav grupları: Operasyon, Satış, Katalog, Finans, İçerik, Saha, Sistem |
| Auth | `/auth` | better-auth; demo: `bayi@yetisgrup.test` / `admin@yetisgrup.test`, şifre `YetisDemo1!` |

### Milestone gerçeği

| ID | Kapsam | Kod durumu |
|----|--------|------------|
| M0–M4 | Auth, ürün, bayi, fiyat listesi, sipariş FSM, kredi limiti | **Tamam** |
| M12.5 | Category, Variant, Dealer, sunucu sepeti | **Tamam** |
| M13 | Kategori/nitelik UI | **Tamam** |
| M14 | Blog + reçete + seed + RSS + Schema.org | **Tamam** (`tests/unit/m14-content.test.ts`) |
| M15 | SEO, sitemap, robots, llms.txt, çerez rızası, 301 admin | **Tamam** (`tests/unit/m15-seo.test.ts`) |
| M16 | CRM lead havuzu, `/iletisim`, aktivite | **Tamam** (`/panel/bayi-adaylari`) |
| M3 (hedef) | `domain/pricing/` kademeli iskonto motoru | **Yok** (fiyat listesi infra seviyesinde) |
| M18 (plan) | İskonto yığını (hacim, SKT lot, kupon) | **Yok** |
| e-Fatura adapter | `infra/e-invoice/` | **Yok** (proforma canlı) |

### İş modeli kilidi (repoda uygulanmış)

| Soru | Karar | Kanıt |
|------|--------|-------|
| Stok kimin? | **Yetiş (distribütör)** | `Lot`, `StockMovement`, `Shipment`, FEFO |
| Marketplace? | **Hayır (bu faz)** | CLAUDE.md; Supplier modeli yok |
| Producer vs Supplier | Producer = kamu hikâyesi; Supplier ayrı tablo yok | `Producer`, `Product.producerId` |
| Ticari varlık | Tek `Dealer`; `Customer` yok | `prisma/schema.prisma` |
| Sepet | Sunucuda `Cart` / `CartLine` | client localStorage yok |

### Kritik Prisma modelleri (mevcut)

```
Dealer, DealerUserRole, LedgerEntry
Producer, Product, ProductVariant, Lot, StockMovement
PriceList, PriceListItem, Cart, CartLine
Order, OrderLine, OrderEvent, Shipment, ShipmentLotAllocation
ProformaInvoice, ProformaLine
Campaign, ContentPost, Recipe, SeoRedirect, Lead
WhatsAppOutboxMessage, Notification, PaymentSettings
```

**Hiç yok:** `Supplier`, `Collateral`, `DealerRiskScore`, `OrderReturn`, `Refund`, `DeliveryZone`, `DeliverySchedule`, `PriceOverrideRequest`, `Coupon`, e-Fatura/e-İrsaliye kayıt modelleri.

---

## Bilinen boşluklar ve tutarsızlıklar (öncelikli düzeltme)

Bu maddeler strateji notlarındaki risklerin **kodda henüz kapatılmadığını** gösterir. Master prompt alt-prompt'larında referans alınmalıdır.

| # | Konu | Mevcut davranış | Risk |
|---|------|-----------------|------|
| 1 | Kredi kontrolü | Yalnızca `createOrderFromCart` (CARI); `transitionOrder` onayda tekrar kontrol yok | Onay sırasında limit aşılabilir |
| 2 | Bayi cari "kullanılabilir limit" | `/bayi/cari`: `limit - balance` | `/bayi/siparis`: `getDealerCreditExposure` (açık CARI siparişler dahil). **Tutarsız** |
| 3 | Teslimat → borç | `DELIVERED` → her zaman `LedgerEntry` BORC | ONLINE ödemede çift kayıt / yanlış bakiye riski |
| 4 | Vade | `paymentTermDays` saklanır, gösterilir | `dueDate`, aging, gecikme hesabı yok |
| 5 | `DealerStatus.RISKLI/BLOKE` | Enum var | Otomatik geçiş veya risk skoru yok |
| 6 | Ledger izlenebilirlik | `description` metni | `orderId`, `invoiceId`, audit (kim ekledi) yok |
| 7 | Kampanya | Admin CRUD var | Fiyat motoruna bağlı değil (`CartLine.discountBreakdown` boş) |
| 8 | Onay kuyruğu | `/panel/onay-kuyrugu` sipariş onayı | Fiyat override onayı yok |
| 9 | SKT geçmiş lot | Çıkış UI disabled + `assertNotExpired` + FEFO filtre | 85 kg gibi miktar hâlâ "mevcut"; `FIRE`/`IMHA` hareketi yok; dashboard `totalKg` süresi geçmişi içerir |
| 10 | Yakın SKT | `/bayi/firsatlar` 21 gün liste | Fiyat düşmez; kampanya/iskonto motoruna bağlı değil (M18) |
| 11 | Proforma vs tahsilat | `/panel/faturalar` PDF + e-posta | Ödeme durumu yok; ledger/ODEME ile bağlı değil; e-Fatura değil |
| 12 | Stok dilimi | `totalKg` (tümü) vs `shippableKg` (FEFO) | Lot kartında tek "kg mevcut" yazısı; sevk edilemez stok satılabilir gibi durur |

---

## Ekran kanıtı analizi (panel, 2026-08)

Kaynak: ürün stok sekmesi, fatura slide-over, harici ticari kart. Kodla birebir eşleşti.

### 1) Lot kartı: YG-BP17-TNK (Yetiş paneli)

**Ekranda görünen**

- Kural metni: "Lotlar varyant (YG-BP17-TNK) seviyesindedir. Süresi geçmiş lottan çıkış yapılamaz."
- Form: Lot No (`L-2026-08-01`), SKT, Giriş Miktarı kg, "+ Lot Ekle"
- Satır: `YG-BP17-TNK-B` · kırmızı "15.08.2026 · Süresi geçti" · yeşil **"85 kg mevcut"**

**Kod gerçeği**

| Katman | Davranış | Dosya |
|--------|----------|--------|
| UI kuralı | Çıkış select `disabled={lot.expired}` | `src/components/admin/lot-manager.tsx` |
| Domain | `assertNotExpired` CIKIS ve sevkte | `src/domain/inventory/fefo.ts`, `infra/db/inventory.ts` |
| FEFO | Süresi geçmiş lot öneriye hiç girmez | `sortLotsByFefo`, `suggestFefoShipment` |
| Hareket tipi | `GIRIS`, `CIKIS`, `REPACK` (REPACK bakiyeye yazılmaz) | `StockMovementType` |
| Dashboard | `totalKg` = tüm lot bakiyeleri (expired dahil) | `getInventoryDashboardSummary` |
| Fırsatlar | SKT 0-21 gün, fiyat liste fiyatı | `/bayi/firsatlar` |

**Analiz (operasyonel)**

1. **Sevk kilidi doğru.** Gıda toptancılığında SKT geçmiş lot sevk edilemez kuralı hem UI hem domain hem FEFO'da duruyor. Bu, distribütör modelinin en güçlü kanıtı.
2. **Fire yolu yok.** 85 kg peynir fiziksel olarak depoda; ticari olarak ölü stok. Ne imha (`IMHA`/`FIRE`), ne iade tedarikçiye, ne maliyet yazımı var. Cari/P&L bu kg'yi görmez; stok KPI şişer.
3. **"Mevcut" yanıltıcı.** Yeşil "85 kg mevcut" sevk edilebilir gibi okunur. Ayrım kodda var (`shippableKg` vs `totalKg`) ama lot kartında yok.
4. **Yakın SKT ticarileştirilmemiş.** `/bayi/firsatlar` lotu gösterir, fiyatı düşürmez. "Adil fiyat" ve SKT iskonto (M18) bu ekranla bağlanmalı; aksi halde fire büyür.
5. **REPACK ölü.** Enum var, bakiye hesabı yok. Teneke → vakum gibi operasyon kaydedilemez.

**Ürün kararı (Blok D4)**

- Lot kartında iki sayı: **sevk edilebilir kg** (yeşil) ve **SKT geçmiş eldeki kg** (kırmızı, fire adayı).
- Yeni hareket: `FIRE` veya `IMHA` (CIKIS benzeri, expired'a izinli, not zorunlu).
- Dashboard: "Toplam stok" = shippable; ayrı kart "Fire adayı kg".
- 14 gün kala otomatik fırsat + (ileride) SKT satır iskontosu.

### 2) Proforma slide-over: PRF-… (Yetiş `/panel/faturalar`)

**Ekranda görünen**

- Belge no `PRF-YYYY-NNNNN`, alıcı unvan/adres/e-posta
- Kalem: Beyaz Peynir 17 kg Teneke (YG-BP17-TNK), adet, birim
- Ara toplam / KDV / genel toplam (kuruş, integer)
- Birincil: "PDF görüntüle / indir" · ikincil: "Yeniden gönder"

**Kod gerçeği**

| Var | Yok |
|-----|-----|
| Otomatik düzenleme (sipariş oluşunca) | e-Fatura / GİB |
| Alıcı snapshot (unvan, VN, adres, e-posta) | Ödeme yolu sekmesi |
| KDV split `computeProformaTotals` | ONAYLANDI / ODEME YAPILDI rozeti |
| PDF + Resend | Ledger `ODEME` bağlantısı |
| Durum: DRAFT / ISSUED / VOID | Makbuz sil, vade tarihi, tahsilat |

**Analiz (finans)**

1. **Bu bir teklif/ön fatura, yasal fatura değil.** `InvoiceKind.E_FATURA` enum'da rezerve; adapter yok. Muhasebe ve alıcı bunu "fatura" sanırsa KDV/irsaliye riski.
2. **Tahsilat kör.** Havale alındı (`confirmOrderPayment`) veya cari ODEME (`/panel/tahsilat`) proforma üzerinde görünmez. Paraşüt/Logo tarzı "Ödendi" beklentisi karşılanmıyor.
3. **Vade yok.** `paymentTermDays` bayide durur; belgede due date yok. Blok A aging'in belge ayağı eksik.
4. **Tutarlar doğru mimari.** Integer kuruş, KDV ürün oranından, snapshot. Bunu bozma; üzerine ödeme durumu ekle.

**Ürün kararı (Blok A + D3)**

- Slide-over'a: sipariş ödeme yöntemi, `paidAt` / cari bakiye özeti, vade (teslim + `paymentTermDays`).
- Rozetler: "Proforma" (zorunlu) + "Ödendi / Cari açık / Gönderilmedi". "ONAYLANDI" sipariş FSM'e ait; belgede kopyalama.
- e-Fatura D3; bu ekranı e-belgeymiş gibi büyütme.

### 3) Müşteri kartı: ipeksu denizcilik (referans UX)

Repoda `ipeksu` / `ipekdivan00@gmail.com` yok. Kart: unvan + kapat + e-posta + aynı peynir kalemi 3.400 TL. Muhtemel kaynak: harici ön muhasebe (Paraşüt vb.) veya canlıda elle eklenmiş bayi.

**Ne öğretiyor**

- Alıcı kartı ticari özet olmalı (unvan, e-posta, son kalem/fiyat), sadece form değil.
- HORECA / kurumsal unvan (`… san. ve tic. ltd. şti.`) `DealerType` ile uyumlu; seed'de gerçekçi unvan az.
- Aynı SKU'nun hem stokta hem belgede görünmesi doğru (varyant kimliği çalışıyor).

**Ürün kararı**

- `/panel/bayiler` slide-over'a salt okunur özet şeridi: cari bakiye, limit, son sipariş, açık proforma.
- Canlı bayi kaydı seed'e karışmasın; KVKK: ekran görüntüsündeki kişisel e-posta dokümana örnek olarak geçmesin (bu belgede unvan tutuldu, e-posta tekrarlanmadı).

### Bu üç ekranın stratejiye bağlanması

| Ekran | Blok | Sonuç |
|-------|------|--------|
| SKT geçmiş 85 kg | **D** (stok/fire) + **B** (SKT fiyat) | Distribütör maliyeti: fire. Sevk kilidi yetmez; çıkış prosedürü lazım |
| Proforma PDF | **A** (tahsilat) + **D3** (e-belge) | Belge var, tahsilat ve yasal fatura yok |
| Alıcı kartı | **C** (B2B alıcı) | Dealer tek varlık; kartı cari+belge ile zenginleştir |

---

## Kullanım

```
# Tek seferde
MASTER PROMPT (aşağı) + seçili BLOK metnini yapıştır.

# Blok blok
"Sistem durumu özeti" + ilgili BLOK + "Bilinen boşluklar" tablosundan ilgili satırlar.
```

---

## MASTER PROMPT (üst metin, yapıştır)

```
Sen Yetiş Grup için B2B gıda toptancılığı stratejisti ve ürün mimarısın.

Bağlam:
- Yetiş: yöresel/kırsal ürünlerde çözüm ortağı (DISTRIBÜTÖR). Stok Yetiş'te; satın alma + sevkiyat Yetiş kontrolünde.
- Alıcılar: market, şarküteri, HORECA (DealerType: MARKET, SARKUTERI, HORECA, ZINCIR, ARA_TOPTANCI).
- Marketplace yok. Producer (hikâye) ≠ Supplier (dahili ticari; ayrı tablo yok). Üretici paneli yok.
- Stack: Next.js App Router, PostgreSQL, Prisma, better-auth, integer kuruş (domain/money), ledger append-only.
- Canlı demo: yetisgrup.com · bayi@yetisgrup.test / admin@yetisgrup.test · YetisDemo1!

Mevcut finans çekirdeği (doğrula, varsayma):
- domain/ledger.ts: calculateBalance, canUseOnAccount
- infra/db/ledger.ts: addLedgerEntry, reverseLedgerEntry, listDealerBalances
- infra/db/orders.ts: getDealerCreditExposure, createOrderFromCart (CARI limit), transitionOrder (DELIVERED→BORC)
- Panel: /panel/cari, /panel/tahsilat, /panel/bayiler (limit/vade edit)
- Bayi: /bayi/cari (salt okunur), /bayi/siparis (CARI seçeneği)

Eksik (henüz kod yok): teminat, risk skoru, aging bucket, gecikme faizi, tahsilat SLA, domain/pricing motoru, iade FSM, e-Fatura adapter, bölge×gün teslimat kuralı, lot FIRE/IMHA, proforma-ödeme bağı.

Ekran gerçeği: YG-BP17-TNK-B SKT geçmiş ama 85 kg "mevcut" görünür (sevk kilitli, fire yok). /panel/faturalar proforma PDF+e-posta; ödendi rozeti ve ledger bağı yok.

Stratejik ilke: Gıda toptancılığında şirketi öldüren marj değil, tahsil edilemeyen alacak. İlk 90 günde içerik/marka max 2 kanal; yurt dışı şirket kurulumu ertelenir.

Görev: Verilen bloğu uygulanabilir çıktıya çevir (politika metni TR, domain pure function, Prisma alanları English, admin/bayi UI, Vitest kriteri). "Şart ve kurallar" tek satırı veya tanımsız slogan kabul edilmez.
```

---

## BLOK A: Vadeli ödeme, tahsilat ve risk

### Stratejik problem

Vadeli ödeme en büyük ticari risk; yasal metin ve proforma maddesi tek satır yetmez. Cari limit, teminat, risk skoru, gecikme faizi ve tahsilat prosedürü gerekir.

### Kod analizi: Implemented

| Bileşen | Konum |
|---------|--------|
| `Dealer.paymentMethod` (`VADELI`, `PESIN`, `HAVALE`, `KARMA`) | `prisma/schema.prisma` |
| `Dealer.creditLimitKurus`, `paymentTermDays` | schema + `/panel/bayiler` edit |
| Append-only `LedgerEntry` (BORC/ODEME, `reversesId`) | `domain/ledger.ts`, `infra/db/ledger.ts` |
| `canUseOnAccount` + `getDealerCreditExposure` | sipariş oluşturmada CARI kontrolü |
| Teslimatta otomatik borç | `transitionOrder` → `DELIVERED` → BORC |
| Havale tahsilat | `confirmOrderPayment` → ODEME + `paidAt` |
| Admin cari panosu | `/panel/cari` · filtre, limit bar, manuel kayıt, ters kayıt |
| Tahsilat formu | `/panel/tahsilat` · aylık özet, son 30 ödeme |
| Bayi cari görünümü | `/bayi/cari` · bakiye, limit, son 40 hareket |
| Dashboard uyarısı | `/panel` · limit aşan bayiler |
| Proforma PDF | `infra/pdf/proforma-pdf.ts` · logo, ödeme maddesi |
| Unit test | `tests/unit/ledger.test.ts` |

### Kod analizi: Partial

| Bileşen | Durum |
|---------|--------|
| Limit kullanım UI | `CreditLimitBar`, cari metrikleri; aging renk yok |
| Vade gösterimi | Gün sayısı var; vade başlangıcı / due date yok |
| `DealerStatus.RISKLI`, `BLOKE` | Enum tanımlı; otomasyon yok |
| Tahsilat | Manuel staff girişi; WhatsApp hatırlatma / SLA yok |
| `PaymentSettings` | Havale IBAN (mağaza); cari tahsilat entegrasyonu değil |

### Kod analizi: Missing

- Teminat (çek, DBS, teminat mektubu) modeli ve UI
- Risk skoru ve skora bağlı limit/vade/durum geçişi
- Aging bucket (0-30 / 31-45 / 46+ gün) domain + renk kodu
- Gecikme faizi hesabı
- Tahsilat prosedürü (escalation: satış → muhasebe → bloke)
- Ledger ↔ sipariş FK (`orderId`), audit (createdBy)
- Kredi kontrolü sipariş onayında (`UNDER_REVIEW` → `CONFIRMED`)
- Proforma slide-over'da ödeme/vade rozeti (ekran: PDF var, "ödendi" yok)

### Alt-prompt A0: Bilinen bug düzeltmeleri (önce)

```
Block A0: Yetiş ledger tutarlılığı. Mevcut kodu oku; şunları düzelt:
1) /bayi/cari kullanılabilir limit = getDealerCreditExposure ile aynı mantık (açık CARI siparişler dahil).
2) transitionOrder UNDER_REVIEW→CONFIRMED: CARI siparişlerde canUseOnAccount tekrar kontrol.
3) DELIVERED→BORC: ONLINE ve önceden paidAt olan siparişlerde BORC açma veya simetrik ODEME netleştirme.
Çıktı: minimal diff, Vitest, davranış notu TR.
Dosyalar: infra/db/orders.ts, bayi/cari/page.tsx, domain/ledger.ts.
```

### Alt-prompt A1: Tahsilat politikası

```
Block A1: Yetiş Grup yazılı tahsilat prosedürü.
Vade başlangıcı: teslim + paymentTermDays (fatura anı değil, teslim esas).
Aging: 0-30 yeşil, 31-45 sarı, 46+ kırmızı.
Hatırlatma: WhatsApp template (domain/whatsapp/templates.ts), e-posta, plasiyer görevi.
Escalation: 31 gün satış → 45 gün muhasebe → 60 gün BLOKE + yeni CARI sipariş kapalı.
Gecikme faizi: formül + yasal üst sınır dipnotu.
Limit aşımı: yeni CARI sipariş reddi (mevcut); onay kuyruğunda ikinci kontrol (A0).
Çıktı: politika maddeleri TR + src/content/legal.ts bayi sözleşmesine eklenecek özet + domain/ledger/aging.ts imzaları.
```

### Alt-prompt A2: Teminat ve risk skoru

```
Block A2: Prisma + domain tasarımı.
Collateral: type (CHECK|DBS|LETTER|OTHER), amountKurus, dueDate, bankName, status.
RiskScore: inputs = limitUsagePct, avgDelayDays, returnRatePct, dealerType; output 0-100.
Eşik: score<40 AKTIF, 40-70 RISKLI (vade max 30), >70 BLOKE.
DealerStatus geçişleri policy modülünde; otomatik geçiş cron veya teslimat sonrası job.
Çıktı: schema draft, domain/dealer/risk.ts, policies matrisi, /panel/bayiler slide-over alanları.
```

### Alt-prompt A3: UI implementasyonu

```
Block A3: A1+A2 kodla.
/panel/cari: aging renk sütunu, gecikme günü, toplam alacak bucket özeti.
/panel/tahsilat: bucket dağılımı kartları.
/bayi: StatusStrip ve /bayi/cari vade durumu renk (A1 bucket).
/panel/faturalar slide-over: Proforma + Ödendi/Cari açık/Gönderilmedi; due date (teslim + paymentTermDays).
LedgerEntry: orderId optional FK, dueDate optional (migration).
Test: tests/unit/ledger-aging.test.ts, mevcut ledger.test.ts genişlet.
Undo yok; ters kayıt zorunlu (mevcut pattern).
```

### 90 gün çıkış kriteri (A)

- [ ] A0 bug fix'leri merged
- [ ] Tahsilat prosedürü docs + legal.ts referansı
- [ ] Aging domain + cari/tahsilat renk UI
- [ ] Onay kuyruğunda CARI limit re-check
- [ ] Teminat MVP (çek + DBS, staff-only)

---

## BLOK B: Adil satış fiyatı ve marj disiplini

### Stratejik problem

"Adil satış fiyatı" tanımsız slogan. Maliyet + hedef marj veya endeks + spread olmadan satış ekibi müşteri başına fiyat verir, marj erir.

### Kod analizi: Implemented

| Bileşen | Konum |
|---------|--------|
| Varyant baz fiyat | `ProductVariant.pricePerUnitKurus`, `vatRateBasisPoints` |
| Fiyat listesi + kalem | `PriceList`, `PriceListItem`, `/panel/fiyat-listeleri` |
| Bayi → liste ataması | `Dealer.priceListId`, `resolveDealerVariantPrice` |
| Sipariş fiyat snapshot | `OrderLine.unitPriceKurus`, `lineTotalKurus` |
| Mağaza fiyat gösterimi | `infra/db/dealer-catalog.ts` |
| Para domain | `domain/money/` |

### Kod analizi: Partial

| Bileşen | Durum |
|---------|--------|
| `MembershipTier` (STANDART/PREMIUM/VIP) | Bayide saklanır; fiyat hesabında kullanılmıyor |
| `Campaign` | Admin CRUD; checkout'a bağlı değil |
| `CartLine.discountBreakdown` | Alan var; her zaman `[]` |
| Onay kuyruğu | Sipariş onayı; fiyat override değil |

### Kod analizi: Missing

- **`src/domain/pricing/` klasörü yok** (M3/M18 hedefi)
- Kademeli iskonto, hacim, SKT lot satırı, otomatik, kupon
- Maliyet alanı (landed cost) ve marj guard
- Fiyat override talebi + onay FSM + audit
- `OrderLine` iskonto breakdown

### Alt-prompt B1: Fiyat formülü kilidi

```
Block B1: Yetiş için birincil fiyat motoru seç (distribütör modeli).
Öneri: landed cost (alış + lojistik + fire %) + hedef marj % + DealerType çarpanı (HORECA vs MARKET).
Alternatif: Tarım ÜFE endeksi + sabit spread (SKU az ise).
Değişkenler: costKurus (yeni alan?), targetMarginBps, dealerTypeMultiplier.
Güncelleme: alış fiyatı değişince liste revizyon; geçmiş sipariş snapshot korunur (mevcut).
Çıktı: formül dokümanı + domain/pricing/resolve-price.ts imzası.
```

### Alt-prompt B2: Override onay

```
Block B2: PriceOverrideRequest modeli.
Tetikleyici: plasiyer/admin liste altı fiyat; eşik: sapma > X% veya marj < Y%.
FSM: PENDING → APPROVED|REJECTED; onaylayan User, audit.
/panel/onay-kuyrugu: sekme veya ayrı /panel/fiyat-onaylari.
DealerType max iskonto tavanı config (domain/pricing/limits.ts).
Test: override reddi, onay sonrası snapshot.
```

### 90 gün çıkış kriteri (B)

- [ ] B1 formül kararı yazılı
- [ ] `domain/pricing/` iskelet + birim test
- [ ] Override onay MVP (tek seviye staff)
- [ ] Kampanya → fiyat motoruna bağlantı planı (M18)

---

## BLOK C: İş modeli kilidi

### Stratejik problem

Distribütör mü marketplace mi? Tek karar A, B, D bloklarının tamamını değiştirir.

### Repoda kilitli (değiştirme)

| Karar | Uygulama |
|-------|----------|
| Distribütör | Stok, lot, sevkiyat, FEFO Yetiş'te |
| Marketplace yok | Supplier tablosu yok; üretici paneli yok |
| Producer | Kamu `/ureticiler`, ürün hikâyesi |
| Lead → Dealer | `domain/leads/promote.ts`, `Lead.convertedDealerId` |
| B2C | Bu fazda yazılmaz |

### Alt-prompt C1: İş modeli canvas

```
Block C1: 1 sayfa distribütör canvas (TR).
Gelir: ürün marjı + lojistik markup + (gecikme faizi A1 sonrası).
Maliyet: stok finansmanı, fire/SKT, soğuk zincir, tahsilat operasyonu.
Rakip farkı: lot/SKT şeffaflığı, FEFO, cari disiplin, WhatsApp sipariş.
Çıktı: ekip/onay metni; CLAUDE.md ile çelişki yok.
```

### Alt-prompt C2: Marketplace erteleme sınırı

```
Block C2: 12-18 ay sonra marketplace açılırsa değişmeyecek M12.5 kilitler.
Liste: Dealer tek varlık, variantId sipariş satırı, sunucu sepeti, ledger append-only.
Supplier portal ayrı milestone; Producer tablosu marketplace satıcısı olmaz.
```

---

## BLOK D: Operasyonel eksikler

### Durum matrisi (kod analizi)

| Konu | Implemented | Partial | Missing | 90 gün |
|------|-------------|---------|---------|--------|
| SKT / lot / FEFO | `domain/inventory/fefo.ts`, çıkış kilidi, sevkiyat FEFO | Lot kartı "kg mevcut" = eldeki (expired dahil); `/bayi/firsatlar` fiyat düşmez | `FIRE`/`IMHA` hareketi, fire kg KPI, SKT iskonto | P0 fire + KPI düzelt |
| Sipariş FSM | `domain/order/state-machine.ts`, audit `OrderEvent`, test | Mock ONLINE ödeme | - | P0 |
| İade / hasar | - | Yasal metin, proforma | Return FSM, ters ledger, UI | P0 politika, P1 kod |
| Soğuk zincir | `Product.requiresColdChain`, `storageCondition` | `deliveryZoneCode` serbest metin | Checkout doğrulama, sıcaklık kaydı | P1 |
| Teslimat bölgesi | `Dealer.deliveryZoneCode`, `/bayi/teslimat` | - | Bölge×gün tablosu, min kamyon | P1 |
| Sevkiyat | `Shipment`, FSM, `/panel/sevkiyat` | İrsaliye no placeholder | e-İrsaliye | P2 |
| e-Fatura | Proforma PDF, `ProformaInvoice`, e-posta, slide-over | `InvoiceKind.E_FATURA` enum | Adapter, ödeme rozeti, vade, ledger FK | P1 |
| ERP export | - | - | Logo/Netsis/Mikro | P2 |
| Sanal POS | Mock provider | `Order.paymentMethod ONLINE` | Gerçek POS | P2 |
| KVKK | 5 yasal sayfa, form rızası, çerez banner | Statik TS içerik | CMS | P0 sürdür |
| Tarım Bakanlığı kayıt | - | - | Üretici/bayi belge alanı | P2 |
| WhatsApp | Outbox, template registry, mock/meta env | Meta adapter repoda yok | Prod Meta | P1 bildirim |
| Rotalar / ziyaret | - | Nav `soon` | `/panel/rotalar` ComingSoon | P2 |

### Alt-prompt D1: İade ve hasar

```
Block D1: B2B gıda iade politikası + OrderReturn entity.
Nedenler: HASARLI_TESLIMAT, YANLIS_URUN, KALITE, SKT_UYUMSUZ.
FSM: REQUESTED → APPROVED → RECEIVED → CREDITED (ledger ters BORC veya ODEME).
Lot geri alımı StockMovement ile.
UI: bayi sipariş detay "İade talebi"; panel onay.
Dosya: domain/order/returns.ts, prisma OrderReturn.
```

### Alt-prompt D2: Lojistik kuralları

```
Block D2: delivery/eligibility.ts (yeni).
Girdi: dealerZone, cartLines (requiresColdChain, kg), requestedDate.
Kurallar: kapalı günler, min sipariş tutarı kuruş veya min kg, soğuk zincir ayrı rota.
Checkout: /bayi/siparis validasyon mesajları TR.
Prisma: DeliveryZone, DeliverySchedule (zoneCode, dayOfWeek, minOrderKurus, coldChainOnly).
```

### Alt-prompt D4: SKT geçmiş lot ve fire (ekran kanıtı)

```
Block D4: Ekran: YG-BP17-TNK-B, SKT 15.08.2026 geçti, 85 kg mevcut, çıkış kapalı.
1) Lot kartı: "Sevk edilebilir" vs "SKT geçmiş eldeki" (kırmızı). Yeşil "mevcut" expired için yasak.
2) StockMovementType: FIRE (veya IMHA). assertNotExpired FIRE için uygulanmaz; not zorunlu (neden: imha, iade üretici, numune).
3) getInventoryDashboardSummary.totalKg = yalnızca !expired. Yeni metrik: expiredOnHandKg.
4) /panel/stok StatCard: Fire adayı kg.
5) İleride (M18, B1 ile): 14 gün kala fiyat düşüş kuralı; /bayi/firsatlar aynı formülü kullansın.
Test: expired CIKIS hâlâ hata; FIRE bakiyeyi sıfırlar; FEFO FIRE lotunu önermez.
Dosyalar: domain/inventory/fefo.ts, infra/db/inventory.ts, lot-manager.tsx, stock-board.tsx, schema enum.
```

### Alt-prompt D3: e-Belge sırası

```
Block D3: Entegrasyon sırası.
1) infra/e-invoice/ adapter interface + mock
2) Teslim sonrası e-Fatura tetik (idempotency key)
3) Shipment → e-İrsaliye
4) ERP CSV export (sipariş + cari)
Mevcut: panel/entegrasyonlar (WhatsApp, Resend, Analytics, e-Fatura yakında).
Env: GIB integrator placeholders in lib/env.ts.
Hostinger: Node runtime, secrets panel.
```

---

## BLOK E: İçerik ve yurt dışı (ertelenen)

### Kod analizi: Implemented (M14-M15 tamam)

- Blog/haber: `/haberler`, admin `/panel/icerikler`, RSS, Schema.org Article
- Reçete: `/tarifler`, `/panel/tarifler`, Schema.org Recipe
- SEO: sitemap index, robots, llms.txt, `/panel/seo` 301, consent-gated analytics
- Seed: 8 yazı, 4 tarif (`src/content/seed-posts.ts`)

### Stratejik kural (90 gün)

| Yap | Yapma |
|-----|-------|
| Mevcut SEO blog bakımı (1 kanal) | Podcast + fuar + marka yüzü aynı anda |
| WhatsApp sipariş bildirimi (1 kanal) | 4+ içerik kanalı paralel |
| Seed içerik güncelleme | Offshore şirket kurulumu |
| - | Yurt dışı operasyon kodu |

### Alt-prompt E1: İçerik takvimi

```
Block E1: M14-M15 mevcut çıktılara göre 12 haftalık plan (max 2 kanal).
Kanal 1: SEO blog (mevcut admin).
Kanal 2: WhatsApp template (sipariş durumu).
Her hafta: konu, Ciro hipotezi (direkt/indirekt/yok), saat tahmini.
"Dur" listesi: podcast, fuar standı, influencer, offshore.
```

---

## Panel modül envanteri (master prompt referansı)

| Route | Label | status | Not |
|-------|-------|--------|-----|
| `/panel/siparisler` | Siparişler | ready | KPI → `?gorunum=` filtre |
| `/panel/onay-kuyrugu` | Onay kuyruğu | ready | SUBMITTED, UNDER_REVIEW |
| `/panel/cari` | Cari | ready | Limit bar, manuel kayıt |
| `/panel/tahsilat` | Tahsilat | ready | Manuel ODEME |
| `/panel/fiyat-listeleri` | Fiyat listeleri | ready | SKU doldur feedback |
| `/panel/faturalar` | Faturalar | ready | Proforma slide-over (PDF, yeniden gönder); ödeme/vade yok |
| `/panel/stok` | Stok & lot | ready | FEFO + SKT kilit; fire yolu yok; totalKg expired içerir |
| `/panel/urunler/[slug]` | Ürün (stok sekmesi) | ready | Lot formu + expired rozeti |
| `/panel/entegrasyonlar` | Entegrasyonlar | ready | e-Fatura "Yakında" |
| `/panel/kampanyalar` | Kampanyalar | ready | Fiyata bağlı değil |
| `/panel/rotalar` | Rotalar | soon | ComingSoon |
| `/panel/ziyaretler` | Ziyaretler | soon | ComingSoon |

---

## Blok özeti

| Blok | Konu | İlk aksiyon |
|------|------|-------------|
| **C** | İş modeli | Kilitli: distribütör (onayla, değiştirme) |
| **A** | Tahsilat / risk | **A0 bug fix**, sonra A1 politika + aging UI |
| **B** | Fiyat / marj | B1 formül workshop; `domain/pricing/` oluştur |
| **D** | Operasyon | **D4 fire/SKT stok** (ekran kanıtı), D1 iade, D2 teslimat |
| **E** | İçerik | 2 kanal; offshore yok |

---

## Kod referansları (güncel)

```
src/domain/ledger.ts              → calculateBalance, canUseOnAccount
src/domain/order/state-machine.ts → sipariş FSM
src/domain/inventory/fefo.ts      → lot/SKT/FEFO (expired sevk yok)
src/infra/db/inventory.ts         → availableKg, totalKg (expired dahil)
src/components/admin/lot-manager.tsx → Yeni Lot, çıkış kilidi
src/components/admin/fatura-list.tsx → proforma slide-over
src/domain/proforma/index.ts      → PRF no, KDV split, gönderim kuralı
src/app/(dealer-portal)/bayi/firsatlar/ → yakın SKT liste, fiyat düşmez
src/domain/shipment.ts            → sevkiyat FSM
src/domain/whatsapp/templates.ts  → bildirim şablonları
src/infra/db/orders.ts            → exposure, CARI kontrol, DELIVERED→BORC
src/infra/db/ledger.ts            → cari CRUD
src/infra/db/pricing.ts           → fiyat listesi (domain/pricing değil)
src/infra/pdf/proforma-pdf.ts     → proforma; ticari maddeler genişletilecek
src/content/legal.ts              → KVKK, bayi sözleşmesi
src/app/(panel)/panel/cari/
src/app/(panel)/panel/tahsilat/
src/app/(panel)/panel/onay-kuyrugu/
src/app/(dealer-portal)/bayi/cari/
src/app/(dealer-portal)/bayi/siparis/
tests/unit/ledger.test.ts
tests/unit/order-fsm.test.ts
```

---

## Önerilen uygulama sırası (ürün + kod)

1. **A0** Ledger tutarlılık bug'ları
2. ~~**D4** SKT geçmiş lot~~ **yapıldı (bu oturum):** `FIRE`, KPI, kart kopyası. Diğer Cursor: `docs/cursor-handoff-a0-ledger.md`
3. **A1 + A3** Tahsilat prosedürü + aging; proforma slide-over'a ödeme/vade rozeti
4. **B1** Fiyat formülü; yakın SKT iskonto `/bayi/firsatlar` ile aynı kural
5. **D1** İade politikası
6. **B2 + domain/pricing** Override onay
7. **D3** e-Fatura adapter (proformayı e-belge diye büyütme)
8. **E1** İçerik 2 kanal (opsiyonel)

---

## Oğuz feedback eşlemesi (bug sprint dışı, backlog)

| Oğuz talebi | Master blok | Kod durumu |
|-------------|-------------|------------|
| Vade renk + 30-45 gün tahsilat | A1, A3 | Eksik |
| Çek/senet/vadeli + vade fiyatı | A2, B1 | Eksik |
| İade/değişim sekmesi | D1 | Eksik |
| Bayi tip ayrımı fiyat/limit | B2, A2 | Kısmen (DealerType var) |
| Onay kuyruğu kuralları | A0, B2 | Sipariş onayı var; kural/limit yok |
| Proforma tasarım | - | PDF şablon tamam; slide-over ödeme/vade eksik |
| SKT / bayatlayan stok | D4 | **Kodlandı (2026-08-19):** `FIRE` hareketi, fire adayı kg, sevk edilebilir KPI. Yakın SKT iskonto yok (M18). |

---

*Son güncelleme: 2026-08-19 (kod + panel ekran kanıtı). Bu belge ürün/AI prompt kaynağıdır; yasal metin yerine geçmez.*
