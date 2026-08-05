import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const leads = [
  {
    companyName: "Beşiktaş Şarküteri Dünyası",
    contactName: "Murat Kaya",
    phone: "0532 111 22 33",
    city: "İstanbul",
    channel: "SARKUTERI" as const,
    stage: "MUZAKERE" as const,
    estimatedMonthlyKg: "420.000",
    note: "17 kg teneke beyaz peynir + kaşar için haftalık sabit sipariş istiyor.",
  },
  {
    companyName: "Kadıköy Zincir Market A.Ş.",
    contactName: "Elif Sarıkaya",
    phone: "0533 222 33 44",
    city: "İstanbul",
    channel: "MARKET" as const,
    stage: "NUMUNE_TEKLIF" as const,
    estimatedMonthlyKg: "1250.000",
    note: "6 şube için merkezi sipariş; numune gönderildi, fiyat teklifi bekleniyor.",
  },
  {
    companyName: "Liman Otel & Restoran Grubu",
    contactName: "Serkan Demir",
    phone: "0535 333 44 55",
    city: "Antalya",
    channel: "HORECA" as const,
    stage: "ILETISIMDE" as const,
    estimatedMonthlyKg: "300.000",
    note: "Otel mutfağı için dilimli kaşar ve lor peyniri görüşülüyor.",
  },
  {
    companyName: "Ege Toptan Gıda Dağıtım",
    contactName: "Ayşe Yıldırım",
    phone: "0536 444 55 66",
    city: "İzmir",
    channel: "ARA_TOPTANCI" as const,
    stage: "YENI" as const,
    estimatedMonthlyKg: "2000.000",
    note: "Ege bölgesi ara toptancı; ilk görüşme talebi WhatsApp'tan geldi.",
  },
  {
    companyName: "Bursa Şehir Marketleri",
    contactName: "Hakan Öztürk",
    phone: "0537 555 66 77",
    city: "Bursa",
    channel: "MARKET" as const,
    stage: "KAZANILDI" as const,
    estimatedMonthlyKg: "680.000",
    note: "Sözleşme imzalandı, ilk sevkiyat planlanıyor.",
  },
  {
    companyName: "Karaköy Cafe & Bistro",
    contactName: "Zeynep Aydın",
    phone: "0538 666 77 88",
    city: "İstanbul",
    channel: "HORECA" as const,
    stage: "KAYBEDILDI" as const,
    estimatedMonthlyKg: "60.000",
    note: "Bütçe uyuşmadı; 6 ay sonra tekrar aranacak.",
  },
  {
    companyName: "Konya Şarküteri Toptan",
    contactName: "Mehmet Çelik",
    phone: "0539 777 88 99",
    city: "Konya",
    channel: "SARKUTERI" as const,
    stage: "ILETISIMDE" as const,
    estimatedMonthlyKg: "540.000",
    note: "Tulum peyniri kapasitesi soruldu; teknik görüşme planlanıyor.",
  },
  {
    companyName: "Adana Toptan Süt Ürünleri",
    contactName: "Fatma Şahin",
    phone: "0530 888 99 00",
    city: "Adana",
    channel: "ARA_TOPTANCI" as const,
    stage: "YENI" as const,
    estimatedMonthlyKg: "1800.000",
    note: "Fuar standından gelen kayıt; henüz aranmadı.",
  },
];

const products = [
  {
    sku: "YG-BP17-TNK",
    name: "Beyaz Peynir 17 kg Teneke",
    slug: "beyaz-peynir-17kg-teneke",
    category: "Beyaz Peynir",
    description:
      "Geleneksel tam yağlı inek sütü beyaz peynir, 17 kg'lık teneke ambalajda. Şarküteri ve toptan satış için standart Yetiş Grup ambalajı.",
    unitLabel: "17 kg teneke",
    kgPerUnit: "17.000",
    pricePerUnitKurus: 340000,
    imageUrl: "/products/beyaz-peynir.jpg",
  },
  {
    sku: "YG-KS01-VAK",
    name: "Kaşar Peyniri 1 kg Vakum",
    slug: "kasar-peyniri-1kg-vakum",
    category: "Kaşar",
    description: "Olgunlaştırılmış tam yağlı kaşar peyniri, 1 kg vakumlu paket.",
    unitLabel: "1 kg vakum",
    kgPerUnit: "1.000",
    pricePerUnitKurus: 38000,
    imageUrl: "/products/kasar.jpg",
  },
  {
    sku: "YG-KS025-DLM",
    name: "Dilimli Kaşar 250 g Paket",
    slug: "dilimli-kasar-250g",
    category: "Kaşar",
    description: "Hazır dilimli kaşar peyniri, 250 g'lık raf ve HORECA paketi.",
    unitLabel: "250 g paket",
    kgPerUnit: "0.250",
    pricePerUnitKurus: 11000,
    imageUrl: "/products/kasar.jpg",
  },
  {
    sku: "YG-TL08-VAK",
    name: "Tulum Peyniri 800 g Vakum",
    slug: "tulum-peyniri-800g",
    category: "Tulum",
    description: "Geleneksel tulum peyniri, 800 g vakumlu paket.",
    unitLabel: "800 g vakum",
    kgPerUnit: "0.800",
    pricePerUnitKurus: 32000,
    imageUrl: "/products/tulum.jpg",
  },
  {
    sku: "YG-LR01-STD",
    name: "Lor Peyniri 1 kg",
    slug: "lor-peyniri-1kg",
    category: "Lor",
    description: "Taze lor peyniri, 1 kg'lık ambalaj.",
    unitLabel: "1 kg",
    kgPerUnit: "1.000",
    pricePerUnitKurus: 18000,
    imageUrl: "/products/lor.jpg",
  },
  {
    sku: "YG-TY01-KOV",
    name: "Tereyağı 1 kg Kova",
    slug: "tereyagi-1kg-kova",
    category: "Tereyağı",
    description: "Sade tereyağı, 1 kg'lık kova ambalaj.",
    unitLabel: "1 kg kova",
    kgPerUnit: "1.000",
    pricePerUnitKurus: 45000,
    imageUrl: "/products/tereyagi.jpg",
  },
  {
    sku: "YG-YG05-KOV",
    name: "Yoğurt 5 kg Kova",
    slug: "yogurt-5kg-kova",
    category: "Yoğurt",
    description: "Tam yağlı süzme yoğurt, 5 kg'lık toptan kova.",
    unitLabel: "5 kg kova",
    kgPerUnit: "5.000",
    pricePerUnitKurus: 25000,
    imageUrl: "/products/yogurt.jpg",
  },
  {
    sku: "YG-ST01-LTR",
    name: "Süt 1 L",
    slug: "sut-1l",
    category: "Süt",
    description: "Pastörize tam yağlı süt, 1 litrelik ambalaj.",
    unitLabel: "1 L",
    kgPerUnit: "1.000",
    pricePerUnitKurus: 3500,
    imageUrl: "/products/sut.jpg",
  },
];

// slug -> { horeca, market } fiyatları (kuruş) — Standart liste ürünün baz
// fiyatını (pricePerUnitKurus) kullanır.
const priceListOverrides: Record<string, { horeca: number; market: number }> = {
  "beyaz-peynir-17kg-teneke": { horeca: 332000, market: 322000 },
  "kasar-peyniri-1kg-vakum": { horeca: 37200, market: 36000 },
  "dilimli-kasar-250g": { horeca: 10600, market: 10300 },
  "tulum-peyniri-800g": { horeca: 31200, market: 30200 },
  "lor-peyniri-1kg": { horeca: 17600, market: 17000 },
  "tereyagi-1kg-kova": { horeca: 44000, market: 42500 },
  "yogurt-5kg-kova": { horeca: 24300, market: 23500 },
  "sut-1l": { horeca: 3400, market: 3300 },
};

async function seedLeads() {
  const existing = await prisma.lead.count();
  if (existing > 0) {
    console.log(`Skipping leads — ${existing} already exist.`);
    return;
  }
  for (const lead of leads) {
    await prisma.lead.create({ data: lead });
  }
  console.log(`Seeded ${leads.length} lead(s).`);
}

async function seedCatalog() {
  const existing = await prisma.product.count();
  if (existing > 0) {
    console.log(`Skipping catalog — ${existing} product(s) already exist.`);
    return;
  }

  const createdProducts = [];
  for (const product of products) {
    createdProducts.push(await prisma.product.create({ data: product }));
  }

  const standart = await prisma.priceList.create({
    data: { name: "Standart", slug: "standart" },
  });
  const horeca = await prisma.priceList.create({
    data: { name: "HORECA", slug: "horeca" },
  });
  const market = await prisma.priceList.create({
    data: { name: "Zincir Market", slug: "zincir-market" },
  });

  for (const product of createdProducts) {
    const overrides = priceListOverrides[product.slug];
    await prisma.priceListItem.create({
      data: {
        priceListId: standart.id,
        productId: product.id,
        priceKurus: product.pricePerUnitKurus,
      },
    });
    if (overrides) {
      await prisma.priceListItem.create({
        data: { priceListId: horeca.id, productId: product.id, priceKurus: overrides.horeca },
      });
      await prisma.priceListItem.create({
        data: { priceListId: market.id, productId: product.id, priceKurus: overrides.market },
      });
    }
  }

  await prisma.user.updateMany({
    where: { email: "bayi@yetisgrup.test" },
    data: { priceListId: standart.id },
  });

  console.log(
    `Seeded ${createdProducts.length} product(s) and 3 price lists (Standart/HORECA/Zincir Market).`,
  );
}

async function seedAccountTypes() {
  await prisma.user.updateMany({
    where: { email: { in: ["bayi@yetisgrup.test", "horeca@yetisgrup.test"] } },
    data: { accountType: "DEALER" },
  });
}

async function seedLeadActivities() {
  const existing = await prisma.leadActivity.count();
  if (existing > 0) {
    console.log(`Skipping lead activities — ${existing} already exist.`);
    return;
  }

  const besiktas = await prisma.lead.findFirst({
    where: { companyName: "Beşiktaş Şarküteri Dünyası" },
  });
  const kadikoy = await prisma.lead.findFirst({
    where: { companyName: "Kadıköy Zincir Market A.Ş." },
  });
  const bursa = await prisma.lead.findFirst({
    where: { companyName: "Bursa Şehir Marketleri" },
  });

  const activities: { leadId: string; type: "ARAMA" | "NOT" | "TEKLIF" | "TESLIMAT" | "DURUM_DEGISIKLIGI"; note: string }[] = [];

  if (besiktas) {
    activities.push(
      { leadId: besiktas.id, type: "ARAMA", note: "İlk tanışma görüşmesi yapıldı, ihtiyaçlar dinlendi." },
      { leadId: besiktas.id, type: "NOT", note: "17 kg teneke beyaz peynir + kaşar için haftalık düzenli sipariş talebi var." },
      { leadId: besiktas.id, type: "TEKLIF", note: "Haftalık sabit sipariş için özel fiyat teklifi iletildi." },
      { leadId: besiktas.id, type: "ARAMA", note: "Teklif üzerine ikinci görüşme yapıldı, müzakere sürüyor." },
    );
  }
  if (kadikoy) {
    activities.push(
      { leadId: kadikoy.id, type: "ARAMA", note: "6 şube için merkezi tedarik ihtiyacı görüşüldü." },
      { leadId: kadikoy.id, type: "TESLIMAT", note: "Numune paketi tüm şubelere gönderildi." },
      { leadId: kadikoy.id, type: "NOT", note: "Satın alma ekibi numuneleri değerlendiriyor, fiyat teklifi bekleniyor." },
    );
  }
  if (bursa) {
    activities.push(
      { leadId: bursa.id, type: "TEKLIF", note: "Yıllık tedarik teklifi sunuldu ve kabul edildi." },
      { leadId: bursa.id, type: "DURUM_DEGISIKLIGI", note: "Sözleşme imzalandı, aday kazanıldı olarak işaretlendi." },
      { leadId: bursa.id, type: "TESLIMAT", note: "İlk sevkiyat için depo ile koordinasyon sağlanıyor." },
    );
  }

  for (const activity of activities) {
    await prisma.leadActivity.create({ data: activity });
  }
  console.log(`Seeded ${activities.length} lead activity(s).`);
}

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function seedInventory() {
  const existing = await prisma.lot.count();
  if (existing > 0) {
    console.log(`Skipping inventory — ${existing} lot(s) already exist.`);
    return;
  }

  const allProducts = await prisma.product.findMany();

  for (const product of allProducts) {
    // Ana lot: uzun vadeli, sağlıklı stok.
    await prisma.lot.create({
      data: {
        productId: product.id,
        lotNumber: `${product.sku}-A`,
        expirationDate: daysFromNow(90),
        movements: {
          create: { type: "GIRIS", quantityKg: product.kgPerUnit.mul(20), note: "Üretimden ilk giriş" },
        },
      },
    });

    // İkinci lot: yakında SKT'si dolacak (dashboard uyarısını tetikler).
    await prisma.lot.create({
      data: {
        productId: product.id,
        lotNumber: `${product.sku}-B`,
        expirationDate: daysFromNow(10),
        movements: {
          create: { type: "GIRIS", quantityKg: product.kgPerUnit.mul(5), note: "Önceki parti" },
        },
      },
    });
  }

  // Lor Peyniri'ne süresi geçmiş bir lot ekle — FEFO/SKT engelinin
  // admin panelde nasıl göründüğünü kanıtlamak için (sevk edilemez, uyarı görünür).
  const lor = allProducts.find((p) => p.slug === "lor-peyniri-1kg");
  if (lor) {
    await prisma.lot.create({
      data: {
        productId: lor.id,
        lotNumber: `${lor.sku}-EXP`,
        expirationDate: daysFromNow(-3),
        movements: {
          create: { type: "GIRIS", quantityKg: 4, note: "Satılamadan kalan parti" },
        },
      },
    });
  }

  console.log(`Seeded lots for ${allProducts.length} product(s).`);
}

async function main() {
  await seedLeads();
  await seedCatalog();
  await seedAccountTypes();
  await seedLeadActivities();
  await seedInventory();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
