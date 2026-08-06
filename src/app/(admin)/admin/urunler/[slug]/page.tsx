import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProductBySlug, defaultVariant } from "@/infra/db/products";
import { getLotsForVariant, getProductStockSummary } from "@/infra/db/inventory";
import { listAttributeDefinitions } from "@/infra/db/attributes";
import { LotManager } from "@/components/admin/lot-manager";
import { ProductGallery } from "@/components/admin/product-gallery";
import { EditableTextarea } from "@/components/admin/editable-textarea";
import { formatKg } from "@/lib/format/weight";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  addMediaAction,
  deleteMediaAction,
  setPrimaryMediaAction,
  saveProductDepthAction,
  saveAttributeValueAction,
  updateProductDescriptionAction,
} from "../actions";

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

  const [lots, stock, attributes] = await Promise.all([
    getLotsForVariant(variant.id),
    getProductStockSummary(product.id),
    listAttributeDefinitions(),
  ]);

  const valueByAttr = new Map(product.attributeValues.map((v) => [v.attributeId, v]));
  const saveDescription = updateProductDescriptionAction.bind(null, product.id, slug);

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <Link
        href="/admin/urunler"
        className="inline-flex items-center gap-1.5 text-caption text-muted-foreground transition-colors hover:text-brand-700"
      >
        <ArrowLeft className="size-3.5" />
        Ürünlere dön
      </Link>

      <div className="flex items-start gap-4">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={64}
            height={64}
            className="rounded-xl object-cover"
          />
        ) : (
          <div className="size-16 rounded-xl bg-muted" />
        )}
        <div>
          <p className="font-mono text-caption text-neutral-400">{variant.sku}</p>
          <h1 className="text-h2 leading-h2 font-semibold text-neutral-900">{product.name}</h1>
          <p className="text-body-sm text-neutral-500">
            {product.primaryCategory.name} &middot; {variant.packSize ?? variant.packagingType}{" "}
            &middot; {formatMoney(money(variant.pricePerUnitKurus))}
          </p>
          <p className="mt-1 text-caption text-neutral-400">Üretici: {product.producer.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-4">
          <p className="text-caption text-neutral-500">Toplam Stok</p>
          <p className="mt-1 text-h3 leading-h3 font-semibold text-neutral-900">
            {formatKg(stock.totalKg)}
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-4">
          <p className="text-caption text-neutral-500">Sevk Edilebilir</p>
          <p className="mt-1 text-h3 leading-h3 font-semibold text-brand-700">
            {formatKg(stock.shippableKg)}
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-4">
          <p className="text-caption text-neutral-500">Lot Sayısı</p>
          <p className="mt-1 text-h3 leading-h3 font-semibold text-neutral-900">{stock.lotCount}</p>
        </div>
      </div>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-h4 font-semibold">Açıklama</h2>
        <div className="mt-3">
          <EditableTextarea
            value={product.description}
            placeholder="Ürün açıklaması eklenmemiş — mağazada gösterilecek metni yazmak için tıklayın"
            onSave={saveDescription}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-h4 font-semibold">Varyantlar</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-body-sm">
            <thead>
              <tr className="border-b border-border text-caption text-muted-foreground">
                <th className="px-2 py-2 text-left font-medium">SKU</th>
                <th className="px-2 py-2 text-left font-medium">Paket</th>
                <th className="px-2 py-2 text-left font-medium">Birim / Katsayı</th>
                <th className="px-2 py-2 text-left font-medium">KDV</th>
                <th className="px-2 py-2 text-right font-medium">Fiyat</th>
              </tr>
            </thead>
            <tbody>
              {product.variants.map((v) => (
                <tr key={v.id} className="border-b border-border/60 last:border-0">
                  <td className="px-2 py-2 font-mono text-caption text-neutral-500">{v.sku}</td>
                  <td className="px-2 py-2 text-neutral-700">
                    {v.packSize ?? v.packagingType}
                  </td>
                  <td className="px-2 py-2 tabular-nums text-neutral-500">
                    {v.baseUnit} &middot; ×{v.unitFactor.toString()}
                  </td>
                  <td className="px-2 py-2 tabular-nums text-neutral-500">
                    %{(v.vatRateBasisPoints / 100).toString()}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums font-medium text-neutral-900">
                    {formatMoney(money(v.pricePerUnitKurus))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-h4 font-semibold">Galeri</h2>
        <div className="mt-4">
          <ProductGallery
            productId={product.id}
            slug={slug}
            media={product.media}
            addMediaAction={addMediaAction}
            deleteMediaAction={deleteMediaAction}
            setPrimaryMediaAction={setPrimaryMediaAction}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-h4 font-semibold">Saklama &amp; kullanım</h2>
        <form action={saveProductDepthAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="productId" value={product.id} />
          <input type="hidden" name="slug" value={slug} />
          <div className="space-y-1 sm:col-span-2">
            <label className="text-caption text-muted-foreground">Saklama koşulu</label>
            <Input name="storageCondition" defaultValue={product.storageCondition ?? ""} />
          </div>
          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">Raf ömrü (gün)</label>
            <Input
              name="shelfLifeDays"
              type="number"
              defaultValue={product.shelfLifeDays ?? ""}
            />
          </div>
          <label className="flex items-center gap-2 text-body-sm">
            <input
              type="checkbox"
              name="requiresColdChain"
              defaultChecked={product.requiresColdChain}
            />
            Soğuk zincir zorunlu
          </label>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-caption text-muted-foreground">Kullanım önerileri</label>
            <textarea
              name="usageTips"
              rows={3}
              defaultValue={product.usageTips}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-caption text-muted-foreground">Teknik föy URL</label>
            <Input name="techSheetUrl" defaultValue={product.techSheetUrl ?? ""} />
          </div>
          <Button type="submit">Kaydet</Button>
        </form>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-h4 font-semibold">Nitelikler</h2>
        <div className="mt-4 space-y-4">
          {attributes.map((attr) => {
            const current = valueByAttr.get(attr.id);
            const selected = new Set(current?.selectedOptions.map((s) => s.optionId) ?? []);
            return (
              <form
                key={attr.id}
                action={saveAttributeValueAction}
                className="rounded-xl border border-border/70 p-3"
              >
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="attributeId" value={attr.id} />
                <input type="hidden" name="type" value={attr.type} />
                <input type="hidden" name="slug" value={slug} />
                <p className="text-body-sm font-medium">{attr.name}</p>
                {attr.type === "TEXT" ? (
                  <Input
                    name="valueText"
                    className="mt-2"
                    defaultValue={current?.valueText ?? ""}
                  />
                ) : null}
                {attr.type === "NUMBER" ? (
                  <Input
                    name="valueNumber"
                    type="number"
                    step="any"
                    className="mt-2"
                    defaultValue={current?.valueNumber?.toString() ?? ""}
                  />
                ) : null}
                {attr.type === "BOOLEAN" ? (
                  <label className="mt-2 flex items-center gap-2 text-body-sm">
                    <input
                      type="checkbox"
                      name="valueBoolean"
                      defaultChecked={current?.valueBoolean ?? false}
                    />
                    Evet
                  </label>
                ) : null}
                {(attr.type === "SELECT" || attr.type === "MULTI_SELECT") && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {attr.options.map((opt) => (
                      <label
                        key={opt.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-caption"
                      >
                        <input
                          type={attr.type === "SELECT" ? "radio" : "checkbox"}
                          name="optionIds"
                          value={opt.id}
                          defaultChecked={selected.has(opt.id)}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                )}
                <Button type="submit" size="sm" className="mt-3">
                  Kaydet
                </Button>
              </form>
            );
          })}
        </div>
      </section>

      <div>
        <h2 className="text-h4 leading-h4 font-semibold text-neutral-900">Lot &amp; Stok Hareketleri</h2>
        <p className="mt-1 text-body-sm text-neutral-500">
          Lotlar varyant (`{variant.sku}`) seviyesindedir. Süresi geçmiş lottan çıkış yapılamaz.
        </p>
        <div className="mt-4">
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
                type: m.type as "GIRIS" | "CIKIS",
                quantityKg: m.quantityKg.toString(),
                note: m.note,
                createdAt: m.createdAt.toISOString(),
              })),
            }))}
          />
        </div>
      </div>
    </div>
  );
}
