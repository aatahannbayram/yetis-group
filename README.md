# Yetiş Grup - B2B Sipariş & Yönetim Platformu

Bayilerin sipariş verdiği mağaza + yönetim paneli + WhatsApp Business Cloud API
entegrasyonu. Mimari kararlar, milestone sırası ve domain kuralları için
[`CLAUDE.md`](./CLAUDE.md) kaynaktır.

## Gereksinimler

- Node.js **20 LTS** (bkz. `.nvmrc`) - `nvm use`
- pnpm (bkz. `packageManager` alanı, `package.json`)
- PostgreSQL (yerelde Docker/Postgres.app, ya da Neon/Supabase/Railway)

## Başlarken

```bash
pnpm install
cp .env.example .env   # DATABASE_URL, BETTER_AUTH_SECRET vb. doldur
pnpm db:migrate
pnpm dev                # http://localhost:3000
```

## Komutlar

```bash
pnpm dev          # geliştirme sunucusu
pnpm build        # prod build
pnpm start        # prod sunucu ($PORT üzerinden)
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest (domain birim testleri)
pnpm test:e2e     # playwright
pnpm db:migrate   # prisma migrate dev
pnpm db:seed      # prisma/seed.ts
```

## Ortam değişkenleri

`src/lib/env.ts` içinde Zod ile doğrulanır. Tam liste ve açıklamalar için
[`.env.example`](./.env.example) dosyasına bakın:

| Değişken | Açıklama |
|---|---|
| `DATABASE_URL` | PostgreSQL bağlantı dizesi |
| `BETTER_AUTH_SECRET` | better-auth oturum imzalama anahtarı (min 32 karakter) |
| `BETTER_AUTH_URL` | Uygulamanın public base URL'i |
| `WHATSAPP_PROVIDER` | `mock` (dev/test) veya `meta` (staging/prod) |
| `APP_TIMEZONE` | Sunum saat dilimi (`Europe/Istanbul`); DB her zaman UTC |

## Hostinger'a dağıtım (GitHub → Hostinger)

```
local → git push → GitHub (main)
                 → Hostinger webhook: install → build → start -p $PORT
```

1. **Plan**: Hostinger **Business** veya **Cloud** plan (Node.js Web App desteği gerekir).
2. **hPanel**: Websites → Add Website → Node.js → *Import Git repository* ile bu repoyu bağla.
3. **Node sürümü**: Hostinger panelinde Node **20 LTS** seç (`.nvmrc` ile eşleşmeli).
4. **Komutlar** (Hostinger pnpm desteklemiyorsa npm fallback kullan):
   - Install: `pnpm install --frozen-lockfile` (yoksa `npm ci`)
   - Build: `pnpm build` (yoksa `npm run build`)
   - Start: `pnpm start` (yoksa `npm run start`) - `$PORT` Hostinger tarafından enjekte edilir.
5. **Ortam değişkenleri**: Hostinger hPanel → env panelinde tanımla. **Secrets repoya commit edilmez.**
6. **PostgreSQL notu**: Hostinger paylaşımlı hosting genelde MySQL sunar. Bu proje
   **PostgreSQL zorunlu** kılar - Hostinger VPS/managed Postgres ya da harici
   Neon/Supabase/Railway Postgres kullanıp `DATABASE_URL`'i Hostinger app env'ine yaz.
7. **Migration**: `pnpm db:migrate` (`prisma migrate dev`) yalnızca yerel geliştirme
   içindir. Prod'da deploy adımına `npx prisma migrate deploy` eklenmeli - bu repo
   otomatik migration çalıştırmaz, elle/CI adımıyla tetiklenir.
8. **Sağlık kontrolü**: `GET /api/health` → `{ "status": "ok" }`, deploy sonrası
   canlılık kontrolü için kullanılabilir.
9. **Edge/middleware kısıtı**: Vercel-only API'lere bağlanma; standart Node runtime
   varsay (`next start`, edge runtime yok).

## Test

```bash
pnpm test       # domain birim testleri (money, weight, ...)
pnpm test:e2e   # playwright (henüz senaryo yok - iskelet hazır)
```

CI (`.github/workflows/ci.yml`): lint → typecheck → unit test → build, her push/PR'da
`main` branch'e karşı çalışır.
