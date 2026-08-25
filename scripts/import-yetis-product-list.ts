/**
 * WhatsApp "Yetiş Grup ayrıntılı ürün listesi.xlsx" dosyasını kataloga aktarır.
 *
 * Kullanım:
 *   pnpm tsx scripts/import-yetis-product-list.ts
 *   pnpm tsx scripts/import-yetis-product-list.ts --dry-run
 *   pnpm tsx scripts/import-yetis-product-list.ts --convert-only
 *   pnpm tsx scripts/import-yetis-product-list.ts --file data/baska-liste.xlsx
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import { slugifyTr } from "../src/domain/catalog/slug";
import {
  convertYetisDetailedList,
  readYetisDetailedListFromSheet,
} from "../src/domain/catalog/yetis-detailed-product-list";
import { ensurePackagingAttribute, listAttributeDefinitions } from "../src/infra/db/attributes";
import { prisma } from "../src/infra/db/client";
import { importProductRows } from "../src/infra/db/product-import";
import { buildProductsExcel } from "../src/infra/export/products-excel";

const DEFAULT_INPUT = path.join(
  process.cwd(),
  "data/yetis-grup-urun-listesi.xlsx",
);
const DEFAULT_OUTPUT = path.join(
  process.cwd(),
  "data/yetis-grup-urun-listesi-import.xlsx",
);

function argValue(flag: string): string | null {
  const i = process.argv.indexOf(flag);
  if (i === -1) return null;
  return process.argv[i + 1] ?? null;
}

function titleCaseTr(input: string): string {
  return input
    .trim()
    .split(/\s+/)
    .map((part) => {
      if (!part) return part;
      const lower = part.toLocaleLowerCase("tr-TR");
      return lower.charAt(0).toLocaleUpperCase("tr-TR") + lower.slice(1);
    })
    .join(" ");
}

async function uniqueCategorySlug(base: string): Promise<string> {
  const root = slugifyTr(base) || "kategori";
  let slug = root;
  let n = 0;
  while (await prisma.category.findUnique({ where: { slug }, select: { id: true } })) {
    n += 1;
    slug = `${root}-${n}`;
  }
  return slug;
}

async function uniqueProducerSlug(base: string): Promise<string> {
  const root = slugifyTr(base) || "uretici";
  let slug = root;
  let n = 0;
  while (await prisma.producer.findUnique({ where: { slug }, select: { id: true } })) {
    n += 1;
    slug = `${root}-${n}`;
  }
  return slug;
}

async function ensureCategoryTree(
  mainName: string,
  subName: string,
): Promise<{ mainId: string; subId: string }> {
  const mainTitle = titleCaseTr(mainName);
  const subTitle = titleCaseTr(subName || mainName);

  let main = await prisma.category.findFirst({
    where: { name: { equals: mainTitle, mode: "insensitive" }, parentId: null },
  });
  if (!main) {
    main = await prisma.category.create({
      data: {
        name: mainTitle,
        slug: await uniqueCategorySlug(mainTitle),
        sortOrder: 0,
        active: true,
      },
    });
    console.log(`+ Kategori: ${mainTitle}`);
  }

  let sub = await prisma.category.findFirst({
    where: {
      name: { equals: subTitle, mode: "insensitive" },
      parentId: main.id,
    },
  });
  if (!sub) {
    sub = await prisma.category.create({
      data: {
        name: subTitle,
        slug: await uniqueCategorySlug(subTitle),
        parentId: main.id,
        sortOrder: 0,
        active: true,
      },
    });
    console.log(`+ Alt kategori: ${mainTitle} › ${subTitle}`);
  }

  return { mainId: main.id, subId: sub.id };
}

async function ensureProducer(name: string): Promise<string> {
  const title = titleCaseTr(name);
  const existing = await prisma.producer.findFirst({
    where: { name: { equals: title, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.producer.create({
    data: {
      name: title,
      slug: await uniqueProducerSlug(title),
      story: "",
    },
  });
  console.log(`+ Üretici: ${title}`);
  return created.id;
}

async function readSourceWorkbook(filePath: string) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Dosya bulunamadı: ${filePath}`);
  }
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error("Excel sayfası bulunamadı");
  return { workbook, sheet };
}

async function writeImportWorkbook(rows: ReturnType<typeof convertYetisDetailedList>, outPath: string) {
  const exportRows = rows.map((r) => ({
    name: r.name,
    description: r.description,
    active: r.active,
    categoryName: r.category ?? "",
    producerName: r.producer ?? "",
    storageCondition: r.storageCondition,
    shelfLifeDays: r.shelfLifeDays,
    requiresColdChain: r.requiresColdChain ?? true,
    usageTips: r.usageTips ?? "",
    imageUrls: r.imageUrls,
    variant: {
      sku: r.sku,
      barcode: r.barcode,
      packagingType: r.packagingType,
      packSize: r.packSize,
      unitFactor: String(r.unitFactor),
      moq: r.moq,
      pricePerUnitKurus: Math.round(r.priceTl * 100),
      vatRateBasisPoints: Math.round(r.vatPercent * 100),
      isActive: r.active,
    },
    attributes: {},
  }));

  const buffer = await buildProductsExcel(exportRows, []);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buffer);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const convertOnly = process.argv.includes("--convert-only");
  const inputPath = argValue("--file") ?? DEFAULT_INPUT;
  const outputPath = argValue("--out") ?? DEFAULT_OUTPUT;

  console.log(`Kaynak: ${inputPath}`);
  const { sheet } = await readSourceWorkbook(inputPath);
  const sourceRows = readYetisDetailedListFromSheet(
    (n) => sheet.getRow(n),
    sheet.rowCount,
  );
  const parsedRows = convertYetisDetailedList(sourceRows);

  console.log(`Okunan satır: ${sourceRows.length}`);
  console.log(`Dönüştürülen varyant: ${parsedRows.length}`);

  if (parsedRows.length === 0) {
    throw new Error("İçe aktarılacak ürün satırı yok");
  }

  await writeImportWorkbook(parsedRows, outputPath);
  console.log(`Panel şablonu yazıldı: ${outputPath}`);

  if (convertOnly) {
    console.log("Sadece dönüştürme tamamlandı (--convert-only).");
    return;
  }

  const categoryPairs = new Map<string, { main: string; sub: string }>();
  const brands = new Set<string>();
  for (const row of sourceRows) {
    if (row.mainCategory && row.subCategory) {
      categoryPairs.set(`${row.mainCategory}::${row.subCategory}`, {
        main: row.mainCategory,
        sub: row.subCategory,
      });
    }
    if (row.brand.trim()) brands.add(row.brand.trim());
  }

  if (dryRun) {
    console.log("\n--- Dry run özeti ---");
    console.log(`Ana/alt kategori çifti: ${categoryPairs.size}`);
    console.log(`Marka (üretici): ${brands.size}`);
    console.log("Örnek satırlar:");
    for (const r of parsedRows.slice(0, 3)) {
      console.log(`  ${r.sku} | ${r.name} | ${r.packSize} | ${r.packagingType}`);
    }
    console.log("\nDB yazımı atlandı (--dry-run).");
    return;
  }

  for (const pair of categoryPairs.values()) {
    await ensureCategoryTree(pair.main, pair.sub);
  }
  for (const brand of brands) {
    await ensureProducer(brand);
  }

  await ensurePackagingAttribute();
  const attrs = await listAttributeDefinitions();
  const attrDefs = attrs.map((a) => ({
    id: a.id,
    key: a.key,
    name: a.name,
    type: a.type,
    options: a.options.map((o) => ({ id: o.id, value: o.value, label: o.label })),
  }));

  const result = await importProductRows(parsedRows, { attributes: attrDefs });

  console.log("\n--- İçe aktarım sonucu ---");
  console.log(`Yeni ürün: ${result.created}`);
  console.log(`Güncellenen: ${result.updated}`);
  console.log(`Yeni varyant: ${result.variantsCreated}`);
  console.log(`Atlanan: ${result.skipped}`);
  if (result.warnings.length) {
    console.log(`Uyarı (${result.warnings.length}):`);
    for (const w of result.warnings.slice(0, 10)) console.log(`  - ${w}`);
    if (result.warnings.length > 10) {
      console.log(`  ... +${result.warnings.length - 10} uyarı daha`);
    }
  }
  if (result.errors.length) {
    console.log(`Hata (${result.errors.length}):`);
    for (const e of result.errors) console.log(`  - ${e}`);
    process.exitCode = 1;
  }
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
