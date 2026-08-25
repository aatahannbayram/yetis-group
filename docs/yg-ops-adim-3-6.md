# Yetiş Grup Ops UI — Adım 3–6 (sıra planı)

Adım 1 (shell + DS) ve Adım 2 (Dashboard + Ana ekran) tamam. Mock veri; `/panel` ve `/bayi` dokunulmaz; Prisma bağlama yok.

## Sıra

| Adım | Admin `/yonetim` | Bayi `/portal` | Durum |
|------|------------------|----------------|--------|
| 1 | Shell + token + shared | Shell + mobil tabbar | done |
| 2 | Dashboard | Ana ekran | done |
| **3** | **Siparişler + lot/FEFO drawer** | **Katalog** | **done** |
| **4** | **Ürünler (liste + SKT)** | **Sepet + engeller** | **done** |
| **5** | **Bayiler + Fiyat listeleri** | **Siparişlerim + timeline** | **done** |
| **6** | **Sevkiyat + Cari + Rapor + Ayarlar** | **Cari + Talepler + Profil** | **done** |

## Adım 3 kapsamı

### Admin: `/yonetim/siparisler`
- PillTabs: Tümü / İncelemede / Onaylı / Hazırlık / Sevk
- DataTable: sipariş no, bayi, tarih, tutar, durum
- DetailDrawer (520px): satırlar (koli+kg), **FEFO lot önerisi** stub, Onayla / Reddet (ConfirmDialog)
- Ekranda en fazla 1 primary (Onayla)

### Bayi: `/portal/katalog`
- Arama + kategori PillTabs
- ProductCard grid + QtyStepper
- BlockingNotice (min / limit) + tek primary Sepete ekle
- CartDrawer stub (Adım 4’te derinleşir)

## Adım 4–6 (kısa)

- **4 Admin:** ürün tablosu, ExpiryBadge, stok kg  
- **4 Bayi:** `/portal/sepet` full engel akışı, onay CTA  
- **5 Admin:** bayi listesi + kredi, fiyat listesi tablosu  
- **5 Bayi:** sipariş listesi + OrderTimeline detay  
- **6 Admin:** sevkiyat panosu, cari özet, rapor placeholder, ayarlar  
- **6 Bayi:** cari ekstresi stub, talep formu stub, profil  

Her adım sonunda: gölge kuralı, tek primary, font ölçeği 12–24.

## Bilinçli dışı
- Auth, Prisma, gerçek WhatsApp/Meta
- Mevcut `/panel` / `/bayi` redesign
