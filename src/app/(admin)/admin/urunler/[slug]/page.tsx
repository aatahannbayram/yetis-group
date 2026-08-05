import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/infra/db/products";
import { getLotsForProduct, getProductStockSummary } from "@/infra/db/inventory";
import { LotManager } from "@/components/admin/lot-manager";
import { formatKg } from "@/lib/format/weight";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [lots, stock] = await Promise.all([
    getLotsForProduct(product.id),
    getProductStockSummary(product.id),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-start gap-4">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={64}
            height={64}
            className="rounded-lg object-cover"
          />
        ) : null}
        <div>
          <p className="font-mono text-caption text-neutral-400">{product.sku}</p>
          <h1 className="text-h2 leading-h2 font-semibold text-neutral-900">{product.name}</h1>
          <p className="text-body-sm text-neutral-500">
            {product.category} &middot; {product.unitLabel} &middot;{" "}
            {formatMoney(money(product.pricePerUnitKurus))}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-card p-4">
          <p className="text-caption text-neutral-500">Toplam Stok</p>
          <p className="mt-1 text-h3 leading-h3 font-semibold text-neutral-900">
            {formatKg(stock.totalKg)}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-card p-4">
          <p className="text-caption text-neutral-500">Sevk Edilebilir</p>
          <p className="mt-1 text-h3 leading-h3 font-semibold text-brand-700">
            {formatKg(stock.shippableKg)}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-card p-4">
          <p className="text-caption text-neutral-500">Lot Sayısı</p>
          <p className="mt-1 text-h3 leading-h3 font-semibold text-neutral-900">
            {stock.lotCount}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-h4 leading-h4 font-semibold text-neutral-900">Lot &amp; Stok Hareketleri</h2>
        <p className="mt-1 text-body-sm text-neutral-500">
          Sevkiyat FEFO (en erken SKT önce) ile önerilir; süresi geçmiş lottan çıkış yapılamaz.
        </p>
        <div className="mt-4">
          <LotManager
            productId={product.id}
            slug={product.slug}
            lots={lots.map((lot) => ({
              id: lot.id,
              lotNumber: lot.lotNumber,
              expirationDate: lot.expirationDate.toISOString(),
              expired: lot.expired,
              availableKg: lot.availableKg.toString(),
              movements: lot.movements.map((m) => ({
                id: m.id,
                type: m.type,
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
