import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  Check,
  ExternalLink,
  Images,
  Info,
  Layers3,
  PackageSearch,
  Tags,
  TrendingUp,
} from "lucide-react";
import { getProductBySlug, defaultVariant } from "@/infra/db/products";
import { getLotsForVariant, getProductStockSummary } from "@/infra/db/inventory";
import { listAttributeDefinitions } from "@/infra/db/attributes";
import { getGroupPricesForVariants } from "@/infra/db/pricing";
import { LotManager } from "@/components/admin/lot-manager";
import { ProductGallery } from "@/components/admin/product-gallery";
import { ProductVariantPricing } from "@/components/admin/product-variant-pricing";
import { StatCard } from "@/components/admin/stat-card";
import {
  DescriptionField,
  ProductDetailEditor,
  TrackedForm,
} from "@/components/admin/product-detail-editor";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { cinsLine } from "@/lib/format/packaging";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  addMediaAction,
  deleteMediaAction,
  reorderMediaAction,
  setPrimaryMediaAction,
  uploadProductImageAction,
  saveProductDepthAction,
  saveAttributeValueAction,
  updateProductDescriptionAction,
} from "../actions";

const DAY_MS = 24 * 60 * 60 * 1000;

const fieldClass =
  "h-10 rounded-lg border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus-visible:border-[#1B5E3A] focus-visible:ring-[#1B5E3A]/20 disabled:cursor-not-allowed disabled:border-stone-200 disabled:bg-stone-50 disabled:text-stone-400 disabled:opacity-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:disabled:bg-zinc-950 dark:disabled:text-zinc-500";

const cardClass =
  "rounded-xl border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900";

const labelClass = "text-sm font-medium text-stone-700 dark:text-zinc-300";

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const variant = defaultVariant(product);
  if (!variant) notFound();

  const [lots, stock, attributes, groupPricing] = await Promise.all([
    getLotsForVariant(variant.id),
    getProductStockSummary(product.id),
    listAttributeDefinitions(),
    getGroupPricesForVariants(product.variants.map((v) => v.id)),
  ]);

  const groupPriceMap: Record<string, number | null> = {};
  for (const list of groupPricing.lists) {
    for (const v of product.variants) {
      groupPriceMap[`${list.id}:${v.id}`] = groupPricing.getPrice(list.id, v.id);
    }
  }

  const valueByAttr = new Map(product.attributeValues.map((v) => [v.attributeId, v]));
  const saveDescription = updateProductDescriptionAction.bind(null, product.id, slug);
  const expiringSoonCount = lots.filter(
    (l) => !l.expired && (l.expirationDate.getTime() - Date.now()) / DAY_MS <= 14,
  ).length;

  return (
    <div className="-mx-3 -my-4 bg-stone-50 px-3 py-4 sm:-mx-4 sm:-my-5 sm:px-4 sm:py-5 md:-m-6 md:p-6 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl space-y-6 text-stone-900 dark:text-zinc-100">
      <Link
        href="/panel/urunler"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Ürünlere dön
      </Link>

      {/* Hero */}
      <div className={cardClass}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-50 sm:size-24 dark:border-zinc-800 dark:bg-zinc-950">
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="96px" />
              ) : (
                <div className="flex size-full items-center justify-center text-stone-400">
                  <PackageSearch className="size-6" aria-hidden />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-stone-500 dark:bg-zinc-800 dark:text-zinc-400">
                  {variant.sku}
                </span>
                {!product.active ? (
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600 dark:bg-zinc-800 dark:text-zinc-400">
                    Pasif
                  </span>
                ) : null}
              </div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900 dark:text-zinc-50">
                {product.name}
              </h1>
              <p className="mt-1 truncate text-sm text-stone-500 dark:text-zinc-400">
                {product.primaryCategory.name} &middot;{" "}
                {cinsLine(
                  product.variants.map((v) => ({
                    packSize: v.packSize,
                    packagingType: v.packagingType,
                    unitFactor: v.unitFactor.toString(),
                  })),
                )}
                {" · "}Üretici: {product.producer.name}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-row items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-1.5">
            <div className="text-left sm:text-right">
              <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">Baz Fiyat</p>
              <p className="text-2xl font-semibold tabular-nums text-stone-900 dark:text-zinc-50">
                {formatMoney(money(variant.pricePerUnitKurus))}
              </p>
            </div>
            <a
              href={`/urunler/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-[#1B5E3A] dark:text-zinc-400"
            >
              Mağazada gör
              <ExternalLink className="size-3" aria-hidden />
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Sevk edilebilir"
          value={Math.round(stock.shippableKg.toNumber())}
          suffix=" kg"
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          label="Fire adayı"
          value={Math.round(stock.expiredOnHandKg.toNumber())}
          suffix=" kg"
          icon={AlertTriangle}
          tone={stock.expiredOnHandKg.toNumber() > 0 ? "danger" : "neutral"}
        />
        <StatCard label="Lot Sayısı" value={stock.lotCount} icon={Layers3} />
        <StatCard
          label="SKT Yaklaşan (14 gün)"
          value={expiringSoonCount}
          icon={AlertTriangle}
          tone={expiringSoonCount > 0 ? "warning" : "neutral"}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="genel">
        <TabsList className="border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <TabsTrigger value="genel" className="data-[state=active]:text-[#1B5E3A]">
            <Info className="size-3.5" aria-hidden />
            Genel Bilgi
          </TabsTrigger>
          <TabsTrigger value="fiyat" className="data-[state=active]:text-[#1B5E3A]">
            <Tags className="size-3.5" aria-hidden />
            Fiyat &amp; Varyantlar
          </TabsTrigger>
          <TabsTrigger value="gorseller" className="data-[state=active]:text-[#1B5E3A]">
            <Images className="size-3.5" aria-hidden />
            Görseller
            {product.media.length > 0 ? (
              <span className="tabular-nums text-stone-500">({product.media.length})</span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="stok" className="data-[state=active]:text-[#1B5E3A]">
            <Boxes className="size-3.5" aria-hidden />
            Stok &amp; Lot
          </TabsTrigger>
        </TabsList>

        <TabsContent value="genel" forceMount className="space-y-6 data-[state=inactive]:hidden">
          <ProductDetailEditor>
            <section className={cardClass}>
              <h2 className="text-base font-semibold text-stone-900 dark:text-zinc-50">Açıklama</h2>
              <div className="mt-3">
                <DescriptionField
                  id="description"
                  initialValue={product.description}
                  onSave={saveDescription}
                  placeholder="Ürün açıklaması eklenmemiş. Mağazada gösterilecek metni yazmak için tıklayın"
                />
              </div>
            </section>

            <section className={cn(cardClass, "mt-6")}>
              <h2 className="text-base font-semibold text-stone-900 dark:text-zinc-50">
                Saklama &amp; kullanım
              </h2>
              <TrackedForm
                id="depth"
                action={saveProductDepthAction}
                className="mt-4 grid gap-4 sm:grid-cols-2"
              >
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="slug" value={slug} />
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="storageCondition" className={labelClass}>
                    Saklama koşulu
                  </Label>
                  <Input
                    id="storageCondition"
                    name="storageCondition"
                    defaultValue={product.storageCondition ?? ""}
                    className={fieldClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="shelfLifeDays" className={labelClass}>
                    Raf ömrü (gün)
                  </Label>
                  <Input
                    id="shelfLifeDays"
                    name="shelfLifeDays"
                    type="number"
                    defaultValue={product.shelfLifeDays ?? ""}
                    className={fieldClass}
                  />
                </div>
                <label className="group flex min-h-10 cursor-pointer items-center gap-2.5 self-end rounded-lg border border-stone-200 bg-white px-3 has-[:checked]:border-[#1B5E3A] dark:border-zinc-800 dark:bg-zinc-900">
                  <input
                    type="checkbox"
                    name="requiresColdChain"
                    defaultChecked={product.requiresColdChain}
                    className="sr-only"
                  />
                  <span className="flex size-4 shrink-0 items-center justify-center rounded border border-stone-300 bg-white group-has-[:checked]:border-[#1B5E3A] group-has-[:checked]:bg-[#1B5E3A] dark:border-zinc-600">
                    <Check className="size-3 text-white opacity-0 group-has-[:checked]:opacity-100" aria-hidden />
                  </span>
                  <span className="text-sm text-stone-700 dark:text-zinc-300">Soğuk zincir zorunlu</span>
                </label>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="usageTips" className={labelClass}>
                    Kullanım önerileri
                  </Label>
                  <textarea
                    id="usageTips"
                    name="usageTips"
                    rows={3}
                    defaultValue={product.usageTips}
                    className={cn(
                      "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus-visible:border-[#1B5E3A] focus-visible:ring-4 focus-visible:ring-[#1B5E3A]/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100",
                    )}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="techSheetUrl" className={labelClass}>
                    Teknik föy URL
                  </Label>
                  <Input
                    id="techSheetUrl"
                    name="techSheetUrl"
                    defaultValue={product.techSheetUrl ?? ""}
                    className={fieldClass}
                    placeholder="https://"
                  />
                  <p className="text-xs text-stone-500 dark:text-zinc-500">
                    Opsiyonel. Harici PDF veya belge bağlantısı, dosya yükleme bu ekrandan değil.
                  </p>
                </div>
              </TrackedForm>
            </section>

            <section className="mt-6 space-y-4">
              <div className="border-t border-stone-200 pt-6 dark:border-zinc-800">
                <h2 className="text-base font-semibold text-stone-900 dark:text-zinc-50">Nitelikler</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {attributes.map((attr) => {
                  const current = valueByAttr.get(attr.id);
                  const selected = new Set(current?.selectedOptions.map((s) => s.optionId) ?? []);
                  return (
                    <TrackedForm
                      key={attr.id}
                      id={`attr-${attr.id}`}
                      action={saveAttributeValueAction}
                      className={cardClass}
                    >
                      <input type="hidden" name="productId" value={product.id} />
                      <input type="hidden" name="attributeId" value={attr.id} />
                      <input type="hidden" name="type" value={attr.type} />
                      <input type="hidden" name="slug" value={slug} />
                      <p className="text-sm font-medium tracking-wide text-stone-500 uppercase dark:text-zinc-500">
                        {attr.name}
                      </p>
                      {attr.type === "TEXT" ? (
                        <Input
                          name="valueText"
                          className={cn("mt-3", fieldClass)}
                          defaultValue={current?.valueText ?? ""}
                        />
                      ) : null}
                      {attr.type === "NUMBER" ? (
                        <Input
                          name="valueNumber"
                          type="number"
                          step="any"
                          className={cn("mt-3", fieldClass)}
                          defaultValue={current?.valueNumber?.toString() ?? ""}
                        />
                      ) : null}
                      {attr.type === "BOOLEAN" ? (
                        <label className="group mt-3 inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 transition-colors has-[:checked]:border-green-600 has-[:checked]:bg-green-50 has-[:checked]:text-green-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:has-[:checked]:border-green-600 dark:has-[:checked]:bg-green-950/40 dark:has-[:checked]:text-green-400">
                          <input
                            type="checkbox"
                            name="valueBoolean"
                            defaultChecked={current?.valueBoolean ?? false}
                            className="sr-only"
                          />
                          <Check
                            className="size-3.5 opacity-0 group-has-[:checked]:opacity-100"
                            aria-hidden
                          />
                          Evet
                        </label>
                      ) : null}
                      {(attr.type === "SELECT" || attr.type === "MULTI_SELECT") && (
                        <div
                          className="mt-3 flex flex-wrap gap-2"
                          role={attr.type === "SELECT" ? "radiogroup" : "group"}
                          aria-label={attr.name}
                        >
                          {attr.options.map((opt) =>
                            attr.type === "SELECT" ? (
                              <label
                                key={opt.id}
                                className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-stone-200 bg-white px-3.5 text-sm text-stone-700 transition-colors has-[:checked]:border-[#1B5E3A] has-[:checked]:bg-[#1B5E3A] has-[:checked]:text-white has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[#1B5E3A]/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                              >
                                <input
                                  type="radio"
                                  name="optionIds"
                                  value={opt.id}
                                  defaultChecked={selected.has(opt.id)}
                                  className="sr-only"
                                />
                                {opt.label}
                              </label>
                            ) : (
                              <label
                                key={opt.id}
                                className="group inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 text-sm text-stone-700 transition-colors has-[:checked]:border-green-600 has-[:checked]:bg-green-50 has-[:checked]:text-green-700 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[#1B5E3A]/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:has-[:checked]:border-green-600 dark:has-[:checked]:bg-green-950/40 dark:has-[:checked]:text-green-400"
                              >
                                <input
                                  type="checkbox"
                                  name="optionIds"
                                  value={opt.id}
                                  defaultChecked={selected.has(opt.id)}
                                  className="sr-only"
                                />
                                <Check
                                  className="size-3.5 opacity-0 group-has-[:checked]:opacity-100"
                                  aria-hidden
                                />
                                {opt.label}
                              </label>
                            ),
                          )}
                        </div>
                      )}
                    </TrackedForm>
                  );
                })}
              </div>
            </section>
          </ProductDetailEditor>
        </TabsContent>

        <TabsContent value="fiyat">
          <ProductVariantPricing
            productId={product.id}
            slug={slug}
            variants={product.variants.map((v) => ({
              id: v.id,
              sku: v.sku,
              packSize: v.packSize,
              packagingType: v.packagingType,
              baseUnit: v.baseUnit,
              unitFactor: v.unitFactor.toString(),
              moq: v.moq,
              vatRateBasisPoints: v.vatRateBasisPoints,
              pricePerUnitKurus: v.pricePerUnitKurus,
            }))}
            priceLists={groupPricing.lists}
            groupPrices={groupPriceMap}
          />
        </TabsContent>

        <TabsContent value="gorseller">
          <section className={cardClass}>
            <ProductGallery
              productId={product.id}
              slug={slug}
              media={product.media}
              addMediaAction={addMediaAction}
              uploadImageAction={uploadProductImageAction}
              deleteMediaAction={deleteMediaAction}
              setPrimaryMediaAction={setPrimaryMediaAction}
              reorderMediaAction={reorderMediaAction}
            />
          </section>
        </TabsContent>

        <TabsContent value="stok">
          <p className="mb-4 text-sm text-stone-500 dark:text-zinc-400">
            Lotlar varyant (<code className="font-mono text-stone-700 dark:text-zinc-300">{variant.sku}</code>)
            seviyesindedir. Süresi geçmiş lottan satış/çıkış yapılamaz; eldeki miktar fire (imha) ile düşülür.
          </p>
          <LotManager
            variantId={variant.id}
            slug={product.slug}
            lots={lots.map((lot) => ({
              id: lot.id,
              lotNumber: lot.lotNumber,
              expirationDate: lot.expirationDate.toISOString(),
              expired: lot.expired,
              availableKg: lot.availableKg.toString(),
              movements: lot.movements.map((m) => ({
                id: m.id,
                type: m.type as "GIRIS" | "CIKIS" | "FIRE" | "REPACK",
                quantityKg: m.quantityKg.toString(),
                note: m.note,
                createdAt: m.createdAt.toISOString(),
              })),
            }))}
          />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
