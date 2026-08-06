# Yetiş Grup — kurumsal görsel çekim briefi

Bu liste [`src/content/images.ts`](../src/content/images.ts) manifesto slotlarına karşılık gelir. Placeholder olanlar önceliklidir.

## Kurallar

- Bir fotoğraf yalnızca bir slotta kullanılır.
- Yatay (16:9 / 16:10) ve dikey (4:5 / 3:4) oranlara uyun.
- Stok yüz / jenerik market rafı yok; Yetiş ürünü, depo, soğuk alan veya saha.
- Renk: sıcak kemik zemin, marka yeşili (#30A369) aksesuar olarak; mor/pembe ışık yok.

## Placeholder slotlar (çekim önceliği)

| ID | Etiket | Konu | Oran | Not |
|----|--------|------|------|-----|
| stat-b | 04 | İkinci istatistik foto | 4/5 | Üretici veya ürün detay |
| stat-c | 05 | Üçüncü istatistik / süreç | 4/5 | Sevkiyat hazırlığı |
| process-siparis | 16 | Bayi sipariş / ekran | 16/10 | Eller + tablet veya katalog |
| about-sales | 18 | Satış yüzü | 4/5 | Plasiyer / bayi ziyareti |
| partner-kitchen | 21 | HORECA mutfak | 4/5 | SSS sol panel |
| news-hero | 24 | Haberler kapak | 16/9 | Tesis veya ürün hikâyesi |
| auth-side | 25 | Giriş yan görsel | 3/4 | Soft ürün still life |
| support-team | 26 | Destek ekibi | 1/1 | 2–3 kişi, doğal ışık |
| story-field | 27 | Kırsal alan | 16/10 | Çiftlik / mera atmosferi |

## Dolu slotlar (yenileme opsiyonel)

hero, about-producer, stat-a, cap-*, cat-*, offer-board, process-tedarik, process-sevkiyat, about-quality, about-ops, cta-final, contact-facility.

## Teslim

- JPEG veya WebP, uzun kenar ≥ 2000 px
- Dosya adı: slot id (örn. `partner-kitchen.jpg`)
- `images.ts` içinde `src` güncelle, `isPlaceholder: false` yap
- Manifest birim testi yeşil kalmalı
