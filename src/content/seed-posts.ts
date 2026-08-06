// Seed content for blog/reçete alanları (M14). Statik veri; DB seed script'i tarafından okunur.
// relatedProductSlugs alanları prisma/seed.ts içindeki ProductVariant.slug değerleriyle eşleşmelidir.

export type SeedPost = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  coverUrl: string;
  relatedProductSlugs: string[];
  body: string;
};

export type SeedRecipe = {
  title: string;
  slug: string;
  excerpt: string;
  coverUrl: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  ingredients: { name: string; amount: string; unit: string; productSlug?: string }[];
  steps: string[];
  tips: string;
  relatedProductSlugs: string[];
};

export const seedPosts: SeedPost[] = [
  {
    title: "Restoranlar için gerçek food cost nasıl hesaplanır?",
    slug: "restoran-food-cost-nasil-hesaplanir",
    excerpt:
      "Food cost yüzdesini menü fiyatından değil, gerçek stok hareketinden hesaplamanın formülü, peynir ve süt ürünlerinde gizli maliyet kalemleri ve düşürme yöntemleri.",
    category: "Maliyet Yönetimi",
    tags: ["food cost", "restoran", "maliyet", "HORECA", "menü mühendisliği"],
    coverUrl: "/products/kasar.jpg",
    relatedProductSlugs: ["kasar-peyniri-1kg-vakum", "tulum-peyniri-800g"],
    body: `Gerçek food cost, dönem başı stok değerine dönem içi alımları ekleyip dönem sonu stok değerini çıkararak bulunan tutarın net satışa bölünmesiyle hesaplanır: (Başlangıç stok + Alımlar - Bitiş stok) / Net satış x 100. Bu formülü uygulamayan işletmeler, sadece reçete maliyetine bakıp gerçek kârlılığı görmeden fiyatlandırma yapar; fire, çalınma, porsiyon sapması ve stok bozulması bu tabloda gizli kalır.

## Food cost formülünü doğru kurmak

Reçete bazlı "teorik food cost" ile envanterden hesaplanan "gerçek food cost" arasındaki fark, bir mutfağın en kritik performans göstergesidir. Teorik hesap, her tabağın standart reçetesindeki gramaj üzerinden yapılır; gerçek hesap ise fiili stok hareketinden çıkar. İki rakam arasında %3-5 puandan fazla fark varsa, sorun ya porsiyon kontrolünde ya da tedarik zincirinde aranmalıdır.

Doğru hesap için üç şart var: dönemsel sayım disiplini (haftalık, süt ürünlerinde ideali), her alımın fatura ve irsaliye ile stok sistemine işlenmesi, ve reçetelerin güncel birim fiyatlarla (KDV hariç, net) tutulması. Yetiş Grup'tan alınan siparişlerde her sipariş satırına birim fiyat, iskonto ve KDV oranı anında kaydedilir; bu sayede food cost hesaplamasında kullanılacak veri manuel fatura taramasına değil, sipariş geçmişine dayanır.

## Peynir ve süt ürünlerinde gizli maliyet kalemleri

Peynir ve süt ürünleri, restoran food cost'unda en çok yanılgıya yol açan kalemlerdir çünkü randıman (kullanılabilir kısım oranı) ürün formuna göre ciddi değişir:

- **Blok kaşar** dilimlemede %3-6 fire verir; önceden dilimli kaşar alan işletmeler bu fireyi tedarikçiye devreder ve gerçek maliyeti sabitler.
- **17 kg teneke beyaz peynir** açıldıktan sonra salamura kaybı ve kırılma nedeniyle ilk haftalarda daha yüksek fire gösterir; teneke başına porsiyon sayısını gerçek tartımla doğrulamak gerekir.
- **Tulum peyniri** kabuk kaybı ve nem kaybı nedeniyle randımanı en değişken üründür; menüde sabit porsiyon gramajı belirleyip düzenli tartım yapılmalı.
- Soğuk zincirde bekleme süresi uzadıkça küf ve kuruma kaynaklı zayiat artar; bu da food cost'u reçeteden bağımsız şekilde şişirir.

Bu kalemleri gerçek food cost'a dahil etmeyen işletmeler, kâğıt üzerinde kârlı görünen bir menüyle ay sonunda negatif marjla karşılaşabilir.

## Tedarikçi seçiminin food cost'a etkisi

Birim fiyat tek başına food cost'u belirlemez; teslimat sıklığı, lot/SKT şeffaflığı ve iade politikası da toplam maliyeti etkiler. Sık ve küçük hacimli teslimat alabilen bir restoran, büyük stok tutmak zorunda kalmadığı için sermaye maliyetini ve fire riskini düşürür. FEFO (ilk giren ilk çıkar SKT sırası) uygulayan bir tedarikçiyle çalışmak, mutfakta manuel SKT takibi yükünü azaltır ve süresi yaklaşan ürünün menüde öne çıkarılmasını mümkün kılar.

Fiyat listesi ve kademeli iskonto yapısı olan bir tedarikçi seçmek, hacim arttıkça birim maliyetin öngörülebilir şekilde düşmesini sağlar. Bu, yıllık bütçe planlamasında food cost hedefinin sabit tutulmasına yardımcı olur.

## Menü mühendisliği ile food cost optimizasyonu

Food cost'u düşürmenin en sürdürülebilir yolu, sadece daha ucuz ürün aramak değil, menüyü maliyet ve popülerliğe göre sınıflandırmaktır. "Yıldız" ürünler (yüksek marj, yüksek satış) menüde öne çıkarılır; "bulmaca" ürünler (yüksek marj, düşük satış) pazarlanır; "köpek" ürünler (düşük marj, düşük satış) menüden çıkarılır veya reçetesi revize edilir.

Peynir ağırlıklı tabaklarda (pizza, kahvaltı tabağı, mezze) gramaj standardizasyonu tek başına food cost'u 2-3 puan düşürebilir. Standart bir porsiyon kaşarı gramla değil, önceden tartılmış paketlerle mutfağa vermek, aşçının göz kararı ölçümünden kaynaklanan sapmayı ortadan kaldırır.

## Food cost'u haftalık izlemek neden fark yaratır

Çoğu işletme food cost'u yalnızca ay sonunda, muhasebe kapanışıyla birlikte hesaplar. Bu yaklaşımın sorunu, bir sapma tespit edildiğinde zararın çoktan oluşmuş olmasıdır. Haftalık spot kontrol yapan işletmeler ise sorunu erken yakalar ve düzeltici aksiyonu (porsiyon eğitimi, tedarikçi görüşmesi, reçete revizyonu) daha az kayıpla uygulayabilir.

Pratik bir haftalık izleme sistemi şu üç veriyi karşılaştırır: o hafta alınan hammadde tutarı, o hafta yapılan net satış ve teorik reçete maliyetine göre beklenen food cost. Üç rakam arasındaki tutarsızlık, hangi tabakta veya hangi vardiyada sorun olduğuna dair erken sinyal verir. Özellikle peynir gibi yüksek birim değerli ve yüksek fire riskli kalemlerde bu haftalık disiplin, ay sonu sürprizlerini büyük ölçüde azaltır.

## Personel eğitiminin food cost üzerindeki etkisi

Reçete ve tedarik ne kadar iyi planlanırsa planlansın, mutfakta fiili uygulama personelin elindedir. Yeni başlayan bir aşçı, standart gramajı öğrenene kadar %10-15 fazla malzeme kullanabilir; bu sapma, özellikle peynir gibi pahalı kalemlerde food cost'u hızla şişirir. Düzenli porsiyon kontrolü (tartılı denetim), görsel referans kartları (bir porsiyonun fotoğrafı ve gram bilgisi mutfakta asılı) ve yeni personel için kısa bir "standart porsiyon" oryantasyonu, bu sapmayı azaltmanın en düşük maliyetli yollarıdır. Bazı işletmeler ayrıca vardiya bazlı food cost karşılaştırması yaparak hangi ekibin standarda daha yakın çalıştığını görünür kılar; bu da hem eğitim ihtiyacını hem de iyi uygulamaları ödüllendirme fırsatını ortaya çıkarır.

## Sık sorulan sorular

### Food cost yüzdesi kaç olmalı?

Sektöre göre değişir; klasik restoranlarda %28-35, pizza ve fast-casual işletmelerde %25-30, otel kahvaltısı gibi büfe formatlarında ise porsiyon kontrolü zor olduğu için %30-38 aralığı sık görülür. Önemli olan mutlak rakam değil, hedef ile gerçekleşen arasındaki tutarlılıktır.

### Teorik ve gerçek food cost arasındaki fark neden önemli?

Bu fark, kayıp noktasını gösterir. Fark büyükse sorun ya porsiyon kontrolünde, ya fire yönetiminde ya da tedarik/teslim alma sürecindeki sayım hatalarındadır; sorunu görmeden çözüm üretilemez.

### Süt ürünlerinde fire oranı nasıl azaltılır?

Doğru SKT rotasyonu, uygun soğuk zincir sıcaklığı (2-4°C), açılmış ambalajın sıkı kapatılması ve büyük blok yerine ihtiyaca uygun gramajlı ürün tercih etmek fireyi belirgin şekilde azaltır.

### Food cost hesaplamasını hangi sıklıkla yapmalıyım?

Aylık resmi sayım şart, ancak süt ürünleri gibi hızlı bozulan kalemlerde haftalık spot sayım, sorunu ay sonunu beklemeden tespit etmeyi sağlar.

Food cost'unuzu gerçek verilerle yönetmek istiyorsanız, blok kaşar, dilimli kaşar ve tulum peyniri gibi randımanı öngörülebilir ürünlerle başlamak iyi bir adımdır. Yetiş Grup'un bayi mağazasında sabit fiyat listesi, lot/SKT şeffaflığı ve düzenli teslimat ile food cost hesaplarınızı sağlam bir zemine oturtabilirsiniz. HORECA işletmeniz için bayi başvurusunu /auth üzerinden birkaç dakikada tamamlayabilirsiniz.`,
  },
  {
    title: "Toptan peynir alırken sorulması gereken 7 soru",
    slug: "toptan-peynir-alirken-7-soru",
    excerpt:
      "Toptan peynir tedarikçisi seçerken fiyat dışında sorulması gereken 7 kritik soru: SKT, lot takibi, soğuk zincir, randıman, iade politikası ve daha fazlası.",
    category: "Satın Alma",
    tags: ["toptan peynir", "tedarikçi seçimi", "B2B", "satın alma"],
    coverUrl: "/products/beyaz-peynir.jpg",
    relatedProductSlugs: ["beyaz-peynir-17kg-teneke", "dilimli-kasar-250g", "lor-peyniri-1kg"],
    body: `Toptan peynir alırken sorulması gereken en önemli 7 soru şunlardır: SKT ve lot takibi nasıl yapılıyor, soğuk zincir nasıl garanti ediliyor, fiyat listesi ve kademeli iskonto nasıl işliyor, minimum sipariş miktarı ve teslimat sıklığı ne, randıman/kalite tutarlılığı nasıl sağlanıyor, iade ve hasar politikası ne, ve son olarak referans/güven kaydı var mı. Bu sorulara net cevap alamadığınız bir tedarikçi, kısa vadede ucuz görünse bile uzun vadede fire ve güvensizlik maliyeti çıkarır.

## 1. SKT ve lot takibi nasıl yapılıyor?

Her peynir partisi bir üretim lotuna ve son kullanma tarihine bağlı olmalı. Ciddi bir tedarikçi, hangi lotun hangi tarihte üretildiğini, hangi depoda beklediğini ve SKT'sine ne kadar süre kaldığını sipariş anında gösterebilmelidir. Lot takibi olmayan bir tedarikçiden alınan ürün, raftan rastgele seçilir; bu da bazen SKT'si çok yakın, bazen de çok taze ürünün karışık gelmesine yol açar. FEFO (First Expired, First Out) prensibiyle sevkiyat yapan tedarikçiler, işletmenizin kendi stok rotasyonunu kolaylaştırır.

## 2. Soğuk zincir nasıl garanti ediliyor?

Peynir ve süt ürünleri 2-4°C aralığında taşınmalı; bu aralığın kısa süreli de olsa kırılması ürün kalitesini ve raf ömrünü doğrudan etkiler. Sorulması gereken somut noktalar: araçlarda sıcaklık kayıt sistemi var mı, teslimat sırasında sıcaklık kontrolü yapılıyor mu, depoda ürün bekleme süresi ne kadar. Sözlü "soğuk zincire uyuyoruz" cevabı yeterli değildir; kayıt ve doğrulama mekanizması sorulmalı.

## 3. Fiyat listesi ve kademeli iskonto nasıl işliyor?

Sabit ve şeffaf bir fiyat listesi olmayan tedarikçilerde her sipariş pazarlık konusu olur; bu da bütçe planlamasını imkânsızlaştırır. Hacim arttıkça birim fiyatın nasıl düştüğünü (kademeli iskonto), kampanya ve sözleşmeli fiyat farkını net olarak öğrenin. Sipariş onaylandığında fiyatın sabitlenip sabitlenmediği (fiyat snapshot) de önemlidir; liste fiyatı değişse bile geçmiş siparişinizin etkilenmemesi gerekir.

## 4. Minimum sipariş miktarı ve teslimat sıklığı ne?

Küçük ve orta ölçekli bir işletme için yüksek minimum sipariş tutarı, gereksiz stok tutmaya ve fireye yol açar. Haftada kaç gün teslimat yapıldığı, acil sipariş durumunda ek teslimat imkânı olup olmadığı ve teslimat bölgesi/gün kısıtları netleştirilmeli. Soğuk zincir ürünlerde kapalı gün veya uzun teslimat aralığı, stok planlamanızı zorlaştırır.

## 5. Randıman ve kalite tutarlılığı nasıl sağlanıyor?

Aynı SKU'nun her partisi benzer tuz oranında, benzer kıvamda ve benzer randımanda gelmelidir. Üretici/menşei bilgisi (hangi bölge, hangi süt tipi: inek/koyun, hangi olgunlaşma seviyesi) paylaşılabiliyorsa, bu tutarlılığın izlenebilir bir kaynağı olduğunu gösterir. Yöresel ürünlerde (tulum, kaşar) bölge ve süt tipi bilgisi, menü tanıtımında da kullanılabilecek bir hikâye sunar.

## 6. İade ve hasar politikası ne?

Taşıma sırasında hasar gören, SKT'si beklenenden kısa çıkan veya sipariş hatası olan ürünlerde net bir iade/değişim süreci olmalı. Bu politika yazılı ve önceden bilinir olmalı; teslimat anında "biz hallederiz" gibi belirsiz cevaplar, sorun çıktığında işletmeyi mağdur bırakır.

## 7. Referans ve güven kaydı var mı?

Kaç yıldır faaliyette olduğu, hangi ölçekte işletmelere (market, şarküteri, HORECA, toptancı) tedarik yaptığı ve varsa mevcut bayi/müşteri referansları, tedarikçinin operasyonel olgunluğu hakkında fikir verir. Yeni kurulan ve süreçleri henüz oturmamış bir tedarikçiyle çalışmak, özellikle kritik dönemlerde (bayram, yoğun sezon) risklidir.

## Bonus: sözleşme ve ödeme koşullarını da netleştirin

Yukarıdaki 7 sorunun dışında, uzun vadeli bir tedarik ilişkisi kurarken ödeme vadesi ve cari hesap işleyişi de gözden kaçırılmamalıdır. Açık hesap (vadeli ödeme) çalışan işletmelerde bakiyenin nasıl takip edildiği, ödemelerin ledger'a (hareket kaydına) nasıl yansıdığı ve olası bir uyuşmazlıkta düzeltme kaydının nasıl yapıldığı önceden sorulmalı. Bakiyeyi sabit bir alanda tutan değil, her hareketi kayıt altına alan (append-only) bir cari sistemine sahip tedarikçiler, uyuşmazlık durumunda geriye dönük inceleme yapılmasını kolaylaştırır.

Ayrıca kredi limiti uygulaması olan tedarikçilerde bu limitin nasıl belirlendiği ve zamanla nasıl güncellendiği de sorulmalı; özellikle sezonluk talep artışlarında (yaz ayları, bayram dönemleri) limitin yetersiz kalması sipariş sürecini aksatabilir.

## Küçük bir kontrol listesi ile hızlı karşılaştırma

Birden fazla tedarikçi teklifini karşılaştırırken aşağıdaki gibi basit bir kontrol listesi kullanmak kararı hızlandırır: birim fiyat ve kademeli iskonto tablosu var mı, SKT/lot bilgisi sipariş anında görünüyor mu, soğuk zincir kaydı paylaşılıyor mu, minimum sipariş tutarı işletme hacmine uygun mu, iade politikası yazılı mı, ödeme vadesi ve cari takip şeffaf mı. Bu altı maddeye net "evet" cevabı alınan bir tedarikçi, uzun vadeli bir iş ortaklığı için sağlam bir temel sunar.

## Sık sorulan sorular

### Toptan peynir alırken en çok yapılan hata nedir?

Sadece kilogram fiyatına bakıp SKT, soğuk zincir ve randıman gibi gizli maliyet kalemlerini göz ardı etmek en yaygın hatadır. Ucuz görünen bir ürün, yüksek fire nedeniyle sonunda daha pahalıya gelebilir.

### Lot takibi olmayan bir tedarikçiyle çalışmak ne gibi riskler taşır?

SKT'si yakın ürünlerin fark edilmeden stoklanması, geri çağırma (recall) durumunda etkilenen partinin tespit edilememesi ve hijyen/kalite şikâyetlerinde kaynağın bulunamaması başlıca risklerdir.

### Kademeli iskonto ne zaman devreye girer?

Genelde aylık veya siparişe bağlı hacim eşiklerine göre işler; örneğin belirli bir kilogram üzerindeki siparişlerde birim fiyat otomatik olarak düşer. Bu yapı, tedarikçiden tedarikçiye değişir ve önceden yazılı olarak netleştirilmelidir.

### Yeni bir tedarikçiye geçerken nasıl test yapmalıyım?

Küçük hacimli bir deneme siparişiyle başlayıp SKT, soğuk zincir ve ambalaj kalitesini gözlemlemek, ardından hacmi kademeli olarak artırmak en güvenli yoldur.

Bu 7 soruyu netleştirdikten sonra ürün seçimine geçebilirsiniz: 17 kg teneke tam yağlı beyaz peynir hacimli kullanım için, dilimli kaşar peyniri hızlı servis için, lor peyniri ise mezze ve tatlı reçeteleri için değerlendirilebilir. Yetiş Grup'ta tüm bu sorulara sipariş öncesi net cevap bulabilir, bayi mağazasında sabit fiyat listesi ve lot bazlı SKT bilgisiyle sipariş verebilirsiniz. Bayi başvurusu için /auth sayfasını ziyaret edebilirsiniz.`,
  },
  {
    title: "Pizzada eriyen peynir seçimi nasıl yapılır?",
    slug: "pizzada-eriyen-peynir-secimi",
    excerpt:
      "Pizzada doğru erime, çekme (stretch) ve renk için peynir seçimi: kaşar peyniri türleri, karışım oranları, fırın sıcaklığı ilişkisi ve maliyet dengesi.",
    category: "Ürün Bilgisi",
    tags: ["pizza", "kaşar peyniri", "eriyen peynir", "restoran"],
    coverUrl: "/products/kasar.jpg",
    relatedProductSlugs: ["kasar-peyniri-1kg-vakum", "dilimli-kasar-250g"],
    body: `Pizzada doğru peynir seçimi, yağ oranı yüksek ve nem dengesi doğru bir kaşar tipi ile yapılır; bu sayede peynir fırında hem düzgün erir hem de karakteristik "çekme" (stretch) özelliğini gösterir. Türkiye'de pizzacıların büyük kısmı taze mozzarella yerine bloktan rendelenen olgun kaşar peynirini tek başına veya karışım halinde kullanır çünkü kaşar hem maliyet hem de fırın performansı açısından daha öngörülebilirdir.

## Erime, çekme ve renk: üç kritik özellik

Bir peynirin pizza performansı üç kriterle değerlendirilir: erime hızı (fırın sıcaklığına ne kadar hızlı tepki verdiği), çekme/streç özelliği (dilimlendiğinde tel tel uzayabilmesi) ve kızarma rengi (üzerinde oluşan altın-kahverengi lekelerin dengesi). Yağ oranı düşük, kuru peynirler erimede zorlanır ve lastik gibi kalır; yağ oranı çok yüksek peynirler ise fazla yağ bırakıp hamuru ıslatabilir.

Olgun kaşar peyniri, orta-yüksek yağ oranı ve dengeli protein yapısı sayesinde bu üç kriteri birden karşılar. Blok kaşar, rendelendiğinde geniş yüzey alanı kazanır ve fırında daha homojen erir; bu nedenle pizzacıların çoğu blok kaşarı kendi mutfağında rendeler.

## Blok mu, dilimli mi: hangi format hangi işletmeye uygun?

- **Blok kaşar (3 kg)**: Yüksek hacimli pizzacılar ve zincir işletmeler için idealdir; kendi rendeleme ekipmanı olan mutfaklarda birim maliyeti düşürür, porsiyon gramajını esnek tutar.
- **Dilimli kaşar (1 kg)**: Küçük ölçekli işletmelerde, hızlı servis noktalarında veya rendeleme ekipmanı olmayan mutfaklarda pratiklik sağlar; israf az olur çünkü paket açıldığında hemen kullanılabilir.

Hacimli pizza üretimi yapan bir işletme için blok kaşar birim maliyeti düşürürken, günlük düşük adetli bir kafeterya için dilimli kaşar operasyonel kolaylık sunar.

## Karışım oranı ve fırın sıcaklığı ilişkisi

Ticari pizza fırınları genelde 280-320°C arasında çalışır; bu sıcaklıkta kaşar peyniri 4-6 dakika içinde optimum erime noktasına ulaşır. Taş fırında daha yüksek sıcaklıklarda (400°C üzeri, Napoliten stil) pişirme süresi 90 saniyeye kadar düşebilir; bu durumda peynirin çok ince rendelenmesi ve fazla kalın tabaka olmaması gerekir, aksi halde peynir dışı yanarken içi erimeden kalabilir.

Bazı işletmeler kaşara ek olarak az miktarda daha yağlı bir peynir (örneğin taze kaşar veya beyaz peynir karışımı) ekleyerek renk ve tat çeşitliliği sağlar; ancak beyaz peynirin tuz oranı yüksek olduğundan karışım oranı %10-15'i geçmemelidir, aksi halde pizza aşırı tuzlu olur.

## Maliyet ve porsiyon standardizasyonu

Pizzada peynir, genelde tek bir tabaktaki en yüksek maliyetli kalemdir; bu nedenle gramaj standardizasyonu food cost açısından kritiktir. Standart bir orta boy pizzada 150-180 gram rendelenmiş kaşar kullanımı yaygındır; bu miktarın tartılı ölçekle (göz kararı değil) uygulanması, hem tutarlı ürün kalitesi hem de öngörülebilir maliyet sağlar.

Blok kaşar alıp kendi mutfağında rendeleyen işletmeler, rendeleme fire oranını (%2-4) hesaba katmalı ve bu fireyi birim maliyete dahil etmelidir. Önceden rendelenmiş ürün almak bu fireyi ortadan kaldırır ama birim fiyatı bir miktar yükseltir; işletme büyüklüğüne göre iki seçenek de mantıklı olabilir.

## Depolama ve tazelik

Rendelenmiş kaşar, blok hâline göre daha büyük yüzey alanına sahip olduğundan kuruma ve oksidasyona daha açıktır. Rendelendikten sonra 24-48 saat içinde tüketilmesi, kalite kaybını önler. Blok kaşar ise doğru ambalaj ve 2-4°C soğuk zincirde haftalar boyunca kalitesini koruyabilir; bu nedenle yüksek hacimli işletmeler blok alıp günlük ihtiyaç kadar rendeleme yapmayı tercih eder.

## Farklı pizza stillerinde peynir yaklaşımı

Pizza stiline göre peynir seçimi ve uygulama şekli de değişir. Napoliten stil (ince hamur, çok yüksek sıcaklık, kısa pişirme) genelde daha ince ve seyrek peynir dağılımı ister; kalın tabaka peynir bu stilde dışı yanmadan içinin erimesini engeller. Amerikan/New York stili (kalın kenar, orta sıcaklık, uzun pişirme) ise daha bol ve kalın peynir tabakasını kaldırabilir çünkü pişirme süresi peynirin homojen erimesine izin verir. Türkiye'de yaygın olan pide-tarzı veya "lahmacun ustası" pizza yorumlarında ise kaşar genelde diğer malzemelerle (sucuk, sebze) birlikte orta yoğunlukta kullanılır ve fırın sıcaklığına göre gramaj ayarlanır.

İşletmenizin sunduğu pizza stiline göre kaşar gramajını ve rendeleme kalınlığını (ince/kalın rende) standardize etmek, hem görsel tutarlılık hem de maliyet kontrolü açısından fayda sağlar. Menüde birden fazla stil sunuluyorsa, her stil için ayrı bir standart porsiyon kartı hazırlamak karışıklığı önler.

## Tedarik istikrarının pizza kalitesine etkisi

Pizza peynirinde en çok gözden kaçan risklerden biri, farklı partilerin farklı yağ/nem oranına sahip olmasıdır. Bir parti iyi eriyip çekerken bir sonraki parti beklenenden kuru veya sulu çıkabilir; bu da mutfakta "bu sefer neden farklı oldu" sorusuna yol açar. Sabit bir tedarikçiden, tutarlı üretim standardıyla düzenli alım yapmak bu değişkenliği azaltır ve mutfak ekibinin her seferinde aynı sonucu almasını sağlar.

## Sık sorulan sorular

### Pizzada mozzarella yerine kaşar kullanmak kaliteyi düşürür mü?

Doğru olgunluk ve yağ oranına sahip bir kaşar, çekme ve erime açısından mozzarellaya yakın performans gösterebilir; asıl fark tat profilindedir. Maliyet ve tedarik istikrarı açısından kaşar, birçok Türkiye pazarındaki pizzacı için daha pratik bir seçimdir.

### Blok kaşarı nasıl doğru rendelerim?

Peynirin çok soğuk olmaması (buzdolabından çıkıp 10-15 dakika oda sıcaklığında bekletilmesi) rendelemeyi kolaylaştırır ve rendenin peynire yapışıp kütleşmesini azaltır.

### Pizza peynirinin yağ oranı neden önemli?

Yağ oranı, erime akıcılığını ve çekme özelliğini doğrudan belirler; çok düşük yağlı peynir kuru ve lastik gibi kalırken, dengeli yağ oranı homojen bir erime sağlar.

### Rendelenmiş kaşar kaç gün dayanır?

Doğru soğuk zincirde (2-4°C) ve hava almayan ambalajda 3-5 gün taze kalabilir, ancak en iyi sonuç için günlük ihtiyaç kadar rendelenmesi önerilir.

Doğru pizza peyniri seçimi, hem tabak kalitesini hem de food cost'unuzu doğrudan etkiler. Blok kaşar peyniri yüksek hacimli üretim için, dilimli kaşar peyniri ise hızlı ve düşük fireli kullanım için Yetiş Grup bayi mağazasında sabit fiyat listesiyle temin edilebilir. HORECA işletmeniz için bayi başvurusunu /auth üzerinden yapabilirsiniz.`,
  },
  {
    title: "Otel kahvaltısında peynir tabağı nasıl kurgulanır?",
    slug: "otel-kahvalti-peynir-tabagi",
    excerpt:
      "Otel açık büfe kahvaltısında peynir tabağı kurgusu: çeşitlilik, porsiyon planlama, fire kontrolü ve misafir memnuniyetini artıran sunum ilkeleri.",
    category: "HORECA",
    tags: ["otel kahvaltısı", "açık büfe", "peynir tabağı", "porsiyon planlama"],
    coverUrl: "/products/tulum.jpg",
    relatedProductSlugs: ["tulum-peyniri-800g", "dilimli-kasar-250g", "beyaz-peynir-17kg-teneke", "lor-peyniri-1kg"],
    body: `Otel kahvaltısında iyi bir peynir tabağı, en az 3-4 farklı peynir türünü (beyaz, kaşar, tulum, lor gibi) doku ve tat çeşitliliği gözeterek, misafir başına öngörülebilir porsiyon hesabıyla ve fire riskini en aza indirecek şekilde sunmakla kurgulanır. Amaç, hem "zengin sofra" algısı yaratmak hem de büfe sonunda gereksiz atığı önlemektir.

## Çeşitlilik: doku ve tat dengesi

Bir otel kahvaltı büfesinde peynir çeşitliliği rastgele değil, doku ve tat eksenine göre planlanmalıdır:

- **Beyaz peynir**: Tuzlu, yumuşak doku; kahvaltı sofrasının temel taşı, geniş misafir kitlesine hitap eder.
- **Kaşar peyniri (dilimli)**: Daha sert doku, hafif tuzlu; hem doğrudan tüketim hem de sandviç/tost istasyonu için uygundur.
- **Tulum peyniri**: Keskin ve yöresel bir tat sunar; özellikle yerli misafirler ve "otantik" deneyim arayan yabancı misafirler için fark yaratır.
- **Lor peyniri**: Hafif ve düşük tuzlu; diyet/sağlıklı beslenme tercih eden misafiriler ve reçel/bal ile tüketim için idealdir.

Bu dört çeşidi bir arada sunmak, hem geniş damak zevkine hitap eder hem de otelin "yöresel/kırsal" hikâyesini sofraya taşır. Özellikle Yetiş Grup gibi yöresel üretim odaklı tedarikçilerden alınan ürünlerle bu hikâye daha inandırıcı hale gelir.

## Porsiyon planlama: misafir başına gramaj

Kahvaltı büfelerinde en sık yapılan hata, peynir miktarını doluluk oranına göre değil, "büfe boş görünmesin" refleksiyle belirlemektir. Sağlıklı bir planlama için misafir başına ortalama 40-60 gram toplam peynir tüketimi baz alınabilir; bu rakam, otelin konsept ve misafir profiline göre ayarlanmalıdır (iş oteli vs. tatil oteli, yerli vs. yabancı ağırlıklı misafir).

Porsiyon planlamasında 17 kg'lık teneke beyaz peynir gibi büyük hacimli ambalajlar, yüksek doluluk oranına sahip büyük otellerde birim maliyeti düşürürken, düşük-orta doluluklu butik otellerde daha küçük ambalajlı ürünler fire riskini azaltır. Doluluk tahminine göre hangi ambalaj biçiminin daha uygun olduğu haftalık bazda değerlendirilmelidir.

## Fire kontrolü: büfede ve depoda

Açık büfede peynirin uzun süre oda sıcaklığında beklemesi hem hijyen riski hem de kalite kaybı yaratır. Pratik öneriler:

- Büfe süresince peynir tepsilerini buzlu zemin (chiller) üzerinde tutmak, sıcaklık artışını yavaşlatır.
- Büfe sonunda açıkta kalan peyniri asla depoya geri koymayıp güvenli bir şekilde imha etmek, gıda güvenliği kurallarının gereğidir.
- Depoda SKT'ye göre rotasyon (FEFO) uygulamak, büfeye her zaman SKT'si en yakın ürünün önce çıkmasını sağlar.
- Küçük tepsilerle sık yenileme yapmak, büyük tepsiyle tek seferde koyup uzun süre bekletmekten daha az fire yaratır.

## Sunum ilkeleri: misafir memnuniyetini artırmak

Peynirlerin isim etiketiyle (örneğin "Trakya tulum peyniri", "Ege bölgesi kaşar") sunulması, misafire hem bilgi verir hem de yöresel değeri hissettirir. Farklı peynirlerin ayrı bölümlerde, kesim şekilleri (küp, dilim, blok) belirgin şekilde sunulması, büfede kararsız kalan misafirin seçim sürecini kolaylaştırır ve algılanan çeşitliliği artırır.

Mevsimsel veya haftalık rotasyonla farklı yöresel peynirlerin sırayla sunulması (örneğin bir hafta tulum ağırlıklı, bir hafta farklı bir yöresel çeşit), sabit misafiri olan iş otellerinde tekrar ziyaretlerde "yenilik" algısı yaratır.

## Maliyet ve tedarik istikrarı

Otel kahvaltısı gibi yüksek hacimli ve düzenli tüketimi olan bir kalemde, tedarikçinin haftalık sabit teslimat yapabilmesi ve fiyat listesinin öngörülebilir olması operasyonel planlamayı kolaylaştırır. Sezonluk doluluk dalgalanmalarında (yaz-kış, hafta içi-hafta sonu) sipariş miktarını hızlıca ayarlayabilmek, hem fireyi hem de stoksuz kalma riskini azaltır.

## Personel eğitimi ve büfe akışı

Büfe kalitesi kadar, büfeyi yöneten personelin eğitimi de misafir deneyimini belirler. Servis personeli, hangi peynirin hangi tepside olduğunu, alerjen bilgisini (örneğin laktoz içeriği) ve tükenen ürünün ne kadar sürede yenileneceğini bilmelidir. Sabah yoğun saatlerinde (genelde 07:30-09:30 arası) tepsi kontrolü sıklaştırılmalı; bu saatlerde büfenin boş veya dağınık görünmesi, misafir memnuniyetini doğrudan düşüren bir unsurdur.

Ayrıca büfe düzenlemesinde peynirlerin kesim aletleri (bıçak, peynir teli) türe göre ayrılmalı; farklı peynirler için aynı bıçağın kullanılması hem çapraz koku bulaşmasına hem de görsel karmaşaya yol açar. Küçük detaylar gibi görünse de, bu tür standardizasyonlar büfenin profesyonel algısını güçlendirir.

## Maliyet-kalite dengesini bulmak

Otel yönetimleri sıklıkla peynir çeşitliliğini artırmak ile maliyeti kontrol altında tutmak arasında denge kurmaya çalışır. Burada pratik bir yaklaşım, "temel" ve "öne çıkan" ürün ayrımı yapmaktır: beyaz peynir ve dilimli kaşar gibi yüksek tüketimli, orta maliyetli ürünler geniş miktarda sunulurken, tulum peyniri gibi daha yüksek birim maliyetli yöresel ürünler daha küçük porsiyonlarda ama görsel olarak öne çıkan bir noktada (örneğin özel bir tahta üzerinde) sunulabilir. Bu yaklaşım, toplam maliyeti kontrol altında tutarken misafirin "zengin ve özenli sofra" algısını korur.

## Sık sorulan sorular

### Otel kahvaltısında kaç çeşit peynir sunulmalı?

Genel kabul gören pratik, en az 3-4 çeşit (beyaz, kaşar, tulum/yöresel, lor gibi) sunmaktır; bu sayı otelin segmentine ve misafir profiline göre 5-6 çeşide çıkabilir.

### Büfede açıkta kalan peynir tekrar depoya konulabilir mi?

Hayır; gıda güvenliği açısından açık büfede oda sıcaklığında uzun süre bekleyen ürünlerin tekrar soğuk depoya alınıp bir sonraki güne saklanması önerilmez.

### Peynir tabağı fire oranı ortalama ne kadar olmalı?

İyi planlanmış bir büfede peynir fire oranı %8-12 aralığında tutulabilir; bu oranın üzerine çıkması porsiyon planlaması veya sunum miktarının gözden geçirilmesi gerektiğine işaret eder.

### Yöresel peynirleri büfede nasıl öne çıkarabilirim?

Peynirin menşei ve üretim hikâyesini kısa bir etiketle paylaşmak, misafirin ürüne değer atfetmesini kolaylaştırır ve büfeyi sıradan bir sunumdan öne çıkarır.

Otel kahvaltı büfenizin peynir tabağını çeşitlilik, doğru porsiyon ve düşük fire ile kurgulamak için tam yağlı beyaz peynir (17 kg), dilimli kaşar peyniri, tulum peyniri ve lor peyniri gibi ürünleri tek bir tedarikçiden düzenli olarak temin edebilirsiniz. Yetiş Grup bayi mağazasında bu ürünlerin hepsine sabit fiyat listesi ve haftalık teslimat planıyla ulaşabilir, bayi başvurunuzu /auth üzerinden tamamlayabilirsiniz.`,
  },
  {
    title: "Soğuk zincir nedir, kırıldığında ne olur?",
    slug: "soguk-zincir-nedir",
    excerpt:
      "Soğuk zincir kavramı, gıda güvenliğindeki rolü, kırıldığında oluşan riskler ve HORECA/perakende işletmelerin soğuk zincir yönetiminde dikkat etmesi gerekenler.",
    category: "Gıda Güvenliği",
    tags: ["soğuk zincir", "gıda güvenliği", "depolama", "lojistik"],
    coverUrl: "/products/sut.jpg",
    relatedProductSlugs: ["sut-1l", "yogurt-5kg-kova", "tereyagi-1kg-kova"],
    body: `Soğuk zincir, bir gıda ürününün üretildiği andan tüketiciye ulaşana kadar geçen her aşamada (depolama, taşıma, teslimat, işletme içi saklama) belirli bir sıcaklık aralığında kesintisiz tutulmasıdır. Süt ve süt ürünlerinde bu aralık genelde 2-4°C'dir. Zincir herhangi bir noktada kırıldığında (örneğin araç soğutması durduğunda veya ürün uzun süre oda sıcaklığında beklediğinde) mikrobiyal üreme hızlanır, raf ömrü kısalır ve gıda güvenliği riski ortaya çıkar.

## Soğuk zincirin aşamaları

Soğuk zincir tek bir nokta değil, birbirine bağlı bir zincirdir ve her halka aynı derecede önemlidir:

- **Üretim/işleme sonrası soğutma**: Ürün üretildikten hemen sonra hedef sıcaklığa indirilmelidir; bu aşamadaki gecikme sonraki tüm halkaları olumsuz etkiler.
- **Depolama**: Tedarikçi deposunda sürekli izlenen ve kayıt altına alınan sıcaklık kontrolü gerekir.
- **Taşıma**: Soğutmalı araçlarla, mümkünse sıcaklık kayıt cihazlı taşıma yapılmalıdır.
- **Teslim alma**: İşletmenin teslimat anında sıcaklığı kontrol edip kayıt altına alması, zincirin son kritik halkasıdır.
- **İşletme içi depolama**: Buzdolabı/soğuk oda sıcaklığının düzenli izlenmesi ve ürünün doğru rafta (kapı önü değil, sabit sıcaklık bölgesi) saklanması gerekir.

## Zincir kırıldığında ne olur?

Sıcaklık 4°C'nin üzerine çıktığında, süt ürünlerinde bulunabilecek patojen ve bozulma bakterilerinin üreme hızı katlanarak artar. Kısa süreli (15-30 dakika) bir sıcaklık artışı genelde kritik değildir, ancak tekrarlanan veya uzun süreli kesintiler (birkaç saat oda sıcaklığında bekleme gibi) şu sonuçlara yol açabilir:

- Raf ömrünün beklenenden çok daha kısa sürede dolması.
- Tat, koku ve dokuda bozulma (ekşime, kesilme, kokuşma).
- Gıda zehirlenmesi riski taşıyan patojen üremesi.
- Ambalajlı ürünlerde şişme veya sızıntı gibi görsel bozulma belirtileri.

En riskli durum, zincirin kırıldığı fark edilmeden ürünün rafa çıkması veya müşteriye/misafire servis edilmesidir; bu nedenle her teslimat noktasında sıcaklık kontrolü rutin hale getirilmelidir.

## HORECA işletmeleri için pratik kontrol noktaları

Restoran, otel ve şarküteri gibi işletmelerde soğuk zincir yönetimi için uygulanabilir somut adımlar:

- Teslimat aracının kasa sıcaklığını, ürün teslim alınmadan önce görsel olarak veya termometreyle kontrol edin.
- Süt, yoğurt ve tereyağı gibi hassas ürünleri teslim alır almaz doğrudan soğuk depoya taşıyın; teslimat rampasında bekletmeyin.
- Soğuk oda ve buzdolaplarına dijital sıcaklık kaydedici yerleştirip günlük kontrol yapın.
- Personeli, sıcaklık sapması gördüğünde ürünü kullanmadan önce bildirmesi konusunda eğitin.
- Tedarikçinizin sıcaklık kayıt sistemi olup olmadığını, teslimat öncesi sorgulayın.

## Tedarikçi seçiminde soğuk zincir garantisi

Bir tedarikçinin soğuk zincir konusundaki ciddiyeti, sadece "soğutmalı araçlarımız var" beyanıyla değil, somut süreçlerle ölçülmelidir: araçlarda sıcaklık kayıt cihazı bulunması, depoda sürekli izleme yapılması ve teslimat sırasında sıcaklık bilgisinin paylaşılabilmesi. Günlük süt, yoğurt ve tereyağı gibi ürünlerde bu garantinin olmaması, işletmenin kontrolü dışında kalite kaybına yol açabilir.

Düzenli ve sık teslimat alabilen işletmeler, büyük miktarda stok tutup uzun süre soğuk odada bekletmek yerine ihtiyaç kadar taze ürünü daha sık almayı tercih ederek soğuk zincir riskini de azaltmış olur.

## Sıcaklık takibinde kullanılan yöntemler

Soğuk zincir yönetiminde manuel kontrolden dijital izlemeye geçiş, hem doğruluğu hem de hesap verebilirliği artırır. Basit termometrelerle günde birkaç kez yapılan nokta kontrolü asgari bir uygulamadır, ancak aralıklardaki sapmaları göremez. Sürekli kayıt yapan dijital sıcaklık sensörleri (data logger), belirlenen aralığın dışına çıkıldığında alarm üretebilir ve geçmişe dönük bir sıcaklık grafiği sunar; bu grafik, bir kalite şikâyeti geldiğinde "ürün bizde mi yoksa tedarik zincirinde mi bozuldu" sorusuna somut cevap verir.

Daha büyük ölçekli işletmeler için sıcaklık verisinin merkezi bir sisteme aktarılıp birden fazla soğuk odanın/aracın tek ekrandan izlenebilmesi, özellikle çoklu şube yapılarında operasyonel görünürlüğü artırır. Küçük ölçekli işletmeler için ise düşük maliyetli, tek nokta data logger'lar bile manuel kontrole göre büyük bir iyileştirme sağlar.

## Soğuk zincirin maliyetle ilişkisi

Soğuk zincir yatırımı (soğutmalı araç, izleme cihazı, eğitim) bir maliyet kalemi gibi görünse de, aslında fire ve iade maliyetini azaltarak kendini geri öder. Bozulan bir parti ürünün doğrudan maliyeti kadar, o üründen etkilenen müşteri/misafir güveninin yeniden kazanılması çok daha uzun sürer ve daha pahalıya mal olur. Bu nedenle soğuk zincir, sadece bir uyumluluk gerekliliği değil, doğrudan kârlılığı etkileyen bir operasyonel yatırım olarak değerlendirilmelidir.

## Tedarikçi ile işletme arasındaki sorumluluk sınırı

Soğuk zincirin kimin sorumluluğunda olduğu net şekilde tanımlanmalıdır: tedarikçi ürünü doğru sıcaklıkta teslim etmekle, işletme ise teslim aldığı andan itibaren kendi deposunda zinciri sürdürmekle yükümlüdür. Bu sınırın belirsiz olduğu durumlarda, bir sorun yaşandığında sorumluluk tespiti zorlaşır ve taraflar arasında anlaşmazlık çıkabilir. Teslimat anında sıcaklık kaydının her iki tarafça da görülebilir olması (örneğin irsaliyeye not düşülmesi veya dijital kayıt paylaşılması), bu sınırı netleştirmenin en pratik yoludur.

## Sık sorulan sorular

### Soğuk zincir kaç derece olmalı?

Süt ve süt ürünleri için genel kabul gören aralık 2-4°C'dir; dondurulmuş ürünlerde bu aralık çok daha düşüktür (-18°C ve altı), ancak taze süt ürünlerinde asla dondurulmamalıdır.

### Soğuk zincir kısa süreliğine kırılırsa ürün atılmalı mı?

Kısa süreli (15-30 dakika) ve tek seferlik bir sapma genelde kritik değildir, ancak tekrarlanan veya uzun süreli sapmalarda ürünün görsel ve koku kontrolü yapılmalı, şüphe durumunda kullanılmamalıdır.

### Evde/işletmede soğuk zincir nasıl korunur?

Buzdolabı kapısına değil, iç raflara yerleştirme, kapının sık açılmaması, dolabın aşırı doldurulmaması (hava sirkülasyonunu engellememesi) ve düzenli sıcaklık kontrolü temel önlemlerdir.

### Soğuk zincir kırıldığını nasıl anlarım?

Ambalajda şişme, sızıntı, beklenmedik yumuşama, ekşi veya anormal koku ve dokunulduğunda ürünün oda sıcaklığında olması gibi belirtiler soğuk zincirin bir noktada kesintiye uğradığına işaret edebilir.

Soğuk zincir yönetimi, günlük süt, yoğurt ve tereyağı gibi hassas ürünlerde işletmenizin gıda güvenliğinin temelini oluşturur. Yetiş Grup, bu ürünleri soğuk zincir garantili taşıma ve lot bazlı SKT takibiyle bayi mağazasından teslim eder. HORECA veya perakende işletmeniz için bayi başvurusunu /auth üzerinden yapabilir, düzenli ve güvenli tedarike geçebilirsiniz.`,
  },
  {
    title: "Yöresel peynirler haritası: hangi bölge hangi peyniri üretir?",
    slug: "yoresel-peynirler-haritasi",
    excerpt:
      "Türkiye'nin yöresel peynir haritası: Trakya, Ege, Anadolu ve Karadeniz bölgelerinin karakteristik peynirleri, süt tipi farkları ve HORECA menülerinde kullanım önerileri.",
    category: "Ürün Bilgisi",
    tags: ["yöresel peynir", "Türkiye peynirleri", "menşei", "HORECA"],
    coverUrl: "/products/tulum.jpg",
    relatedProductSlugs: ["tulum-peyniri-800g", "beyaz-peynir-17kg-teneke", "kasar-peyniri-1kg-vakum"],
    body: `Türkiye'nin yöresel peynir haritası dört ana bölge etrafında şekillenir: Trakya (inek sütü ağırlıklı, taze beyaz peynir), Ege (koyun ve keçi sütü karışımı, tulum peyniri), Anadolu (inek sütü, olgun kaşar peyniri) ve Karadeniz (yayla sütü, taze tereyağı ve otlu peynir çeşitleri). Her bölgenin iklimi, mera yapısı ve hayvancılık geleneği, o coğrafyaya özgü peynir karakterini belirler.

## Trakya: taze beyaz peynirin kalesi

Trakya bölgesi, geniş düzlükleri ve inek sütü ağırlıklı hayvancılığıyla Türkiye'nin en önemli taze beyaz peynir üretim merkezlerinden biridir. Bölgenin nemli iklimi ve zengin mera bitki örtüsü, sütün yağ oranını ve tadını doğrudan etkiler. Trakya beyaz peyniri genelde tam yağlı, yumuşak dokulu ve dengeli tuzlu profiliyle bilinir; teneke ambalajda olgunlaştırılarak hem raf ömrü uzatılır hem de karakteristik tadı gelişir. Bu bölgenin günlük süt üretimi de yüksek hacimli olduğundan, günlük süt tedariki için de önemli bir kaynaktır.

## Ege: tulum peynirinin ve keçi/koyun sütünün bölgesi

Ege bölgesi, dağlık arazisi ve koyun/keçi otlatmacılığına elverişli yapısıyla tulum peyniri gibi güçlü karakterli, yöresel peynirlerin merkezidir. Tulum peyniri, geleneksel olarak deri veya bez tulum içinde olgunlaştırılır; bu süreç peynire keskin, hafif ekşimsi ve derin bir tat kazandırır. Koyun sütünün yağ ve protein yoğunluğu, tulum peynirinin yoğun kıvamını ve uzun raf ömrünü destekler. Ege tulumu, özellikle otantik/yöresel deneyim sunmak isteyen restoran ve otellerde mönü hikâyesi kurmak için güçlü bir malzemedir.

## Anadolu: olgun kaşar peynirinin merkezi

İç Anadolu ve çevresindeki geniş otlaklar, inek sütü ağırlıklı büyük ölçekli süt üretimini destekler; bu da bölgeyi kaşar peyniri üretiminin merkezi hâline getirir. Kaşar peyniri, sütün mayalanıp haşlanması (pasta filata benzeri bir teknik) ile üretilir ve bu işlem peynire karakteristik "çekme" (elastik erime) özelliğini kazandırır. Olgunlaştırma süresine göre kaşar peyniri taze/yarı olgun/olgun olarak sınıflandırılır; olgun kaşar daha keskin tat ve daha sert doku sunarken, taze kaşar daha yumuşak ve hafif tatlıdır. Anadolu kaşarı, hem doğrudan tüketim hem de pizza/tost gibi eriyen peynir uygulamalarında Türkiye'nin en çok tercih edilen peyniridir.

## Karadeniz: yayla sütü, tereyağı ve otlu lezzetler

Karadeniz'in yüksek rakımlı yaylaları, zengin ve çeşitli bitki örtüsüyle beslenen hayvanlardan elde edilen sütün aromatik profilini zenginleştirir. Bu bölge özellikle taze tereyağı üretiminde öne çıkar; yayla sütünün yüksek yağ oranı, koyu sarı renkli ve yoğun aromalı bir tereyağı ortaya çıkarır. Karadeniz mutfağında tereyağı sadece bir katkı değil, birçok geleneksel yemeğin temel malzemesidir (kaymaklı pide, mıhlama gibi).

## HORECA menülerinde yöresel peynirleri kullanma önerileri

Yöresel peynirleri menüye dahil ederken sadece "peynir tabağı" olarak değil, hikâyeleştirilmiş bir deneyim olarak sunmak fark yaratır:

- Menüde peynirin bölgesini ve süt tipini (örneğin "Ege bölgesi, koyun sütü tulum peyniri") belirtmek, algılanan değeri artırır.
- Farklı bölgelerin peynirlerini bir "peynir tahtası" konseptinde bir araya getirmek, hem çeşitlilik hem de anlatı sunar.
- Kahvaltı büfelerinde haftalık rotasyonla farklı yöresel peynirleri öne çıkarmak, sadık misafiride tekrar deneyim merakı yaratır.
- Pizza ve tost gibi eriyen peynir gerektiren uygulamalarda Anadolu kaşarı, mezze ve kahvaltı tabaklarında Ege tulumu ve Trakya beyaz peyniri tercih edilebilir.

## Tedarikte menşei şeffaflığının önemi

Bir peynirin "yöresel" olarak pazarlanabilmesi için menşei bilgisinin (bölge, süt tipi, olgunlaşma seviyesi) tedarik zincirinde izlenebilir ve doğrulanabilir olması gerekir. Menşei bilgisi paylaşmayan tedarikçilerden alınan ürünler, işletmenin menüsünde iddia ettiği hikâyeyi destekleyemez ve güven sorunu yaratabilir.

## Süt tipi farkının tat ve dokuya etkisi

Yöresel peynirlerin karakterini belirleyen en temel değişkenlerden biri süt tipidir. İnek sütü genelde daha hafif ve dengeli bir tat profili sunarken, koyun sütü daha yoğun, yağlı ve karakterli bir sonuç verir; keçi sütü ise kendine özgü hafif keskin bir aromayla öne çıkar. Bu nedenle aynı üretim tekniğiyle yapılsa bile bir Trakya inek sütü beyaz peyniri ile bir Ege koyun sütü beyaz peyniri birbirinden belirgin şekilde farklı olabilir.

HORECA işletmeleri, menüde sunacakları peynirleri seçerken sadece bölge adını değil, süt tipini de göz önünde bulundurmalıdır; özellikle deneyimli veya yabancı misafirler bu ayrımı fark edip sorgulayabilir. Menüde veya büfe etiketinde süt tipinin belirtilmesi, hem şeffaflık hem de gastronomik değer açısından fayda sağlar.

## Yöresel peynirlerin mevsimsellik ile ilişkisi

Otlatma bölgelerinde hayvanların beslendiği bitki örtüsü mevsime göre değiştiğinden, sütün ve dolayısıyla peynirin tadı da hafif mevsimsel farklılıklar gösterebilir. İlkbahar ve yaz aylarında zengin mera otlarıyla beslenen hayvanlardan elde edilen süt, genelde daha aromatik bir peynir ortaya çıkarır; kış aylarında ise bu aroma profili biraz daha hafifleyebilir. Bu mevsimsellik, bazı gurme restoranlar için bir pazarlama unsuru olarak da kullanılabilir ("yaz mevsimi yayla sütü tulumu" gibi).

## Bölgesel tedarikte lojistik gerçekler

Yöresel peynirlerin doğrudan üretildiği bölgeden büyük şehirlere taşınması, soğuk zincir ve teslimat süresi açısından ek bir planlama gerektirir. Tek bir tedarikçi üzerinden, farklı bölgelerin ürünlerini konsolide bir teslimat ile almak, işletmenin birden fazla küçük üreticiyle ayrı ayrı lojistik ilişki kurmasından çok daha verimlidir. Bu, hem sipariş yönetimini basitleştirir hem de tutarlı bir SKT/lot takibi sağlar.

## Sık sorulan sorular

### Tulum peyniri neden bu kadar keskin bir tada sahip?

Tulum (deri veya bez) içinde anaerobik ortamda olgunlaşma süreci, peynirde kendine özgü mikrobiyal aktiviteyi tetikler; bu da klasik beyaz veya kaşar peynirlerden farklı, daha keskin ve derin bir tat profili oluşturur.

### Kaşar peyniri ile beyaz peynir arasındaki temel fark nedir?

Kaşar peyniri haşlama/yoğurma (pasta filata) tekniğiyle üretilir ve bu işlem ona elastik erime özelliği kazandırır; beyaz peynir ise salamurada olgunlaşan, daha yumuşak ve tuzlu bir peynir türüdür.

### Yöresel peynirlerin raf ömrü standart peynirlerden farklı mı?

Olgunlaştırma süreci ve tuz/nem oranı raf ömrünü doğrudan etkiler; genel olarak daha olgun ve tuzlu peynirler (olgun kaşar, tulum) taze peynirlere göre daha uzun raf ömrüne sahiptir.

### Menüde yöresel peynir kullanmak maliyeti artırır mı?

Doğru tedarikçiyle çalışıldığında yöresel peynirlerin birim maliyeti standart ürünlerden çok farklı olmayabilir; asıl fark, menüde yaratılan algısal değerde ortaya çıkar ve genelde fiyatlandırmayı destekleyici bir unsur olur.

Yöresel peynirleri menünüze veya kahvaltı büfenize dahil etmek isterseniz, Trakya kökenli tam yağlı beyaz peynir, Anadolu kaşarı ve Ege tulum peyniri gibi ürünleri menşei bilgisiyle birlikte Yetiş Grup bayi mağazasından temin edebilirsiniz. Bayi başvurunuzu /auth üzerinden tamamlayarak yöresel ürün yelpazesine erişebilirsiniz.`,
  },
  {
    title: "Peynirin raf ömrünü uzatan saklama yöntemleri nelerdir?",
    slug: "peynir-raf-omru-saklama",
    excerpt:
      "Peynir türüne göre doğru saklama sıcaklığı, ambalajlama, açıldıktan sonra kullanım süresi ve işletmelerde raf ömrünü uzatan pratik yöntemler.",
    category: "Depolama",
    tags: ["peynir saklama", "raf ömrü", "depolama", "gıda güvenliği"],
    coverUrl: "/products/lor.jpg",
    relatedProductSlugs: ["lor-peyniri-1kg", "kasar-peyniri-1kg-vakum", "beyaz-peynir-17kg-teneke"],
    body: `Peynirin raf ömrünü uzatmanın temel yolu, ürünü türüne uygun sıcaklıkta (genelde 2-4°C), doğru nem dengesinde ve hava ile temasını sınırlayan bir ambalajda saklamaktır. Taze ve yumuşak peynirler (lor gibi) daha kısa raf ömrüne sahipken, olgun ve tuzlu peynirler (tulum, olgun kaşar) doğru koşullarda haftalar boyunca kalitesini koruyabilir.

## Peynir türüne göre saklama sıcaklığı

Tüm peynirler aynı koşullarda saklanmaz; tuz oranı, nem içeriği ve olgunlaşma seviyesi saklama gereksinimini belirler:

- **Lor peyniri**: En yüksek nem oranına ve en düşük tuz oranına sahip olduğu için en kısa raf ömrüne sahiptir; sürekli 2-4°C'de saklanmalı ve açıldıktan sonra birkaç gün içinde tüketilmelidir.
- **Taze beyaz peynir**: Salamura içinde saklandığında raf ömrü belirgin şekilde uzar; salamura seviyesinin düşmemesine dikkat edilmelidir çünkü peynirin hava ile temas eden kısmı hızla kurur ve kalite kaybeder.
- **Kaşar peyniri**: Olgunluk arttıkça nem oranı düşer ve raf ömrü uzar; blok hâlde vakumlu ambalajda saklandığında dilimlenmiş hâline göre çok daha uzun süre taze kalır.
- **Tulum peyniri**: Doğal kabuğu bir miktar koruma sağlar, ancak kesildikten sonra kalan kısmın sıkıca sarılması gerekir; yüksek tuz oranı sayesinde diğer taze peynirlere göre daha dayanıklıdır.

## Ambalajlama: hava teması en büyük düşman

Peynirin kalite kaybının en büyük nedenlerinden biri hava ile temasıdır; hava, hem kurumaya hem de istenmeyen küf oluşumuna yol açar. Pratik ambalajlama önerileri:

- Vakumlu ambalaj, özellikle blok kaşar ve tulum peynirinde raf ömrünü belirgin şekilde uzatır.
- Açılmış ambalajlar, orijinal ambalaj yerine gıdaya uygun streç film veya vakumlu poşetle sıkıca sarılmalıdır.
- Salamuralı peynirlerde (beyaz peynir) salamura suyu peynirin üzerini tam olarak kapatacak seviyede tutulmalı, gerekirse ekstra salamura hazırlanıp eklenmelidir.
- Farklı peynir türlerini aynı kapalı kapta bir arada saklamaktan kaçınılmalı; güçlü kokulu peynirler (tulum gibi) diğer ürünlere koku geçirebilir.

## İşletmelerde raf ömrünü uzatan operasyonel pratikler

Restoran, market ve şarküteri gibi işletmelerde peynirin raf ömrünü uzun tutmak için sistematik bir yaklaşım gerekir:

- **FEFO uygulaması**: Depoya giren her yeni parti, SKT'si daha uzak olsa bile eski partinin arkasına yerleştirilmeli; raftan alım her zaman SKT'si en yakın olan üründen yapılmalıdır.
- **Sıcaklık kaydı**: Soğuk odanın ve buzdolaplarının sıcaklığı düzenli olarak (günde en az bir kez) kontrol edilip kayıt altına alınmalıdır.
- **Kapı içi değil, iç raf**: Peynirler buzdolabı kapısına değil, sıcaklığın daha stabil olduğu iç raflara yerleştirilmelidir.
- **Porsiyonlama disiplini**: Büyük blok ürünlerden ihtiyaç kadar kesilip geri kalanı hemen sıkıca sarılmalı; uzun süre açık bırakılmamalıdır.
- **Personel eğitimi**: Depo ve mutfak personelinin doğru saklama ve rotasyon kurallarını bilmesi, en pahalı ekipmandan bile daha etkili bir raf ömrü uzatma aracıdır.

## Ambalaj boyutunun raf ömrüne etkisi

Büyük ambalajlı ürünler (17 kg teneke beyaz peynir gibi) açıldıktan sonra tüketim hızına göre planlanmalıdır; yüksek hacimli işletmelerde bu büyük ambalajlar hızlı tüketildiği için avantajlıdır, ancak düşük hacimli işletmelerde açık kalma süresi uzadıkça kalite kaybı riski artar. Bu nedenle işletme hacmine uygun ambalaj boyutu seçmek, sadece maliyet değil raf ömrü açısından da önemlidir.

## Donmuş peynir: ne zaman tercih edilebilir?

Bazı peynir türleri (özellikle rendelenmiş kaşar) dondurularak raf ömrü uzatılabilir, ancak dondurma-çözme süreci dokuda değişikliğe yol açabilir; bu nedenle doğrudan tüketim için değil, pişirme/erime gerektiren uygulamalar (pizza, sıcak sandviç) için daha uygun bir yöntemdir. Salamuralı ve taze peynirlerde (beyaz peynir, lor) dondurma genelde önerilmez çünkü doku bozulması belirgin olur.

## Sık yapılan saklama hataları

Birçok işletmede peynirin erken bozulmasının nedeni, ürünün kalitesinden çok saklama alışkanlıklarından kaynaklanır. En sık görülen hatalar arasında şunlar sayılabilir: peynirin orijinal ambalajından çıkarılıp uzun süre açıkta bırakılması, farklı peynir türlerinin aynı kapalı kapta üst üste istiflenmesi, soğuk odanın kapısının sık açılıp kapanması nedeniyle sıcaklığın dalgalanması ve büyük bir bloktan günlük ihtiyacın çok üzerinde miktarın önceden kesilip bekletilmesi. Bu hataların çoğu, ek bir maliyet gerektirmeden, sadece prosedür ve farkındalıkla düzeltilebilir.

## Depo yerleşiminin raf ömrüne katkısı

Soğuk depoda ürünlerin yerleşim düzeni de raf ömrünü etkiler. Kapıya yakın ve sık erişilen raflar, kapı açılışlarından kaynaklanan sıcaklık dalgalanmasına daha fazla maruz kalır; bu nedenle en hassas ürünler (lor gibi) depo içinin daha stabil sıcaklığa sahip iç kısımlarına yerleştirilmelidir. Ayrıca zeminle doğrudan temas eden ürünler nem ve hijyen riski taşıdığından, raf sistemlerinin kullanılması ve zeminle ürün arasında boşluk bırakılması önerilir. Düzenli depo temizliği ve havalandırması da küf oluşum riskini azaltan, genellikle ihmal edilen basit bir önlemdir.

## Sık sorulan sorular

### Açılmış beyaz peynir tenekesi ne kadar dayanır?

Salamura seviyesi korunduğu ve 2-4°C'de saklandığı sürece açılmış teneke birkaç hafta boyunca kalitesini koruyabilir; salamura azaldıkça bu süre kısalır.

### Kaşar peyniri buzdolabında mı yoksa oda sıcaklığında mı saklanmalı?

Kaşar peyniri her zaman soğuk zincirde (2-4°C) saklanmalıdır; oda sıcaklığında bekletme, kısa süreli servis anları dışında raf ömrünü ciddi şekilde kısaltır.

### Lor peyniri neden bu kadar hızlı bozuluyor?

Lor peynirinin yüksek nem ve düşük tuz oranı, mikrobiyal üreme için elverişli bir ortam yaratır; bu nedenle diğer peynir türlerine göre çok daha kısa raf ömrüne sahiptir ve hızlı tüketilmelidir.

### Küflenmiş peynirin sadece küflü kısmı kesilip geri kalanı kullanılabilir mi?

Sert ve olgun peynirlerde (bazı kaşar türleri) yüzeysel küf kesilerek geri kalan kısım güvenle kullanılabilir, ancak yumuşak ve nemli peynirlerde (lor, taze beyaz peynir) küf görülen ürünün tamamı atılmalıdır çünkü küf kökleri ürünün derinlerine yayılmış olabilir.

Doğru saklama koşullarıyla peynirin raf ömrünü uzatmak, hem gıda güvenliğini sağlar hem de işletmenizin fire maliyetini düşürür. Lor peyniri gibi hassas ürünlerde hızlı tüketim planı, blok kaşar ve teneke beyaz peynirde ise doğru ambalajlama ve rotasyon esastır. Yetiş Grup, bu ürünleri lot bazlı SKT bilgisiyle ve soğuk zincir garantisiyle bayi mağazasından teslim eder; bayi başvurunuzu /auth üzerinden yapabilirsiniz.`,
  },
  {
    title: "Bayilik nasıl alınır?",
    slug: "bayilik-nasil-alinir",
    excerpt:
      "Yetiş Grup bayilik başvuru süreci: kimler başvurabilir, gerekli belgeler, onay süreci, fiyat listesi ve kredi limiti mantığı, ilk sipariş adımları.",
    category: "Bayilik",
    tags: ["bayilik", "başvuru", "B2B", "toptancı"],
    coverUrl: "/products/yogurt.jpg",
    relatedProductSlugs: ["beyaz-peynir-17kg-teneke", "yogurt-5kg-kova", "sut-1l"],
    body: `Yetiş Grup bayiliği almak için /auth sayfasından başvuru formu doldurulur, işletme bilgileri ve yetkili kişi bilgileri girilir; başvuru Yetiş satış ekibi tarafından değerlendirilip onaylandıktan sonra hesap aktifleşir ve bayi mağazasından sipariş verilebilir hâle gelir. Süreç, market, şarküteri, HORECA (otel/restoran/kafe) ve ara toptancı işletmelerine açıktır.

## Kimler bayi olabilir?

Yetiş Grup bayilik sistemi, doğrudan tüketiciye değil işletmelere yönelik bir B2B modelidir. Başvuru yapabilecek işletme tipleri:

- **Market ve şarküteri**: Raf ürünü olarak peynir, süt ürünleri ve tereyağı satan perakende noktaları.
- **HORECA**: Otel, restoran, kafe gibi yiyecek-içecek işletmeleri; kahvaltı büfesi, mutfak ve içecek istasyonu ihtiyaçları için toplu tedarik arayanlar.
- **Ara toptancı**: Kendi bölgesinde daha küçük işletmelere dağıtım yapan toptan satış noktaları.

Her bayi tipi için mağazada gösterilen fiyat listesi ve minimum sipariş koşulları farklılık gösterebilir; bu, işletmenin hacmine ve sipariş sıklığına göre satış ekibi tarafından belirlenir.

## Başvuru için gerekli bilgiler

Başvuru formunda genel olarak istenen bilgiler:

- İşletme unvanı ve vergi bilgileri.
- İşletme türü (market, şarküteri, HORECA, toptancı) ve tahmini aylık hacim.
- Teslimat adresi/bölgesi ve tercih edilen teslimat günleri.
- Yetkili kişi bilgileri (ad, telefon, e-posta): sipariş ve onay süreçlerinde iletişim buradan sağlanır.
- Varsa mevcut tedarikçi bilgisi ve geçiş nedeni (isteğe bağlı, süreç hızlandırmaya yardımcı olabilir).

Eksiksiz ve doğru bilgiyle yapılan başvurular, değerlendirme sürecinde daha hızlı ilerler.

## Onay süreci nasıl işler?

Başvuru formu gönderildikten sonra Yetiş satış ekibi işletme bilgilerini değerlendirir; gerekirse ek doğrulama için yetkili kişiyle iletişime geçilir. Bayi kaydı otomatik olarak onaylanmaz. Her başvuru satış ekibi tarafından incelenir ve onaylandıktan sonra hesap aktif hâle gelir. Bu süreç, hem işletmenin gerçek bir ticari varlık olduğunu doğrulamak hem de doğru fiyat listesi ve kredi limiti koşullarının belirlenmesi için gereklidir.

Onay sonrasında bayi, kendi rolüne göre (yetkili, satın alma, muhasebe, depo) hesabına giriş yaparak mağazayı görüntüleyebilir ve sipariş sürecine başlayabilir.

## Fiyat listesi ve kredi limiti nasıl çalışır?

Her bayiye, işletme tipi ve hacmine uygun bir fiyat listesi tanımlanır; bu liste hacme bağlı kademeli iskontoları da içerebilir. Bayi mağazasında görünen fiyatlar, bu listeye göre otomatik hesaplanır. Pazarlık veya manuel fiyat sorma gerekmez.

Kredi limiti, bayinin açık (henüz tahsil edilmemiş) siparişlerinin toplam tutarını belirli bir sınırla kısıtlayan bir mekanizmadır. Sipariş verildiğinde ve onaylandığında limit kontrolü otomatik yapılır; bu sayede hem bayi hem de Yetiş Grup için ödeme riski önceden yönetilir. Kredi limiti, bayinin ödeme geçmişi ve hacmine göre zaman içinde güncellenebilir.

## İlk sipariş adımları

Hesap onaylandıktan sonra ilk siparişe geçiş şu adımları izler:

1. Bayi mağazasına giriş yapılır ve kategoriler (peynir, süt ürünleri, tereyağı vb.) incelenir.
2. İhtiyaç duyulan ürünler sepete eklenir; sepet sunucu tarafında tutulur, bu sayede farklı cihazlardan erişimde sepet kaybolmaz.
3. Sipariş özetinde birim fiyat, iskonto ve KDV net olarak görüntülenir; onaylandığında bu bilgiler sipariş satırına sabitlenir (fiyat snapshot), sonraki liste değişiklikleri geçmiş siparişi etkilemez.
4. Sipariş, teslimat bölgesi ve gün kısıtlarına göre planlanan tarihte sevk edilir.
5. Cari hesap hareketleri (fatura, ödeme, açık bakiye) bayi panelinden takip edilebilir.

## Bayi panelinde neler yönetilir?

Onaylanmış bir bayi hesabı, sadece sipariş vermekle sınırlı değildir. Bayi paneli üzerinden sipariş geçmişi ve durumu (hazırlanıyor, sevk edildi, teslim edildi) izlenebilir, geçmiş faturalara ve cari hareket dökümüne erişilebilir, ve işletme içindeki farklı roller (yetkili, satın alma, muhasebe, depo) kendi yetkisi dahilindeki işlemleri gerçekleştirebilir. Örneğin satın alma rolündeki bir kullanıcı sipariş oluşturabilirken, muhasebe rolündeki kullanıcı cari bakiyeyi ve fatura durumunu takip etmeye odaklanabilir; bu rol ayrımı, özellikle birden fazla çalışanı olan işletmelerde yetki karmaşasını önler.

Bildirim tercihleri de bayi panelinden yönetilir; sipariş onayı, sevkiyat bilgisi veya kampanya duyuruları gibi mesajlar için hangi kanaldan (örneğin WhatsApp) bilgilendirme alınacağı işletme tarafından belirlenebilir.

## Bayilik sürecinde en sık karşılaşılan sorunlar

Yeni başvuran işletmelerin en sık karşılaştığı gecikme nedenleri, eksik veya güncel olmayan işletme bilgileri, yetkili kişi iletişim bilgilerinin doğrulanamaması ve teslimat bölgesinin mevcut lojistik ağın dışında kalmasıdır. Başvuru formunu doldururken vergi numarası, açık adres ve güncel telefon/e-posta bilgilerinin doğru girilmesi, değerlendirme sürecinin gecikmeden ilerlemesini sağlar. Teslimat bölgesi konusunda belirsizlik varsa, başvuru sırasında bir not düşülmesi satış ekibinin daha hızlı geri dönüş yapmasına yardımcı olur.

## Sık sorulan sorular

### Bayilik başvurusu ne kadar sürede sonuçlanır?

Süreç, işletme bilgilerinin eksiksizliğine ve satış ekibinin değerlendirmesine bağlı olarak değişir; eksiksiz başvurular genelde daha hızlı sonuçlanır.

### Minimum sipariş tutarı var mı?

Minimum sipariş koşulları bayi tipine ve teslimat bölgesine göre değişebilir; bu bilgi onay sürecinde bayiye özel olarak paylaşılır.

### Bayilik başvurusu reddedilebilir mi?

Evet, her başvuru satış ekibi tarafından değerlendirilir ve otomatik onay verilmez; işletme türü, bölge kapasitesi veya diğer ticari kriterlere göre başvuru reddedilebilir veya ek bilgi istenebilir.

### Bayi olduktan sonra fiyat listesi değişebilir mi?

Evet, fiyat listeleri hacme, sözleşme koşullarına veya piyasa şartlarına göre güncellenebilir; ancak zaten onaylanmış ve sabitlenmiş (snapshot alınmış) siparişler bu değişiklikten etkilenmez.

Bayilik süreci, market, şarküteri, HORECA veya ara toptancı olarak faaliyet gösteren her işletmeye açıktır. Tam yağlı beyaz peynir, yoğurt ve günlük süt gibi temel ürünlerden başlayarak geniş bir katalog geneline erişim sağlayan bu süreç için başvurunuzu /auth sayfasından birkaç dakikada tamamlayabilir, onay sonrası bayi mağazasında sipariş vermeye başlayabilirsiniz.`,
  },
];

export const seedRecipes: SeedRecipe[] = [
  {
    title: "Menemenlik Beyaz Peynirli Kahvaltı Tabağı",
    slug: "menemenlik-beyaz-peynirli-kahvalti-tabagi",
    excerpt:
      "Klasik menemenin yanına tam yağlı beyaz peynirle zenginleştirilmiş, HORECA kahvaltı büfelerine uygun pratik ve doyurucu bir tabak.",
    coverUrl: "/products/beyaz-peynir.jpg",
    servings: 4,
    prepMinutes: 10,
    cookMinutes: 15,
    difficulty: "EASY",
    ingredients: [
      { name: "Domates", amount: "4", unit: "adet" },
      { name: "Yeşil biber", amount: "3", unit: "adet" },
      { name: "Yumurta", amount: "6", unit: "adet" },
      { name: "Tam yağlı beyaz peynir", amount: "150", unit: "g", productSlug: "beyaz-peynir-17kg-teneke" },
      { name: "Tereyağı", amount: "30", unit: "g", productSlug: "tereyagi-1kg-kova" },
      { name: "Tuz", amount: "1", unit: "tatlı kaşığı" },
      { name: "Karabiber", amount: "1", unit: "çay kaşığı" },
      { name: "Taze ekmek", amount: "8", unit: "dilim" },
    ],
    steps: [
      "Domatesleri rendeleyin veya küçük küpler hâlinde doğrayın; biberleri ince ince kıyın.",
      "Geniş bir tavada tereyağını orta ateşte eritin, biberleri ekleyip 3-4 dakika kavurun.",
      "Domatesleri ekleyip suyunu salıp çekene kadar orta ateşte 6-8 dakika pişirin.",
      "Tuz ve karabiberi ekleyin, ardından yumurtaları kırıp karıştırmadan veya hafifçe karıştırarak istenen kıvamda pişirin.",
      "Ocaktan almadan hemen önce beyaz peyniri iri parçalar hâlinde üzerine serpiştirin, 1 dakika daha kapağı kapatıp peynirin hafif yumuşamasını bekleyin.",
      "Sıcak servis tabağına alıp yanına taze ekmek dilimleriyle sunun.",
    ],
    tips:
      "Beyaz peyniri pişirmenin en sonunda eklemek, peynirin fazla erimeden hem tuzunu yemeğe vermesini hem de dokusunu korumasını sağlar. Kahvaltı büfesinde toplu üretim için domates-biber karışımını önceden hazırlayıp yumurtayı sipariş anında eklemek servis hızını artırır.",
    relatedProductSlugs: ["beyaz-peynir-17kg-teneke", "tereyagi-1kg-kova"],
  },
  {
    title: "Kaşarlı Tost: Kafeterya İçin Standart Tarif ve Maliyet Fikri",
    slug: "kasarli-tost-standart-tarif",
    excerpt:
      "Kafeterya ve kantin işletmeleri için gramajı standardize edilmiş, tutarlı maliyetli ve hızlı hazırlanan klasik kaşarlı tost tarifi.",
    coverUrl: "/products/kasar.jpg",
    servings: 1,
    prepMinutes: 3,
    cookMinutes: 5,
    difficulty: "EASY",
    ingredients: [
      { name: "Tost ekmeği", amount: "2", unit: "dilim" },
      { name: "Dilimli kaşar peyniri", amount: "30", unit: "g", productSlug: "dilimli-kasar-250g" },
      { name: "Tereyağı", amount: "8", unit: "g", productSlug: "tereyagi-1kg-kova" },
    ],
    steps: [
      "Tost ekmeğinin dış yüzeylerine ince bir tabaka tereyağı sürün.",
      "İç kısımlara dilimli kaşar peynirini eşit şekilde yerleştirin.",
      "Ekmekleri üst üste kapatıp önceden ısıtılmış tost makinesine yerleştirin.",
      "Kaşar tamamen eriyip yüzey altın rengi kızarana kadar (yaklaşık 3-4 dakika) pişirin.",
      "Sıcakken çapraz kesip servis tabağına alın.",
    ],
    tips:
      "Dilimli kaşar kullanmak, blok kaşarı elle kesmeye göre gramaj sapmasını büyük ölçüde azaltır ve her tostun maliyetini öngörülebilir kılar. Yüksek hacimli servis için ekmek ve peynir dilimlerini önceden istiflenmiş şekilde hazırlamak, kızaklık süresini kısaltır.",
    relatedProductSlugs: ["dilimli-kasar-250g", "tereyagi-1kg-kova"],
  },
  {
    title: "Lorlu Kıymasız Börek",
    slug: "lorlu-kiymasiz-borek",
    excerpt:
      "Lor peyniri, taze otlar ve yufka ile hazırlanan, kahvaltı ve ikram menülerine uygun hafif ve pratik bir börek tarifi.",
    coverUrl: "/products/lor.jpg",
    servings: 6,
    prepMinutes: 25,
    cookMinutes: 35,
    difficulty: "MEDIUM",
    ingredients: [
      { name: "Yufka", amount: "5", unit: "adet" },
      { name: "Lor peyniri", amount: "500", unit: "g", productSlug: "lor-peyniri-1kg" },
      { name: "Maydanoz", amount: "1", unit: "demet" },
      { name: "Dereotu", amount: "0.5", unit: "demet" },
      { name: "Yumurta", amount: "2", unit: "adet" },
      { name: "Süt", amount: "150", unit: "ml", productSlug: "sut-1l" },
      { name: "Sıvı yağ", amount: "80", unit: "ml" },
      { name: "Tuz", amount: "1", unit: "çay kaşığı" },
    ],
    steps: [
      "Maydanoz ve dereotunu ince ince kıyıp lor peyniriyle birlikte geniş bir kapta karıştırın, tuzu ekleyip harcı hazırlayın.",
      "Ayrı bir kapta yumurta, süt ve sıvı yağı çırparak yufka harcını (sosu) hazırlayın.",
      "Fırın tepsisinin tabanını sosla hafifçe nemlendirin, ilk yufkayı serip üzerine sos gezdirin.",
      "İkinci yufkanın üzerine lor peyniri harcının bir kısmını eşit şekilde yayın, üçüncü yufkayla kapatın.",
      "Bu katlama işlemini kalan yufka ve harçla tekrarlayın, en üst katmana bolca sos dökün.",
      "Önceden 180°C'ye ısıtılmış fırında yüzeyi altın rengi olana kadar 30-35 dakika pişirin.",
      "Fırından çıkardıktan sonra 5 dakika dinlendirip dilimleyerek servis edin.",
    ],
    tips:
      "Lor peynirinin fazla suyunu bir süzgeçte 10-15 dakika bekleterek süzmek, böreğin alt katmanının ıslanmasını önler ve daha kıvamlı bir iç harç elde etmenizi sağlar. HORECA kahvaltı büfelerinde önceden porsiyonlanmış dilimler hâlinde ısıtılarak sunulabilir.",
    relatedProductSlugs: ["lor-peyniri-1kg", "sut-1l"],
  },
  {
    title: "Yoğurtlu Cacık ve Mezze Tabağı",
    slug: "yogurtlu-cacik-mezze-tabagi",
    excerpt:
      "Yoğurt bazlı cacık ve tulum peynirli ikramlarla hazırlanan, restoran ve mezze menülerine uygun ferahlatıcı bir başlangıç tabağı.",
    coverUrl: "/products/yogurt.jpg",
    servings: 4,
    prepMinutes: 15,
    cookMinutes: 0,
    difficulty: "EASY",
    ingredients: [
      { name: "Yoğurt", amount: "500", unit: "g", productSlug: "yogurt-5kg-kova" },
      { name: "Salatalık", amount: "2", unit: "adet" },
      { name: "Sarımsak", amount: "1", unit: "diş" },
      { name: "Zeytinyağı", amount: "2", unit: "yemek kaşığı" },
      { name: "Kuru nane", amount: "1", unit: "çay kaşığı" },
      { name: "Tulum peyniri", amount: "100", unit: "g", productSlug: "tulum-peyniri-800g" },
      { name: "Ceviz içi", amount: "50", unit: "g" },
      { name: "Tuz", amount: "1", unit: "çay kaşığı" },
    ],
    steps: [
      "Salatalıkları ince küpler hâlinde doğrayın veya rendeleyin, hafifçe tuzlayıp 5 dakika dinlendirin.",
      "Yoğurdu geniş bir kapta çırpıp sarımsağı ezerek ekleyin.",
      "Süzülen salatalığı yoğurda karıştırın, tuzu tadına göre ayarlayın.",
      "Cacığı servis kâsesine alıp üzerine zeytinyağı gezdirin ve kuru nane serpin.",
      "Ayrı bir tabakta tulum peynirini iri parçalar hâlinde kırıp üzerine kabaca kıyılmış ceviz içi serpiştirin.",
      "Cacık ve tulum-ceviz tabağını yan yana, mezze sofrası formatında servis edin.",
    ],
    tips:
      "Cacığı servisten en az 30 dakika önce hazırlayıp buzdolabında dinlendirmek, tatların birbirine karışmasını sağlar ve daha ferahlatıcı bir sonuç verir. Tulum peynirinin keskin tadı ceviz ve zeytinyağıyla dengelendiği için mezze tabaklarında güçlü bir tamamlayıcı olarak kullanılabilir.",
    relatedProductSlugs: ["yogurt-5kg-kova", "tulum-peyniri-800g"],
  },
];
