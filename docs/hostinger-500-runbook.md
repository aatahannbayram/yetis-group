# Hostinger 500: "Internal Server Error" sonrası ne yapılır

Site GitHub `main`'e push sonrası otomatik deploy oluyor (Hostinger Node.js Web App webhook).
Bazı deploy'lardan sonra site tamamen 500 verebiliyor (siyah ekran, sadece "Internal Server Error").
Bu doküman 2026-09-14'teki olayın kök nedenini ve tanı adımlarını kayıt altına alır.

## Önce bunu yapma

- **Hostinger panelinden "Çalışan işlemleri durdur" / restart tek başına işe yaramaz.**
  Süreç takılı değil, çöküyor (crash). Aynı bozuk build'i yeniden başlatmak aynı hatayı verir.
- Force push / hard reset yok. Önce kök nedeni bul.

## Tanı adımları

1. **Site gerçekten çöktü mü, yoksa tek route mu bozuk kontrol et:**
   ```bash
   curl -sI https://yetisgrup.com/
   curl -sI https://yetisgrup.com/api/health
   ```
   `/api/health` hiçbir şey yapmaz (`NextResponse.json({status:"ok"})`); DB'ye dokunmaz.
   Bu da 500 veriyorsa sorun belirli bir route/DB sorgusu değil, **Node process'in kendisi
   ayağa kalkmıyor** demektir.

2. **Hostinger'ın "Çalışma zamanı günlüğü" (runtime log) ekranına bak.**
   hPanel → Node.js uygulaması → Loglar. Buradaki gerçek stack trace, curl'den çok daha
   fazla bilgi verir. 2026-09-14 olayında curl sadece düz metin "Internal Server Error"
   gösteriyordu (Hostinger'ın hcdn edge'i origin'e ulaşamayınca bastığı jenerik sayfa);
   asıl hata yalnızca runtime log'da görünüyordu.

3. Runtime log'da şu hatayı ara:
   ```
   Error: Cannot find module '@swc/helpers/_/_interop_require_default'
   ```

## 2026-09-14 olayı: kök neden

`@swc/helpers`, Next.js'in kendi `package.json`'ında bağımlılık olarak tanımlı ama bizim
`package.json`'ımızda **doğrudan bağımlılık değildi** — sadece `next`'in transitive
bağımlılığı olarak `node_modules/.pnpm/@swc+helpers@.../` içinde duruyordu.

`scripts/prepare-swc-wasm.mjs` içindeki not zaten bunu işaret ediyor: Hostinger'ın build
sandbox'ı bazen `pnpm`'i düzgün çözemiyor ve kurulum farklı bir hoisting davranışına
düşüyor. Bu durumda Next'in derlenmiş çıktısının `require("@swc/helpers/...")` ile beklediği
üst-seviye `node_modules/@swc/helpers` sembolik bağı oluşmuyor. Sonuç: **her** request'te
(health check dahil) modül bulunamıyor, `uncaughtException` fırlıyor,
`src/instrumentation.ts` süreci `process.exit(1)` ile kapatıyor, Hostinger yeniden
başlatmaya çalışsa da (veya başlatmasa da) aynı bozuk `node_modules` ile aynı hatayı
tekrar üretiyor → sürekli 500.

## Uygulanan fix

`package.json`'a `next`'in kullandığı sürümle birebir aynı pin ile doğrudan bağımlılık eklendi:

```json
"@swc/helpers": "0.5.15"
```

Bu, hangi paket yöneticisi/hoisting davranışı kullanılırsa kullanılsın `@swc/helpers`'ın
proje kökü `node_modules/@swc/helpers` altına gelmesini garantiler — Next'in derlenmiş
kodunun `require()` ile aradığı yer tam olarak burası.

Commit: `4c5207d` — "Fix production 500: pin @swc/helpers as a direct dependency"

## Deploy sonrası elle kontrol listesi

1. Hostinger otomatik build/deploy'un bitmesini bekle (birkaç dakika sürebilir).
2. `curl -sI https://yetisgrup.com/` → `200`/`307` bekleniyor, `500` değil.
3. Runtime log'da yeni "Cannot find module" hatası **olmamalı**.
4. Eğer hâlâ 500 alıyorsan:
   - Runtime log'u tekrar oku — farklı bir hata mı (örn. `DATABASE_URL`, Prisma migration
     eksikliği) yoksa aynı `@swc/helpers` hatası mı tekrar mı ediyor.
   - Aynı hata tekrar ediyorsa Hostinger'ın eski build'i cache'lemiş/temizlememiş olabilir —
     "Clean install" / "Rebuild" seçeneğini dene (varsa), yoksa `node_modules`'ı
     temizleyip yeniden deploy tetiklemesini iste.
   - Prisma migration'ları prod DB'ye gitmiş mi kontrol et:
     ```bash
     DATABASE_URL="<prod-url>" pnpm prisma migrate status
     ```
     Eksikse: `DATABASE_URL="<prod-url>" pnpm prisma migrate deploy`
   - Hostinger env panelinde `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
     `APP_TIMEZONE` değerlerinin hâlâ doğru/eksiksiz olduğunu doğrula.

## Genel ders

Bu proje pnpm ile geliştiriliyor ama Hostinger'ın build ortamı pnpm'i her zaman güvenilir
şekilde çözemiyor (bkz. `scripts/prepare-swc-wasm.mjs` yorumu). Bu yüzden: **bir paketin
çalışma zamanında gerekli olduğu ama sadece bir üst bağımlılığın (`next`, vb.) transitive
bağımlılığı olarak geldiği her durumda**, o paketi doğrudan `package.json`'a eklemek,
farklı paket yöneticisi/hoisting davranışlarına karşı en ucuz sigorta.
