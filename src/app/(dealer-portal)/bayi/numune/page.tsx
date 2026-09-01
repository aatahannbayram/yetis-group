import { requireDealerPortal } from "@/features/dealer/portal-context";
import { prisma } from "@/infra/db/client";
import { listSampleRequestsForDealer } from "@/infra/db/samples";
import { getDealerOrderList } from "@/infra/db/dealer-catalog";
import { DealerSampleRequests } from "@/components/dealer/dealer-sample-requests";

export default async function BayiNumunePage({
  searchParams,
}: {
  searchParams: Promise<{ variantId?: string }>;
}) {
  const { dealerId } = await requireDealerPortal();
  const { variantId } = await searchParams;

  const [requestsRaw, catalog, dealer] = await Promise.all([
    listSampleRequestsForDealer(dealerId),
    getDealerOrderList(dealerId),
    prisma.dealer.findUniqueOrThrow({
      where: { id: dealerId },
      select: { deliveryAddressLine: true, addressLine: true },
    }),
  ]);

  const requests = requestsRaw.map((r) => ({
    id: r.id,
    requestNo: r.requestNo,
    status: r.status,
    requestedAt: r.requestedAt.toISOString(),
    trackingNo: r.trackingNo,
    cargoCompany: r.cargoCompany,
    rejectReason: r.rejectReason,
    items: r.items.map((i) => ({
      id: i.id,
      productName: i.variant.product.name,
      packSize: i.variant.packSize,
      sku: i.variant.sku,
      quantity: i.quantity,
    })),
  }));

  const catalogItems = catalog.flatMap((product) =>
    product.variants.map((variant) => ({
      variantId: variant.id,
      productName: product.name,
      sku: variant.sku,
      packSize: variant.packSize,
      packagingType: variant.packagingType,
    })),
  );

  return (
    <div className="space-y-6 pb-24 sm:pb-6">
      <header className="border-b border-[var(--panel-border)] pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--panel-ink)]">
          Numune Taleplerim
        </h1>
        <p className="mt-1 text-sm text-[var(--panel-ink-muted)]">
          Sipariş vermeden önce ürünü deneyin, talep gönderin, durumu buradan takip edin.
        </p>
      </header>

      <DealerSampleRequests
        requests={requests}
        catalogItems={catalogItems}
        defaultDeliveryAddress={dealer.deliveryAddressLine || dealer.addressLine || ""}
        openWithVariantId={variantId}
      />
    </div>
  );
}
