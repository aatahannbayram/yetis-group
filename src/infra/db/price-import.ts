import { prisma } from "@/infra/db/client";
import type { ParsedPriceRow } from "@/domain/pricing/price-excel";
import { updateVariantBasePrice, upsertPriceListItem } from "@/infra/db/pricing";

export type PriceImportResult = {
  baseUpdated: number;
  listUpdated: number;
  skipped: number;
  errors: string[];
  warnings: string[];
};

export type PriceImportOptions = {
  /** Liste sütunu boş ve baz fiyat güncellendiyse eksik liste kalemlerini baz fiyattan doldur */
  fillMissingListPricesFromBase?: boolean;
  priceListIds?: string[];
};

export async function importPriceRows(
  rows: ParsedPriceRow[],
  options?: PriceImportOptions,
): Promise<PriceImportResult> {
  const result: PriceImportResult = {
    baseUpdated: 0,
    listUpdated: 0,
    skipped: 0,
    errors: [],
    warnings: [],
  };

  const listIds =
    options?.priceListIds ??
    (await prisma.priceList.findMany({ select: { id: true } })).map((l) => l.id);

  for (const row of rows) {
    try {
      const variant = await prisma.productVariant.findUnique({
        where: { sku: row.sku },
        select: { id: true, pricePerUnitKurus: true },
      });
      if (!variant) {
        result.errors.push(`Satır ${row.rowNumber}: stok kodu bulunamadı (${row.sku})`);
        result.skipped += 1;
        continue;
      }

      let baseKurus: number | null = null;
      if (row.basePriceTl != null) {
        baseKurus = Math.round(row.basePriceTl * 100);
        if (baseKurus !== variant.pricePerUnitKurus) {
          await updateVariantBasePrice(variant.id, baseKurus);
          result.baseUpdated += 1;
        }
      }

      for (const [priceListId, priceTl] of Object.entries(row.listPrices)) {
        if (priceTl == null) continue;
        await upsertPriceListItem(priceListId, variant.id, Math.round(priceTl * 100));
        result.listUpdated += 1;
      }

      if (options?.fillMissingListPricesFromBase && baseKurus != null) {
        const existing = await prisma.priceListItem.findMany({
          where: { variantId: variant.id, priceListId: { in: listIds } },
          select: { priceListId: true, priceKurus: true },
        });
        const byList = new Map(existing.map((e) => [e.priceListId, e.priceKurus]));
        for (const priceListId of listIds) {
          if (row.listPrices[priceListId] != null) continue;
          const current = byList.get(priceListId);
          if (current == null || current === 0) {
            await upsertPriceListItem(priceListId, variant.id, baseKurus);
            result.listUpdated += 1;
          }
        }
      }
    } catch (e) {
      result.errors.push(
        `Satır ${row.rowNumber} (${row.sku}): ${e instanceof Error ? e.message : "hata"}`,
      );
      result.skipped += 1;
    }
  }

  return result;
}
