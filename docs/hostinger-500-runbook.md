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

`@swc/helpers`, Next.js'in kendi `package.json`'ında bağımlılık olarak tanımlı. pnpm normalde
bunu `node_modules/.pnpm/@swc+helpers@.../` içine koyup gerektiği yerlere **symlink** olarak
bağlar (next'in kendi iç node_modules'ı dahil) — bu symlink'ler sayesinde Next'in derlenmiş
kodu `require("@swc/helpers/...")` ile bunu bulabiliyor, **local'de ve normal koşullarda**.

Hostinger her deploy'u yeni bir versiyon dizinine kopyalıyor
(`hbuilds/versions/<uuid>/nodejs/...`). Bu kopyalama adımı pnpm'in symlink yapısını sağlam
tutmuyor: `next`'in kendi `@swc/helpers` symlink'i (ki bu her zaman vardı, bizim
`package.json`'ımızda doğrudan bağımlılık olsun olmasın) kopyalama sonrası kırık/eksik
kalıyor. Sonuç: **her** request'te (health check dahil) modül bulunamıyor,
`uncaughtException` fırlıyor, `src/instrumentation.ts` süreci `process.exit(1)` ile
kapatıyor, yeniden başlayan process aynı bozuk kopyayla aynı hatayı tekrar üretiyor →
sürekli 500.

## Denenip işe yaramayan adımlar (öğretici, sırayla)

1. **`@swc/helpers`'ı `package.json`'a doğrudan bağımlılık olarak ekle** (commit `4c5207d`).
   Mantık: "belki sadece transitive bağımlılık olduğu için hoisting'e girmiyor." Yanlış
   çıktı — next zaten kendi `@swc/helpers`'ını symlink'liyordu, sorun *hangi* package.json'ın
   onu bağımlılık saydığı değil, symlink'in deploy kopyasında kırılmasıydı. Deploy sonrası
   runtime log'da **aynı hata birebir tekrar etti**.

2. **`.npmrc`'ye `node-linker=hoisted` ekle** (commit `65ee9e74`). Mantık: pnpm'i tamamen
   düz/symlink'siz `node_modules` üretmeye zorlamak, kopyalamanın kırabileceği hiçbir şey
   bırakmamak. Lokalde pnpm 9.15.9 ile doğrulandı, çalıştı. **Ama Hostinger'ın build günlüğü
   pnpm'i v11.9.0 olarak çalıştırdığını gösterdi** (`packageManager` alanımızdaki 9.15.9'u
   yoksayarak - "Corepack invoked pnpm with this version, and pnpm does not switch versions
   when running under corepack"). pnpm 11.9.0 ile lokalde tekrar test edildiğinde: proje
   `.npmrc`'sindeki `node-linker=hoisted` **sessizce yoksayılıyor** (`node_modules/@swc/helpers`
   yine symlink kalıyor). Yalnızca açık `--config.node-linker=hoisted` CLI bayrağı veya
   `PNPM_CONFIG_NODE_LINKER` ortam değişkeni işe yarıyor.

## Gerçek fix

Hostinger panelinde **Ortam Değişkenleri**'ne şu değişken eklendi:

```
PNPM_CONFIG_NODE_LINKER=hoisted
```

Sonra **Dağıtımlar → Ayarlar ve yeniden dağıtma → Kaydet ve yeniden dağıt** ile yeni bir
build tetiklendi. Bu build'in günlüğünde artık `@swc/helpers` hatası yok; site 200
dönüyor.

**Önemli:** Bu değişken repo'da değil, yalnızca Hostinger panelinde duruyor. Repo `.npmrc`
dosyası (`node-linker=hoisted`) kalsın — zararsız, ve pnpm'in gelecekte bu ayarı `.npmrc`'den
okuyacağı bir sürüme dönmesi ihtimaline karşı belgeleyici. Ama **asıl etkili olan Hostinger
ortam değişkenidir.** Website silinip yeniden oluşturulursa veya bu değişken yanlışlıkla
silinirse, sorun aynen geri gelir.

Commit'ler: `4c5207d`, `65ee9e74` (ikisi de gerekli zemin ama tek başına yetersizdi),
gerçek düzeltme Hostinger panelinde (`PNPM_CONFIG_NODE_LINKER=hoisted` ortam değişkeni).

## Deploy sonrası elle kontrol listesi

1. Hostinger otomatik build/deploy'un bitmesini bekle (birkaç dakika sürebilir).
2. `curl -sI https://yetisgrup.com/` → `200`/`307` bekleniyor, `500` değil.
3. Runtime log'da yeni "Cannot find module" hatası **olmamalı**.
4. Eğer hâlâ 500 alıyorsan:
   - Önce Hostinger panelinde **Ortam Değişkenleri**'nde `PNPM_CONFIG_NODE_LINKER=hoisted`
     hâlâ duruyor mu kontrol et (silinmiş/kaybolmuş olabilir).
   - Runtime log'u tekrar oku — farklı bir hata mı (örn. `DATABASE_URL`, Prisma migration
     eksikliği) yoksa aynı `@swc/helpers` hatası mı tekrar mı ediyor.
   - Aynı `@swc/helpers` hatası tekrar ediyorsa: env değişkeni ekli olsa bile yeni bir build
     tetiklenmemiş olabilir — sadece env değişkeni eklemek deploy'u tetiklemez, **Dağıtımlar
     → Ayarlar ve yeniden dağıtma → Kaydet ve yeniden dağıt** ile açıkça yeni bir build
     başlatmak gerekir.
   - Prisma migration'ları prod DB'ye gitmiş mi kontrol et:
     ```bash
     DATABASE_URL="<prod-url>" pnpm prisma migrate status
     ```
     Eksikse: `DATABASE_URL="<prod-url>" pnpm prisma migrate deploy`
   - Hostinger env panelinde `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
     `APP_TIMEZONE` değerlerinin hâlâ doğru/eksiksiz olduğunu doğrula.

## Genel ders

Bu proje pnpm ile geliştiriliyor ama Hostinger'ın build ortamı hem `packageManager` alanımızda
kilitlediğimiz pnpm sürümünü yoksayıp kendi sürümünü (bu olayda v11.9.0) kullanıyor, hem de
proje `.npmrc`'sindeki bazı ayarları (en azından `node-linker`) sessizce yoksayabiliyor.
Repo içi dosyalarla (`.npmrc`, `package.json`) Hostinger'ın build davranışını değiştirmeye
güvenme — **doğrulanmış, çalışan tek yol Hostinger'ın kendi Ortam Değişkenleri panelinden
`PNPM_CONFIG_*` / `npm_config_*` türü env değişkenleri geçmek.** Yeni bir "pnpm ayarı
değiştirmem lazım" ihtiyacı çıkarsa, önce lokalde Hostinger'ın kullandığı pnpm sürümüyle
(`corepack pnpm@<sürüm> install`) test et, `.npmrc`'nin gerçekten okunduğunu varsayma.
