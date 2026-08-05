# Yetiş Grup — B2B Sipariş & Yönetim Platformu

Bayilerin sipariş verdiği mağaza + Shopify/ikas kalitesinde yönetim paneli + WhatsApp Business Cloud API entegrasyonu.

**Müşteri:** Yetiş Grup (peynir & süt ürünleri, Türkiye)  
**Slogan:** Temiz Gıdaya Eriş, Sağlıklı Yetiş  
**Alıcılar:** market, şarküteri, HORECA, ara toptancı  
**Faz:** B2B only. B2C mimariyi bozmasın; bu fazda yazılmaz.

---

## Mimari kararlar

| Karar | Seçim | Neden |
|-------|--------|-------|
| Framework | Next.js App Router, TypeScript `strict` | Tek repo, SSR + Server Actions, tip güvenliği |
| Kaynak kontrolü | GitHub (tek repo) | Hostinger otomatik deploy tetikleyici |
| Hosting | Hostinger Node.js Web App | GitHub branch push → build + `next start` (`$PORT`) |
| Node | 20 LTS (Hostinger uyumlu) | 18/20/22/24; projede 20 kilitle |
| DB | PostgreSQL + Prisma | Decimal/para/ledger; Hostinger app ile ayrı Postgres URL |
| Auth | better-auth | Kendimiz yazmıyoruz; email/şifre + WhatsApp OTP eklentisi |
| UI | Tailwind + shadcn/ui + Lucide | Hızlı, tutarlı, erişilebilir |
| Tablolar | TanStack Table | Yoğun admin listeleri, satır seçimi, inline edit |
| Validasyon | Zod | API, form, env — tek şema dili |
| Test | Vitest (unit/domain) + Playwright (E2E) | Saf domain önce, UI sonra |
| Para | Integer kuruş, branded type, tek `money` modülü | Float yasak |
| Ağırlık | Prisma `Decimal`, kg 3 ondalık | Hassasiyet |
| Zaman | DB UTC; sunum `Europe/Istanbul` | Tek format modülü |
| i18n | Kod EN, UI TR, mesajlar dictionary | Sonraki diller için hazır |
| WhatsApp | Adapter arayüzü + mock provider (dev) | Gerçek API’ye dev’de bağlanma |
| Yetki | Tek `policy` modülü | Ekranlara dağılmaz |
| Domain | Framework bağımsız saf TS | Route/UI içinde iş mantığı yok |

### Katmanlar

```
app/                  → Next.js routes, Server Actions (ince adaptör)
components/           → UI (mağaza + admin shell)
domain/               → Saf iş kuralları (money, pricing, order FSM, FEFO, ledger…)
infra/                → Prisma, WhatsApp adapter, e-fatura adapter, storage
lib/                  → format, env, auth helpers, i18n
policies/             → Rol → aksiyon matrisi
```

Domain → infra’ya bağımlı olmaz. Infra domain tiplerini kullanır. UI domain fonksiyonlarını çağırır; Prisma satırlarını domain’e map’ler.

### Dağıtım (GitHub → Hostinger)

```
local → git push → GitHub (main veya production branch)
                 → Hostinger webhook: install → build → start -p $PORT
```

- Plan: Hostinger **Business** veya **Cloud** (Node.js Web App gerekli).
- hPanel: Websites → Add Website → Node.js → Import Git repository.
- Önerilen komutlar (pnpm Hostinger’da yoksa npm/ci fallback dokümante edilir):
  - Install: `npm ci` veya `pnpm install --frozen-lockfile` (Hostinger pnpm desteğine göre)
  - Build: `npm run build`
  - Start: `npm run start -- -p $PORT`
- Secrets yalnızca Hostinger env panelinde; repoya commit yok.
- `output: 'standalone'` değerlendirmesi M0’da Hostinger preset’ine göre; managed Node app genelde klasik `next start` ister.
- Edge/middleware kısıtları: Vercel-only API’lere bağlanma; standart Node runtime varsay.

**Postgres notu:** Hostinger paylaşımlı hosting çoğu zaman MySQL sunar. Bu proje **PostgreSQL zorunlu**. DB ya Hostinger VPS/managed Postgres, ya da harici Neon/Supabase/Railway Postgres; `DATABASE_URL` Hostinger app env’ine yazılır.

### Uygulama yüzleri

| Yüz | Path prefix | Kim |
|-----|-------------|-----|
| Bayi mağazası | `/` (veya `/store`) | Bayi rolleri |
| Yönetim paneli | `/admin` | Yetiş rolleri |
| Auth | `/auth` | Herkes |
| API / webhooks | `/api` | Sistem |

---

## Domain kuralları (pazarlık dışı)

1. **PARA** — Integer kuruş. Float yok. Branded type + `domain/money` + birim test.
2. **AĞIRLIK** — kg, 3 ondalık (`Decimal`). Üründe koli↔kg katsayısı.
3. **KDV** — Ürün bazlı oran alanı. Temel gıda çoğu zaman %1; sabit kodlama yok.
4. **FİYAT SNAPSHOT** — Sipariş satırına birim fiyat, iskonto, KDV oranı kopyalanır. Liste değişince geçmiş bozulmaz.
5. **CARİ** — Append-only ledger. Bakiye alanı yok; bakiyeyi ledger’dan türet. Düzeltme = ters kayıt.
6. **KREDİ LİMİTİ** — Açık siparişler limiti tüketir. Kontrol sipariş anında + onayda.
7. **LOT/SKT** — Her stok hareketi lota bağlı. Sevkiyat önerisi FEFO. SKT geçmiş lot sevk edilemez.
8. **SİPARİŞ FSM** — İzinli geçişler tek yerde. Her geçiş: kim / ne zaman / neden loglanır.
9. **TESLİMAT** — Bölge × gün kısıtı (soğuk zincir). Kapalı gün seçilemez.
10. **AUDIT** — Para, stok, fiyat, bayi durumu değişimleri loglanır.
11. **IDEMPOTENCY** — WhatsApp, e-Fatura, dış çağrılar idempotency key ile.

### Sipariş durum makinesi (özet)

```
draft → submitted → under_review → confirmed → preparing → shipped → delivered
                 ↘ rejected
confirmed → cancelled (kurallı)
```

Geçiş tablosu yalnızca `domain/order/state-machine.ts` içinde.

### Roller

**Bayi:** Yetkili · Satın Alma · Muhasebe · Depo  
**Yetiş:** Yönetici · Satış · Plasiyer · Muhasebe · Depo  

Policy örnekleri: `order:create`, `ledger:read`, `dealer:approve`, `whatsapp:reply`, …

### WhatsApp gerçekleri

- İşletme → müşteri: onaylı **template** zorunlu; template’ler kodda kayıtlı, versiyonlu, değişkenleri tipli.
- Müşteri yanıtından sonra serbest metin için hizmet penceresi; kapalıyken template’e düş.
- Webhook imza doğrulaması zorunlu; gelen olaylar idempotent.
- Her giden mesaj: **outbox** (status, attempts, provider response, cost alanları — fiyat sabitleme yok).
- Bayi opt-in/opt-out + mesaj tercihleri; KVKK rıza kaydı.
- Dev: mock provider + mesaj önizleme; gerçek Meta API yok.

---

## Tasarım tokenleri

### Renk

```css
--brand-500: #30A369;   /* vurgu / dolgu */
--brand-600: #008A43;   /* güçlü yeşil */
--brand-700: #00693E;   /* metin & birincil aksiyon — WCAG AA */

/* Yüzey — imza: sıcak kemik/krem (jenerik gri dashboard değil) */
--surface-canvas: #FAF8F3;
--surface-card: #FFFFFF;

/* Nötr 50–900 (sıcak eğilimli) — tokens.css’te tam skala */
/* Durum renkleri marka yeşilinden AYRI (success ≠ brand) */
--success, --warning, --danger, --info  /* ikon + etiket + renk */
```

### Tipografi

- Aile: **Inter** (tek)
- Sayısal: `tabular-nums` (kg, tutar, bakiye)
- Ölçek: `display` / `h1`–`h4` / `body-lg` / `body` / `body-sm` / `caption` / `mono-numeric`

### Form dili

- Spacing: 8pt grid
- Radius: 8 / 12 / 16 (kartlar 12)
- Gölge: yumuşak, katmanlı; ağır drop shadow yok
- Kenarlık: 1px, düşük kontrast

### Yoğunluk

| Mod | Kullanım |
|-----|----------|
| `comfortable` | Mobil, plasiyer |
| `compact` | Masaüstü tablo, hızlı sipariş |

Satır yüksekliği, padding, font token’ları ayrı.

### Ürün desenleri (zorunlu)

Command palette (⌘K) · Slide-over · Inline edit · Optimistic UI + skeleton · Toplu işlem barı · Kayıtlı görünümler · Kısayollar + `?` · Toast + undo · Anlamlı boş durumlar  

İkon: Lucide. Emoji yok. Stok foto yerine placeholder. WCAG 2.1 AA.

### Referans çıtası (taklit değil)

- Admin: Shopify Admin / ikas paneli kalitesi
- Mağaza: modern B2B commerce storefront

---

## Klasör yapısı (hedef)

```
/
├── CLAUDE.md
├── README.md
├── package.json
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (store)/          # bayi mağazası
│   │   ├── (admin)/admin/    # yönetim paneli
│   │   ├── (auth)/           # giriş, OTP, başvuru
│   │   └── api/              # webhooks, health
│   ├── components/
│   │   ├── ui/               # shadcn primitives
│   │   ├── store/
│   │   └── admin/
│   ├── domain/
│   │   ├── money/
│   │   ├── weight/
│   │   ├── pricing/
│   │   ├── order/
│   │   ├── ledger/
│   │   ├── inventory/        # FEFO, lot
│   │   └── whatsapp/         # template registry (tipli)
│   ├── infra/
│   │   ├── db/
│   │   ├── auth/
│   │   ├── whatsapp/         # adapter + mock + meta
│   │   └── e-invoice/        # adapter arayüzü
│   ├── policies/
│   ├── lib/
│   │   ├── env.ts
│   │   ├── format/           # para, tarih, kg — tek yer
│   │   └── i18n/
│   └── styles/
│       └── tokens.css
├── tests/
│   ├── unit/
│   └── e2e/
└── .github/workflows/ci.yml
```

Milestone ilerledikçe klasörler dolar; M0’da iskelet + token + auth.

---

## Milestone sırası

| ID | Kapsam | Çıkış kriteri |
|----|--------|----------------|
| **M0** | Repo, env, CI (GitHub Actions), tokenler, UI katmanı, auth, Hostinger deploy checklist | Lint/typecheck/unit CI yeşil; giriş çalışır; README’de Hostinger adımları |
| **M1** | Ürün, lot, stok hareketi | Domain + Prisma + test |
| **M2** | Bayi, kullanıcı, rol, üyelik kademesi | Policy + seed bayiler |
| **M3** | Fiyat listesi + kademeli iskonto motoru | Saf fonksiyon, kapsamlı Vitest |
| **M4** | Sipariş + FSM + kredi limiti | Snapshot + limit testleri |
| **M5** | Bayi mağazası UI (hızlı sipariş & sepet önce) | TR seed ile kullanılabilir |
| **M6** | Yönetim paneli UI | Pano + temel CRUD akışları |
| **M7** | Cari ledger + vade + mutabakat | Append-only, bakiye türetme |
| **M8** | Sevkiyat + irsaliye + FEFO | SKT engeli kanıtlı |
| **M9** | WhatsApp outbox, template, bildirimler | Mock + önizleme |
| **M10** | WhatsApp gelen kutusu + konuşmayla sipariş | Deep link sepet |
| **M11** | Fatura + e-Fatura adaptörü | Arayüz + mock |
| **M12** | Mobil plasiyer + çevrimdışı | Comfortable yoğunluk |

**Kural:** Bir milestone bitmeden diğerine geçilmez. Her milestone sonunda testler yeşil.

---

## Komutlar (M0 sonrası hedef)

```bash
pnpm install
pnpm dev                 # http://localhost:3000
pnpm db:migrate          # prisma migrate dev
pnpm db:seed             # gerçekçi TR ürün/bayi
pnpm test                # vitest
pnpm test:e2e            # playwright
pnpm lint
pnpm typecheck
pnpm build
```

Package manager: **pnpm** (CI ile kilitli).

---

## Yapma listesi

- Aynı anda 30 dosya / milestone atlama
- Para hesabında float; bakiyeyi mutable alanda tutma
- Auth’u sıfırdan yazma (better-auth kullan)
- Bu fazda D2C / son tüketici kodu
- Dev’de gerçek WhatsApp Meta API
- Jenerik gri admin teması (canvas `#FAF8F3` imza)
- İş mantığını route handler veya React komponentine gömme
- `any` tipi
- KDV / fiyat sabitleri hardcode
- SKT’si geçmiş lotu sevk etme yolu bırakma
- Fiyat snapshot’sız sipariş satırı
- Emoji; stok fotoğraf bağımlılığı
- Milestone bitmeden UI’ya “her şeyi” ekleme; seed’siz ekran

---

## Seed ilkesi

UI yazmadan önce gerçekçi Türkçe katalog: beyaz peynir 17 kg teneke, kaşar 1 kg vakum, tulum, lor, dilimli vb. KG fiyat, koli katsayısı, SKT/lot örnekleri.

---

## Ortam değişkenleri (şekil)

Zod ile `lib/env.ts` içinde doğrulanır. Örnek gruplar:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- `WHATSAPP_PROVIDER=mock|meta` (+ Meta alanları yalnızca prod/staging)
- `APP_TIMEZONE=Europe/Istanbul` (sunum; DB UTC)

---

## Dil

- Kaynak kod, commit, domain isimleri: **English**
- Kullanıcıya görünen metin: **Türkçe** (`lib/i18n`)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
