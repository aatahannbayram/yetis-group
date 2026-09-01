"use server";

import { revalidatePath } from "next/cache";
import { revalidateStoreCatalog } from "@/lib/cache/store-catalog";
import { headers } from "next/headers";
import { updateVariantBasePrice } from "@/infra/db/pricing";
import { addStockMovement, createLot } from "@/infra/db/inventory";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import {
  addProductMedia,
  deleteProductMedia,
  reorderProductMedia,
  setPrimaryMedia,
} from "@/infra/db/media";
import { saveUploadedImage } from "@/infra/storage/local";
import { upsertProductAttributeValue, listAttributeDefinitions, isProductFacingAttribute, ensurePackagingAttribute } from "@/infra/db/attributes";
import {
  createProduct,
  createVariant,
  deactivateVariant,
  setProductActive,
  updateProductDescription,
  updateVariantPackaging,
} from "@/infra/db/products";
import { prisma } from "@/infra/db/client";
import { getAdminProductsPage, type ProductListQuery } from "@/infra/db/product-list-page";
import { upsertPriceListItem } from "@/infra/db/pricing";
import {
  buildProductsExcel,
  buildProductsExcelTemplate,
  mapProductsToExcelRows,
  parseProductsExcel,
} from "@/infra/export/products-excel";
import { importProductRows } from "@/infra/db/product-import";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
}

export async function updateVariantPriceAction(variantId: string, priceKurus: number) {
  await requireStaff();
  await updateVariantBasePrice(variantId, priceKurus);
  revalidatePath("/panel/urunler");
  revalidateStoreCatalog();
  revalidatePath("/urunler");
  revalidatePath("/panel/fiyat-listeleri");
}

export async function createProductAction(formData: FormData) {
  await requireStaff();

  const name = String(formData.get("name") ?? "").trim();
  const primaryCategoryId = String(formData.get("primaryCategoryId") ?? "").trim();
  const producerId = String(formData.get("producerId") ?? "").trim();
  const priceTl = Number(String(formData.get("priceTl") ?? "").replace(",", "."));
  const unitFactor = Number(String(formData.get("unitFactor") ?? "1").replace(",", "."));
  const vatPercent = Number(String(formData.get("vatPercent") ?? "1").replace(",", "."));
  const packagingType = String(formData.get("packagingType") ?? "KOLI");
  const moq = Number(String(formData.get("moq") ?? "1").replace(",", "."));
  const shelfLifeDays = Number(String(formData.get("shelfLifeDays") ?? "").replace(",", "."));

  if (!name) throw new Error("Ürün adı gerekli");
  if (!Number.isFinite(priceTl) || priceTl < 0) throw new Error("Geçerli bir fiyat girin");

  const product = await createProduct({
    name,
    description: String(formData.get("description") ?? ""),
    primaryCategoryId,
    producerId,
    sku: String(formData.get("sku") ?? "").trim() || undefined,
    barcode: String(formData.get("barcode") ?? "").trim() || null,
    packSize: String(formData.get("packSize") ?? "").trim() || null,
    packagingType,
    unitFactor: Number.isFinite(unitFactor) && unitFactor > 0 ? unitFactor : 1,
    moq: Number.isFinite(moq) && moq > 0 ? moq : 1,
    pricePerUnitKurus: Math.round(priceTl * 100),
    vatRateBasisPoints: Number.isFinite(vatPercent)
      ? Math.round(vatPercent * 100)
      : 100,
    storageCondition: String(formData.get("storageCondition") ?? "").trim() || null,
    shelfLifeDays: Number.isFinite(shelfLifeDays) && shelfLifeDays > 0 ? Math.round(shelfLifeDays) : null,
    requiresColdChain: formData.get("requiresColdChain") === "on",
    usageTips: String(formData.get("usageTips") ?? ""),
    techSheetUrl: String(formData.get("techSheetUrl") ?? "").trim() || null,
  });

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    const url = await saveUploadedImage(image, product.id);
    await addProductMedia({ productId: product.id, url, isPrimary: true });
  }

  revalidatePath("/panel/urunler");
  revalidateStoreCatalog();
  revalidatePath("/urunler");
  revalidatePath("/panel/b2b/katalog");
}

export async function createVariantAction(formData: FormData) {
  await requireStaff();

  const productId = String(formData.get("productId") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const priceTl = Number(String(formData.get("priceTl") ?? "").replace(",", "."));
  const unitFactor = Number(String(formData.get("unitFactor") ?? "1").replace(",", "."));
  const vatPercent = Number(String(formData.get("vatPercent") ?? "1").replace(",", "."));
  const moq = Number(String(formData.get("moq") ?? "1").replace(",", "."));
  const packagingType = String(formData.get("packagingType") ?? "KOLI");

  if (!productId) throw new Error("Ürün gerekli");
  if (!Number.isFinite(priceTl) || priceTl < 0) throw new Error("Geçerli bir fiyat girin");

  await createVariant({
    productId,
    sku: String(formData.get("sku") ?? "").trim() || undefined,
    packSize: String(formData.get("packSize") ?? "").trim() || null,
    packagingType,
    unitFactor: Number.isFinite(unitFactor) && unitFactor > 0 ? unitFactor : 1,
    pricePerUnitKurus: Math.round(priceTl * 100),
    vatRateBasisPoints: Number.isFinite(vatPercent) ? Math.round(vatPercent * 100) : 100,
    moq: Number.isFinite(moq) && moq > 0 ? Math.round(moq) : 1,
  });

  if (slug) {
    revalidatePath(`/panel/urunler/${slug}`);
    revalidatePath(`/urunler/${slug}`);
  }
  revalidatePath("/panel/urunler");
  revalidatePath("/panel/fiyat-listeleri");
  revalidateStoreCatalog();
  revalidatePath("/urunler");
}

export async function updateVariantPackagingAction(
  variantId: string,
  input: { packagingType: string; packSize: string; unitFactor: number },
  slug?: string,
) {
  await requireStaff();
  await updateVariantPackaging(variantId, {
    packagingType: input.packagingType,
    packSize: input.packSize.trim() || null,
    unitFactor: input.unitFactor,
  });
  if (slug) {
    revalidatePath(`/panel/urunler/${slug}`);
    revalidatePath(`/urunler/${slug}`);
  }
  revalidatePath("/panel/urunler");
  revalidatePath("/panel/fiyat-listeleri");
  revalidateStoreCatalog();
  revalidatePath("/urunler");
}

export async function deactivateVariantAction(variantId: string, slug?: string) {
  await requireStaff();
  await deactivateVariant(variantId);
  if (slug) {
    revalidatePath(`/panel/urunler/${slug}`);
    revalidatePath(`/urunler/${slug}`);
  }
  revalidatePath("/panel/urunler");
  revalidatePath("/panel/fiyat-listeleri");
  revalidateStoreCatalog();
  revalidatePath("/urunler");
}

export async function setProductActiveAction(productId: string, slug: string, active: boolean) {
  await requireStaff();
  await setProductActive(productId, active);
  revalidatePath(`/panel/urunler/${slug}`);
  revalidatePath(`/urunler/${slug}`);
  revalidatePath("/panel/urunler");
  revalidateStoreCatalog();
  revalidatePath("/urunler");
}

export async function updateGroupPriceAction(
  priceListId: string,
  variantId: string,
  priceKurus: number,
) {
  await requireStaff();
  await upsertPriceListItem(priceListId, variantId, priceKurus);
  revalidatePath("/panel/urunler");
  revalidatePath("/panel/fiyat-listeleri");
  revalidateStoreCatalog();
  revalidatePath("/urunler");
}

/** @deprecated use updateVariantPriceAction */
export async function updateProductPriceAction(variantId: string, priceKurus: number) {
  return updateVariantPriceAction(variantId, priceKurus);
}

export async function updateProductDescriptionAction(
  productId: string,
  slug: string,
  description: string,
) {
  await requireStaff();
  await updateProductDescription(productId, description);
  revalidatePath(`/panel/urunler/${slug}`);
  revalidatePath(`/urunler/${slug}`);
}

export async function createLotAction(
  variantId: string,
  slug: string,
  input: { lotNumber: string; expirationDate: string; initialKg: number },
) {
  await requireStaff();
  await createLot({
    variantId,
    lotNumber: input.lotNumber,
    expirationDate: new Date(input.expirationDate),
    initialKg: input.initialKg,
  });
  revalidatePath(`/panel/urunler/${slug}`);
  revalidatePath("/panel/stok");
  revalidatePath("/panel");
  revalidatePath("/bayi/siparis");
}

export async function addStockMovementAction(
  slug: string,
  input: { lotId: string; type: "GIRIS" | "CIKIS" | "FIRE"; quantityKg: number; note?: string },
) {
  await addStockMovement(input);
  revalidatePath(`/panel/urunler/${slug}`);
  revalidatePath("/panel/stok");
  revalidatePath("/panel");
  revalidatePath("/bayi/siparis");
  revalidatePath("/bayi/firsatlar");
}

export async function addMediaAction(formData: FormData) {
  await requireStaff();
  const productId = String(formData.get("productId") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  const slug = String(formData.get("slug") ?? "");
  if (!productId || !url) throw new Error("url gerekli");
  await addProductMedia({ productId, url });
  revalidatePath(`/panel/urunler/${slug}`);
  revalidatePath(`/urunler/${slug}`);
}

export async function uploadProductImageAction(formData: FormData) {
  await requireStaff();
  const productId = String(formData.get("productId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const file = formData.get("file");
  if (!productId || !slug) throw new Error("Ürün bulunamadı");
  if (!(file instanceof File)) throw new Error("Dosya gerekli");

  const url = await saveUploadedImage(file, productId);
  await addProductMedia({ productId, url });

  revalidatePath(`/panel/urunler/${slug}`);
  revalidatePath(`/urunler/${slug}`);
  revalidatePath("/panel/urunler");
}

export async function deleteMediaAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  await deleteProductMedia(id);
  revalidatePath(`/panel/urunler/${slug}`);
  revalidatePath(`/urunler/${slug}`);
}

export async function reorderMediaAction(productId: string, slug: string, orderedIds: string[]) {
  await requireStaff();
  await reorderProductMedia(productId, orderedIds);
  revalidatePath(`/panel/urunler/${slug}`);
  revalidatePath(`/urunler/${slug}`);
}

export async function setPrimaryMediaAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  await setPrimaryMedia(id);
  revalidatePath(`/panel/urunler/${slug}`);
  revalidatePath(`/urunler/${slug}`);
}

export async function saveProductDepthAction(formData: FormData) {
  await requireStaff();
  const productId = String(formData.get("productId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  await prisma.product.update({
    where: { id: productId },
    data: {
      storageCondition: String(formData.get("storageCondition") ?? "") || null,
      shelfLifeDays: Number(formData.get("shelfLifeDays") || 0) || null,
      requiresColdChain: formData.get("requiresColdChain") === "on",
      usageTips: String(formData.get("usageTips") ?? ""),
      techSheetUrl: String(formData.get("techSheetUrl") ?? "") || null,
    },
  });
  revalidatePath(`/panel/urunler/${slug}`);
  revalidatePath(`/urunler/${slug}`);
}

export async function saveAttributeValueAction(formData: FormData) {
  await requireStaff();
  const productId = String(formData.get("productId") ?? "");
  const attributeId = String(formData.get("attributeId") ?? "");
  const type = String(formData.get("type") ?? "");
  const slug = String(formData.get("slug") ?? "");

  if (type === "SELECT" || type === "MULTI_SELECT") {
    const optionIds = formData.getAll("optionIds").map(String);
    await upsertProductAttributeValue({
      productId,
      attributeId,
      optionIds: type === "SELECT" ? optionIds.slice(0, 1) : optionIds,
    });
  } else if (type === "BOOLEAN") {
    await upsertProductAttributeValue({
      productId,
      attributeId,
      valueBoolean: formData.get("valueBoolean") === "on",
    });
  } else if (type === "NUMBER") {
    await upsertProductAttributeValue({
      productId,
      attributeId,
      valueNumber: Number(formData.get("valueNumber") || 0),
    });
  } else {
    await upsertProductAttributeValue({
      productId,
      attributeId,
      valueText: String(formData.get("valueText") ?? ""),
    });
  }

  revalidatePath(`/panel/urunler/${slug}`);
  revalidatePath(`/urunler/${slug}`);
}

type ExcelFileResult =
  | { ok: true; base64: string; filename: string; mime: string }
  | { ok: false; error: string };

export async function exportProductsExcelAction(): Promise<ExcelFileResult> {
  await requireStaff();
  try {
    const [products, attrs] = await Promise.all([
      prisma.product.findMany({
        orderBy: { name: "asc" },
        include: {
          primaryCategory: true,
          producer: true,
          media: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
          variants: { orderBy: { sortOrder: "asc" } },
          attributeValues: {
            include: {
              attribute: true,
              selectedOptions: { include: { option: true } },
            },
          },
        },
      }),
      listAttributeDefinitions(),
    ]);

    const { rows, attributeNames } = mapProductsToExcelRows(
      products.map((p) => ({
        name: p.name,
        description: p.description,
        active: p.active,
        storageCondition: p.storageCondition,
        shelfLifeDays: p.shelfLifeDays,
        requiresColdChain: p.requiresColdChain,
        usageTips: p.usageTips,
        imageUrl: p.imageUrl,
        primaryCategory: p.primaryCategory,
        producer: p.producer,
        media: p.media,
        variants: p.variants.map((v) => ({
          sku: v.sku,
          barcode: v.barcode,
          packagingType: v.packagingType,
          packSize: v.packSize,
          unitFactor: v.unitFactor.toString(),
          moq: v.moq,
          pricePerUnitKurus: v.pricePerUnitKurus,
          vatRateBasisPoints: v.vatRateBasisPoints,
          isActive: v.isActive,
        })),
        attributeValues: p.attributeValues,
      })),
    );

    const names =
      attributeNames.length > 0
        ? attributeNames.filter((n) => {
            const def = attrs.find((a) => a.name === n);
            return !def || isProductFacingAttribute(def.key);
          })
        : attrs
            .filter((a) => isProductFacingAttribute(a.key))
            .map((a) => a.name)
            .sort((a, b) => a.localeCompare(b, "tr"));

    const buffer = await buildProductsExcel(rows, names);
    const stamp = new Date().toISOString().slice(0, 10);
    return {
      ok: true,
      base64: buffer.toString("base64"),
      filename: `yetis-urunler-${stamp}.xlsx`,
      mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Dışa aktarım başarısız" };
  }
}

export async function downloadProductsExcelTemplateAction(): Promise<ExcelFileResult> {
  await requireStaff();
  try {
    const attrs = await listAttributeDefinitions();
    const buffer = await buildProductsExcelTemplate(
      attrs
        .filter((a) => isProductFacingAttribute(a.key))
        .map((a) => a.name)
        .sort((a, b) => a.localeCompare(b, "tr")),
    );
    return {
      ok: true,
      base64: buffer.toString("base64"),
      filename: "yetis-urun-sablon.xlsx",
      mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Şablon oluşturulamadı" };
  }
}

export type ProductImportActionResult =
  | {
      ok: true;
      created: number;
      updated: number;
      variantsCreated: number;
      imagesSaved: number;
      attributesSet: number;
      skipped: number;
      errors: string[];
      warnings: string[];
    }
  | { ok: false; error: string };

export async function importProductsExcelAction(
  formData: FormData,
): Promise<ProductImportActionResult> {
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

    const buffer = Buffer.from(await file.arrayBuffer());
    await ensurePackagingAttribute();
    const attrs = await listAttributeDefinitions();
    const attrDefs = attrs.map((a) => ({
      id: a.id,
      key: a.key,
      name: a.name,
      type: a.type,
      options: a.options.map((o) => ({ id: o.id, value: o.value, label: o.label })),
    }));

    const { rows, errors: parseErrors } = await parseProductsExcel(buffer, attrDefs);
    if (rows.length === 0 && parseErrors.length === 0) {
      return { ok: false, error: "Dosyada içe aktarılacak satır yok" };
    }

    const result = await importProductRows(rows, { attributes: attrDefs });
    result.errors = [...parseErrors, ...result.errors];

    revalidatePath("/panel/urunler");
    revalidateStoreCatalog();
  revalidatePath("/urunler");
    revalidatePath("/panel/b2b/katalog");

    return {
      ok: true,
      created: result.created,
      updated: result.updated,
      variantsCreated: result.variantsCreated,
      imagesSaved: result.imagesSaved,
      attributesSet: result.attributesSet,
      skipped: result.skipped,
      errors: result.errors.slice(0, 40),
      warnings: result.warnings.slice(0, 40),
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "İçe aktarım başarısız" };
  }
}

export async function loadAdminProductsPageAction(input: ProductListQuery = {}) {
  return getAdminProductsPage(input);
}
