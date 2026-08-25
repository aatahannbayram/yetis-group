"use server";

import { revalidatePath } from "next/cache";
import { revalidateStoreCatalog } from "@/lib/cache/store-catalog";
import { headers } from "next/headers";
import {
  createPriceList,
  fillAllPriceListsFromCatalog,
  fillPriceListFromCatalog,
  listVariantsForPriceExport,
  upsertPriceListItem,
} from "@/infra/db/pricing";
import { importPriceRows } from "@/infra/db/price-import";
import {
  buildPricesExcel,
  buildPricesExcelTemplate,
  parsePricesExcel,
} from "@/infra/export/prices-excel";
import { packLabel } from "@/lib/format/packaging";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
}

type ExcelFileResult =
  | { ok: true; base64: string; filename: string; mime: string }
  | { ok: false; error: string };

export async function exportPricesExcelAction(): Promise<ExcelFileResult> {
  await requireStaff();
  try {
    const { variants, lists, getListPriceKurus } = await listVariantsForPriceExport();
    const rows = variants.map((v) => ({
      sku: v.sku,
      productName: v.product.name,
      packLabel: packLabel(v.packSize, v.packagingType),
      basePriceTl: v.pricePerUnitKurus / 100,
      listPrices: Object.fromEntries(
        lists.map((l) => {
          const k = getListPriceKurus(l.id, v.id);
          return [l.id, k != null ? k / 100 : null] as const;
        }),
      ),
    }));
    const buffer = await buildPricesExcel(rows, lists);
    const stamp = new Date().toISOString().slice(0, 10);
    return {
      ok: true,
      base64: buffer.toString("base64"),
      filename: `yetis-fiyatlar-${stamp}.xlsx`,
      mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Dışa aktarım başarısız" };
  }
}

export async function downloadPricesExcelTemplateAction(): Promise<ExcelFileResult> {
  await requireStaff();
  try {
    const { lists } = await listVariantsForPriceExport();
    const buffer = await buildPricesExcelTemplate(lists);
    return {
      ok: true,
      base64: buffer.toString("base64"),
      filename: "yetis-fiyat-sablon.xlsx",
      mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Şablon oluşturulamadı" };
  }
}

export type PriceImportActionResult =
  | {
      ok: true;
      baseUpdated: number;
      listUpdated: number;
      skipped: number;
      errors: string[];
      warnings: string[];
    }
  | { ok: false; error: string };

export async function importPricesExcelAction(
  formData: FormData,
): Promise<PriceImportActionResult> {
  await requireStaff();
  try {
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { ok: false, error: "Excel dosyası gerekli (.xlsx)" };
    }
    const name = file.name.toLowerCase();
    if (!name.endsWith(".xlsx") && !name.endsWith(".xlsm")) {
      return { ok: false, error: "Yalnızca .xlsx dosyaları desteklenir" };
    }
    if (file.size > 15 * 1024 * 1024) {
      return { ok: false, error: "Dosya 15 MB sınırını aşıyor" };
    }

    const fillMissing = formData.get("fillMissingFromBase") === "1";
    const buffer = Buffer.from(await file.arrayBuffer());
    const { lists } = await listVariantsForPriceExport();
    const { rows, errors: parseErrors } = await parsePricesExcel(buffer, lists);
    if (rows.length === 0 && parseErrors.length === 0) {
      return { ok: false, error: "Dosyada güncellenecek fiyat satırı yok" };
    }

    const result = await importPriceRows(rows, {
      fillMissingListPricesFromBase: fillMissing,
      priceListIds: lists.map((l) => l.id),
    });
    result.errors = [...parseErrors, ...result.errors];

    revalidatePath("/panel/fiyat-listeleri");
    revalidatePath("/panel/urunler");
    revalidateStoreCatalog();
    revalidatePath("/urunler");
    revalidatePath("/bayi/siparis");

    return { ok: true, ...result };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "İçe aktarım başarısız" };
  }
}

export async function updatePriceListItemAction(
  priceListId: string,
  variantId: string,
  priceKurus: number,
) {
  await requireStaff();
  await upsertPriceListItem(priceListId, variantId, priceKurus);
  revalidatePath("/panel/fiyat-listeleri");
  revalidatePath("/panel/urunler");
  revalidateStoreCatalog();
  revalidatePath("/urunler");
}

export async function createPriceListAction(formData: FormData) {
  await requireStaff();
  const name = String(formData.get("name") ?? "").trim();
  await createPriceList({ name });
  revalidatePath("/panel/fiyat-listeleri");
  revalidatePath("/panel/urunler");
}

export async function fillPriceListAction(formData: FormData) {
  await requireStaff();
  const priceListId = String(formData.get("priceListId") ?? "").trim();
  if (!priceListId) throw new Error("Liste gerekli");
  const result = await fillPriceListFromCatalog(priceListId);
  revalidatePath("/panel/fiyat-listeleri");
  revalidatePath("/panel/urunler");
  return result;
}

export async function fillAllPriceListsAction() {
  await requireStaff();
  const result = await fillAllPriceListsFromCatalog();
  revalidatePath("/panel/fiyat-listeleri");
  revalidatePath("/panel/urunler");
  revalidateStoreCatalog();
  revalidatePath("/urunler");
  revalidatePath("/bayi/siparis");
  return result;
}

export async function addVariantToPriceListAction(formData: FormData) {
  await requireStaff();
  const priceListId = String(formData.get("priceListId") ?? "").trim();
  const variantId = String(formData.get("variantId") ?? "").trim();
  const priceTl = Number(String(formData.get("priceTl") ?? "").replace(",", "."));
  if (!priceListId || !variantId) throw new Error("Liste ve varyant gerekli");
  if (!Number.isFinite(priceTl) || priceTl < 0) throw new Error("Geçerli bir fiyat girin");
  await upsertPriceListItem(priceListId, variantId, Math.round(priceTl * 100));
  revalidatePath("/panel/fiyat-listeleri");
  revalidatePath("/panel/urunler");
  revalidateStoreCatalog();
  revalidatePath("/urunler");
  return { ok: true as const };
}
