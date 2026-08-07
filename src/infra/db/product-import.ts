import { prisma } from "@/infra/db/client";
import { slugifyTr } from "@/domain/catalog/slug";
import type { PackagingType } from "@/generated/prisma";
import type { ParsedProductRow } from "@/domain/catalog/product-excel";
import { normalizeHeader, parseBool, parseNumber } from "@/domain/catalog/product-excel";
import { addProductMedia } from "@/infra/db/media";
import { upsertProductAttributeValue } from "@/infra/db/attributes";
import { saveImageFromUrl } from "@/infra/storage/fetch-image";
import type { AttributeDefForImport } from "@/infra/export/products-excel";

export type ProductImportResult = {
  created: number;
  updated: number;
  variantsCreated: number;
  imagesSaved: number;
  attributesSet: number;
  skipped: number;
  errors: string[];
  warnings: string[];
};

async function uniqueSlug(base: string): Promise<string> {
  const root = slugifyTr(base) || "urun";
  let slug = root;
  let n = 0;
  while (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
    n += 1;
    slug = `${root}-${n}`;
  }
  return slug;
}

function findByName<T extends { id: string; name: string }>(
  items: T[],
  name: string | null,
): T | null {
  if (!name?.trim()) return null;
  const n = normalizeHeader(name);
  return items.find((i) => normalizeHeader(i.name) === n) ?? null;
}

async function applyAttributes(
  productId: string,
  values: Record<string, string>,
  defs: AttributeDefForImport[],
  warnings: string[],
  rowNumber: number,
): Promise<number> {
  let count = 0;
  const byId = new Map(defs.map((d) => [d.id, d]));

  for (const [attributeId, raw] of Object.entries(values)) {
    const def = byId.get(attributeId);
    if (!def || !raw.trim()) continue;

    try {
      if (def.type === "BOOLEAN") {
        const b = parseBool(raw);
        if (b == null) {
          warnings.push(`Satır ${rowNumber}: «${def.name}» için Evet/Hayır bekleniyor`);
          continue;
        }
        await upsertProductAttributeValue({ productId, attributeId, valueBoolean: b });
      } else if (def.type === "NUMBER") {
        const n = parseNumber(raw);
        if (n == null) {
          warnings.push(`Satır ${rowNumber}: «${def.name}» sayı olmalı`);
          continue;
        }
        await upsertProductAttributeValue({ productId, attributeId, valueNumber: n });
      } else if (def.type === "SELECT" || def.type === "MULTI_SELECT") {
        const parts =
          def.type === "MULTI_SELECT"
            ? raw.split(/[,;|]/).map((s) => s.trim()).filter(Boolean)
            : [raw.trim()];
        const optionIds: string[] = [];
        for (const part of parts) {
          const pn = normalizeHeader(part);
          const opt = def.options.find(
            (o) => normalizeHeader(o.label) === pn || normalizeHeader(o.value) === pn,
          );
          if (opt) optionIds.push(opt.id);
          else warnings.push(`Satır ${rowNumber}: «${def.name}» seçeneği bulunamadı: ${part}`);
        }
        if (optionIds.length) {
          await upsertProductAttributeValue({ productId, attributeId, optionIds });
        }
      } else {
        await upsertProductAttributeValue({
          productId,
          attributeId,
          valueText: raw.trim(),
        });
      }
      count += 1;
    } catch (e) {
      warnings.push(
        `Satır ${rowNumber}: özellik «${def.name}» yazılamadı — ${e instanceof Error ? e.message : "hata"}`,
      );
    }
  }
  return count;
}

async function attachImages(
  productId: string,
  urls: string[],
  warnings: string[],
  rowNumber: number,
): Promise<number> {
  let saved = 0;
  const existing = await prisma.productMedia.findMany({
    where: { productId },
    select: { url: true },
  });
  const existingSet = new Set(existing.map((m) => m.url));

  for (let i = 0; i < urls.length; i++) {
    const src = urls[i]!;
    try {
      const url = await saveImageFromUrl(src, "products");
      if (existingSet.has(url)) continue;
      // Also skip if same remote was already stored under different local path — check imageUrl on product
      await addProductMedia({
        productId,
        url,
        alt: null,
        isPrimary: existing.length + saved === 0 && i === 0,
      });
      existingSet.add(url);
      saved += 1;
    } catch (e) {
      warnings.push(
        `Satır ${rowNumber}: görsel alınamadı (${src.slice(0, 60)}) — ${e instanceof Error ? e.message : "hata"}`,
      );
    }
  }
  return saved;
}

export async function importProductRows(
  rows: ParsedProductRow[],
  options: {
    attributes: AttributeDefForImport[];
    defaultCategoryId?: string | null;
    defaultProducerId?: string | null;
  },
): Promise<ProductImportResult> {
  const result: ProductImportResult = {
    created: 0,
    updated: 0,
    variantsCreated: 0,
    imagesSaved: 0,
    attributesSet: 0,
    skipped: 0,
    errors: [],
    warnings: [],
  };

  const [categories, producers] = await Promise.all([
    prisma.category.findMany({ select: { id: true, name: true } }),
    prisma.producer.findMany({ select: { id: true, name: true } }),
  ]);

  const fallbackCategoryId =
    options.defaultCategoryId ?? categories[0]?.id ?? null;
  const fallbackProducerId =
    options.defaultProducerId ?? producers[0]?.id ?? null;

  if (!fallbackCategoryId || !fallbackProducerId) {
    result.errors.push("İçe aktarım için en az bir kategori ve üretici tanımlı olmalı");
    return result;
  }

  for (const row of rows) {
    try {
      const category =
        findByName(categories, row.category) ??
        (row.category
          ? null
          : categories.find((c) => c.id === fallbackCategoryId) ?? null);
      const producer =
        findByName(producers, row.producer) ??
        (row.producer
          ? null
          : producers.find((p) => p.id === fallbackProducerId) ?? null);

      if (row.category && !findByName(categories, row.category)) {
        result.warnings.push(
          `Satır ${row.rowNumber}: kategori «${row.category}» bulunamadı — varsayılan kullanıldı`,
        );
      }
      if (row.producer && !findByName(producers, row.producer)) {
        result.warnings.push(
          `Satır ${row.rowNumber}: üretici «${row.producer}» bulunamadı — varsayılan kullanıldı`,
        );
      }

      const categoryId = category?.id ?? fallbackCategoryId;
      const producerId = producer?.id ?? fallbackProducerId;
      const priceKurus = Math.round(row.priceTl * 100);
      const vatBp = Math.round(row.vatPercent * 100);
      const packagingType = row.packagingType as PackagingType;

      const existingVariant = await prisma.productVariant.findUnique({
        where: { sku: row.sku },
        include: { product: { select: { id: true } } },
      });

      let productId: string;

      if (existingVariant) {
        productId = existingVariant.productId;
        await prisma.productVariant.update({
          where: { id: existingVariant.id },
          data: {
            packagingType,
            packSize: row.packSize,
            unitFactor: row.unitFactor,
            moq: row.moq,
            pricePerUnitKurus: priceKurus,
            vatRateBasisPoints: vatBp,
            barcode: row.barcode,
            isActive: row.active,
          },
        });
        await prisma.product.update({
          where: { id: productId },
          data: {
            name: row.name,
            description: row.description,
            active: row.active,
            producerId,
            primaryCategoryId: categoryId,
            storageCondition: row.storageCondition,
            shelfLifeDays: row.shelfLifeDays,
            ...(row.requiresColdChain != null
              ? { requiresColdChain: row.requiresColdChain }
              : {}),
            ...(row.usageTips != null ? { usageTips: row.usageTips } : {}),
          },
        });
        await prisma.productCategory.upsert({
          where: {
            productId_categoryId: { productId, categoryId },
          },
          create: { productId, categoryId },
          update: {},
        });
        result.updated += 1;
      } else {
        // Same product name → add variant; else create product
        const byName = await prisma.product.findFirst({
          where: { name: { equals: row.name, mode: "insensitive" } },
          select: { id: true },
        });

        if (byName) {
          productId = byName.id;
          await prisma.productVariant.create({
            data: {
              productId,
              sku: row.sku,
              packagingType,
              packSize: row.packSize,
              unitFactor: row.unitFactor,
              moq: row.moq,
              pricePerUnitKurus: priceKurus,
              vatRateBasisPoints: vatBp,
              barcode: row.barcode,
              isActive: row.active,
            },
          });
          await prisma.product.update({
            where: { id: productId },
            data: {
              description: row.description || undefined,
              producerId,
              primaryCategoryId: categoryId,
              storageCondition: row.storageCondition ?? undefined,
              shelfLifeDays: row.shelfLifeDays ?? undefined,
              ...(row.requiresColdChain != null
                ? { requiresColdChain: row.requiresColdChain }
                : {}),
              ...(row.usageTips != null ? { usageTips: row.usageTips } : {}),
            },
          });
          result.variantsCreated += 1;
          result.updated += 1;
        } else {
          const slug = await uniqueSlug(row.name);
          const created = await prisma.product.create({
            data: {
              name: row.name,
              slug,
              description: row.description,
              active: row.active,
              producerId,
              primaryCategoryId: categoryId,
              storageCondition: row.storageCondition,
              shelfLifeDays: row.shelfLifeDays,
              requiresColdChain: row.requiresColdChain ?? true,
              usageTips: row.usageTips ?? "",
              categories: { create: { categoryId } },
              variants: {
                create: {
                  sku: row.sku,
                  packagingType,
                  packSize: row.packSize,
                  unitFactor: row.unitFactor,
                  moq: row.moq,
                  pricePerUnitKurus: priceKurus,
                  vatRateBasisPoints: vatBp,
                  barcode: row.barcode,
                  isActive: row.active,
                },
              },
            },
          });
          productId = created.id;
          result.created += 1;
        }
      }

      result.attributesSet += await applyAttributes(
        productId,
        row.attributes,
        options.attributes,
        result.warnings,
        row.rowNumber,
      );
      result.imagesSaved += await attachImages(
        productId,
        row.imageUrls,
        result.warnings,
        row.rowNumber,
      );
    } catch (e) {
      result.errors.push(
        `Satır ${row.rowNumber} (${row.sku}): ${e instanceof Error ? e.message : "hata"}`,
      );
      result.skipped += 1;
    }
  }

  return result;
}
