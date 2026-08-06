export type LegalDoc = {
  slug: string;
  title: string;
  updatedAt: string;
  summary: string;
  sections: { heading: string; paragraphs: string[] }[];
};

export const legalDocs: LegalDoc[] = [
  {
    slug: "kullanim-kosullari",
    title: "Kullanım Koşulları",
    updatedAt: "6 Ağustos 2026",
    summary:
      "Yetiş Grup B2B platformunun kullanımı, sipariş süreçleri ve hesap güvenliğine ilişkin genel kurallar.",
    sections: [
      {
        heading: "1. Taraflar ve kapsam",
        paragraphs: [
          "Bu Kullanım Koşulları; Yetiş Grup (“Yetiş”, “biz”) tarafından işletilen B2B sipariş, katalog, cari ve bildirim platformunun (“Platform”) ziyaretçileri ile kayıtlı bayi kullanıcıları (“Kullanıcı”) arasındaki ilişkiyi düzenler.",
          "Platform; market, şarküteri, HORECA ve ara toptancı işletmelerine yöresel/kırsal gıda tedariki için sipariş ve operasyon araçları sunar. Tüketiciye perakende satış pazaryeri değildir.",
        ],
      },
      {
        heading: "2. Hesap ve yetki",
        paragraphs: [
          "Bayi hesabı Yetiş satış ekibinin onayı ile açılır. Hesap bilgilerinin güncelliği ve şifre güvenliği Kullanıcıya aittir. Yetkisiz erişim şüphesinde Yetiş derhal bilgilendirilmelidir.",
          "Personel (STAFF) hesapları yalnızca Yetiş çalışanlarına aittir; bayi kullanıcıları yönetim paneline erişemez.",
        ],
      },
      {
        heading: "3. Sipariş, fiyat ve stok",
        paragraphs: [
          "Görünen fiyatlar, hesaba tanımlı fiyat listesine ve varsa kademe/kampanya kurallarına göre hesaplanır. Sipariş onaylandığında fiyat ve ürün bilgileri sipariş anındaki snapshot ile kilitlenir.",
          "Stok, lot ve SKT bilgileri Platform üzerinden izlenir; süresi dolmuş veya sevk edilemez lotlar için sipariş tamamlanamayabilir. Yetiş, teknik veya lojistik nedenlerle siparişi kısmen karşılama, erteleme veya iptal hakkını saklı tutar; bu durumda Kullanıcı bilgilendirilir.",
        ],
      },
      {
        heading: "4. Cari, kredi limiti ve ödeme",
        paragraphs: [
          "Kredi limiti ve cari bakiyesi Platform’da görüntülenebilir. Limit aşımı siparişin engellenmesine yol açabilir. Ödeme vadeleri, faturalama ve tahsilat ayrıca ticari/cari sözleşmeye tabidir.",
        ],
      },
      {
        heading: "5. Yasaklı kullanımlar",
        paragraphs: [
          "Platform’u tersine mühendislik, otomasyonla aşırı yükleme, başka bayi adına yetkisiz işlem, yanıltıcı sipariş veya mevzuata aykırı faaliyet için kullanmak yasaktır. İhlalde hesap askıya alınabilir.",
        ],
      },
      {
        heading: "6. Sorumluluk sınırı",
        paragraphs: [
          "Platform “olduğu gibi” sunulur. Kesintisiz erişim garanti edilmez. Yetiş’in Platform kaynaklı dolaylı zararlara ilişkin sorumluluğu, yürürlükteki zorunlu hukuki düzenlemeler saklı kalmak kaydıyla, ilgili sipariş tutarı ile sınırlıdır.",
        ],
      },
      {
        heading: "7. Değişiklikler ve iletişim",
        paragraphs: [
          "Yetiş bu koşulları güncelleyebilir; güncel metin Platform’da yayımlanır. Sorularınız için: info@yetisgrup.com",
        ],
      },
    ],
  },
  {
    slug: "bayi-uyelik-sozlesmesi",
    title: "Bayi Üyelik Sözleşmesi",
    updatedAt: "6 Ağustos 2026",
    summary:
      "Yetiş Grup B2B bayi hesabının açılması, kullanımı ve ticari ilişki çerçevesine dair sözleşme taslağı.",
    sections: [
      {
        heading: "1. Sözleşmenin konusu",
        paragraphs: [
          "İşbu Bayi Üyelik Sözleşmesi; Yetiş Grup ile onaylı bayi işletmesi (“Bayi”) arasında, Platform üzerinden katalog görüntüleme, sipariş oluşturma, sevkiyat bildirimi alma ve cari bilgilerini izleme hizmetlerinin sunulmasını konu alır.",
          "Üyelik, Yetiş’in ticari değerlendirmesi ve onayına bağlıdır. Onay sonrası Bayi’ye kullanıcı hesabı, fiyat listesi ve varsa kredi limiti tanımlanır.",
        ],
      },
      {
        heading: "2. Bayi beyanları",
        paragraphs: [
          "Bayi; verdiği ticari unvan, vergi/TCKN, adres ve yetkili kişi bilgilerinin doğru olduğunu; Platform’u yalnızca kendi işletmesi adına kullanacağını beyan eder.",
          "Bayi personeline verilen alt kullanıcı erişimlerinden Bayi sorumludur.",
        ],
      },
      {
        heading: "3. Sipariş ve teslim",
        paragraphs: [
          "Siparişler Platform üzerinden iletilir. Teslimat adresi, miktar ve ürün seçimi Bayi’nin sorumluluğundadır. Soğuk zincir gerektiren ürünlerde teslimat koşullarına uyum esastır.",
          "İade, fire, ayıp ve eksik teslimat süreçleri Yetiş’in yürürlükteki ticari politikası ve ilgili mevzuata göre yürütülür; Platform bildirimleri bu süreçleri destekler ancak tek başına hukuki sonuç doğurmaz.",
        ],
      },
      {
        heading: "4. Fiyat, fatura ve ödeme",
        paragraphs: [
          "Uygulanacak fiyat listesi Yetiş tarafından belirlenir ve değiştirilebilir. Değişiklikler yeni siparişlere yansır; onaylanmış siparişlerin snapshot fiyatı korunur.",
          "Fatura ve ödeme koşulları cari hesap sözleşmesi / sipariş onayı ile belirlenir. Gecikmiş ödemelerde Yetiş yeni siparişleri durdurabilir veya limiti düşürebilir.",
        ],
      },
      {
        heading: "5. Gizlilik ve rekabet",
        paragraphs: [
          "Bayi; fiyat listeleri, stok, lot, kampanya ve Platform işleyişine ilişkin bilgileri üçüncü kişilere Yetiş onayı olmadan açıklamaz. Bu yükümlülük üyelik sona erdikten sonra da makul süre devam eder.",
        ],
      },
      {
        heading: "6. Süre ve fesih",
        paragraphs: [
          "Üyelik süresizdir. Taraflardan her biri yazılı (e-posta dâhil) bildirimle üyeliği sona erdirebilir. Ağır ihlal, ödeme temerrüdü veya mevzuata aykırılık halinde Yetiş derhal askıya alma / fesih hakkına sahiptir.",
          "Fesih, doğmuş borç ve alacakları ortadan kaldırmaz.",
        ],
      },
      {
        heading: "7. Uygulanacak hukuk",
        paragraphs: [
          "Bu sözleşme Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda Yetiş’in ticaret merkezinin bulunduğu yer mahkemeleri ve icra daireleri yetkilidir; zorunlu tüketici hükümleri saklıdır (B2B ilişki esas alınır).",
        ],
      },
    ],
  },
  {
    slug: "gizlilik-politikasi",
    title: "Gizlilik Politikası",
    updatedAt: "6 Ağustos 2026",
    summary: "Yetiş Grup’un kişisel ve ticari verileri nasıl işlediğine dair özet politika.",
    sections: [
      {
        heading: "1. Topladığımız veriler",
        paragraphs: [
          "Hesap bilgileri (ad, e-posta, telefon), işletme bilgileri, sipariş ve sevkiyat kayıtları, cari hareketler, teknik loglar (IP, tarayıcı, oturum) ve destek yazışmaları işlenebilir.",
          "Platform’da işlenen verilerin çoğu ticari ilişki kapsamında olup KVKK anlamında kişisel veri niteliği taşıyan unsurlar ayrıca KVKK Aydınlatma Metni’nde açıklanır.",
        ],
      },
      {
        heading: "2. Kullanım amaçları",
        paragraphs: [
          "Veriler; siparişin kurulması ve ifası, faturalama, kredi riski yönetimi, lojistik, WhatsApp/e-posta bildirimleri, güvenlik, dolandırıcılık önleme ve yasal yükümlülükler için kullanılır.",
        ],
      },
      {
        heading: "3. Paylaşım",
        paragraphs: [
          "Veriler; yalnızca hizmet için gerekli ölçüde lojistik, ödeme/e-fatura, barındırma (ör. bulut veritabanı) ve bildirim sağlayıcılarıyla; yasal zorunluluk halinde yetkili mercilerle paylaşılabilir. Yetiş verileri satmaz.",
        ],
      },
      {
        heading: "4. Saklama ve güvenlik",
        paragraphs: [
          "Veriler, işleme amacının gerektirdiği süre ve yasal saklama süreleri boyunca tutulur. Erişim kontrolü, şifreleme ve günlük izleme gibi makul teknik/idari tedbirler uygulanır.",
        ],
      },
      {
        heading: "5. Haklarınız",
        paragraphs: [
          "Kişisel verilere ilişkin başvuru haklarınız için KVKK Aydınlatma Metni’ne ve info@yetisgrup.com adresine başvurabilirsiniz.",
        ],
      },
    ],
  },
  {
    slug: "kvkk-aydinlatma",
    title: "KVKK Aydınlatma Metni",
    updatedAt: "6 Ağustos 2026",
    summary:
      "6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) m.10 uyarınca aydınlatma metni.",
    sections: [
      {
        heading: "1. Veri sorumlusu",
        paragraphs: [
          "Veri sorumlusu: Yetiş Grup. İletişim: info@yetisgrup.com",
        ],
      },
      {
        heading: "2. İşlenen kişisel veriler",
        paragraphs: [
          "Kimlik ve iletişim (ad-soyad, e-posta, telefon), müşteri işlem (sipariş, sevkiyat, destek), işlem güvenliği (IP, log), finans (cari yetkili bilgileri) kategorilerinde veriler işlenebilir.",
        ],
      },
      {
        heading: "3. Amaç ve hukuki sebep",
        paragraphs: [
          "Sözleşmenin kurulması/ifası (KVKK m.5/2-c), hukuki yükümlülük (m.5/2-ç), meşru menfaat (güvenlik, risk yönetimi; m.5/2-f) ve açık rıza gerektiren hallerde rıza hukuki sebeplerine dayanılır.",
          "Amaçlar: bayi hesabı yönetimi, sipariş ve lojistik, bildirim, faturalama, uyuşmazlık çözümü, bilgi güvenliği.",
        ],
      },
      {
        heading: "4. Aktarım",
        paragraphs: [
          "Yurt içi/yurt dışı hizmet sağlayıcılara (barındırma, e-posta/WhatsApp bildirim altyapısı) KVKK’ya uygun güvencelerle aktarım yapılabilir.",
        ],
      },
      {
        heading: "5. Haklarınız (KVKK m.11)",
        paragraphs: [
          "Kişisel verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltme, silme/yok etme, itiraz ve zararın giderilmesini talep etme haklarınız vardır. Başvurularınızı info@yetisgrup.com üzerinden iletebilirsiniz.",
        ],
      },
    ],
  },
  {
    slug: "cerez-politikasi",
    title: "Çerez Politikası",
    updatedAt: "6 Ağustos 2026",
    summary: "Platform’da kullanılan çerez ve benzeri teknolojilere ilişkin bilgilendirme.",
    sections: [
      {
        heading: "1. Çerez nedir?",
        paragraphs: [
          "Çerezler; tarayıcınıza kaydedilen küçük metin dosyalarıdır. Oturum yönetimi, güvenlik ve tercihlerin hatırlanması için kullanılır.",
        ],
      },
      {
        heading: "2. Kullandığımız çerezler",
        paragraphs: [
          "Zorunlu çerezler: oturum (auth), güvenlik ve sepet/işlem sürekliliği için gereklidir; Platform’un çalışması bunlara bağlıdır.",
          "İşlevsel / analitik çerezler: deneyimi iyileştirmek için kullanılabilir. Zorunlu olmayan çerezler için mümkün olduğunca tercih sunulur.",
        ],
      },
      {
        heading: "3. Yönetim",
        paragraphs: [
          "Tarayıcı ayarlarından çerezleri silebilir veya engelleyebilirsiniz. Zorunlu çerezler engellenirse giriş ve sipariş işlevleri çalışmayabilir.",
        ],
      },
      {
        heading: "4. İletişim",
        paragraphs: [
          "Çerez politikası soruları için: info@yetisgrup.com",
        ],
      },
    ],
  },
];

export function getLegalDoc(slug: string) {
  return legalDocs.find((doc) => doc.slug === slug) ?? null;
}
