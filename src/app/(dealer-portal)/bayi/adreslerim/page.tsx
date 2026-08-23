import { requireDealerPortal } from "@/features/dealer/portal-context";
import { prisma } from "@/infra/db/client";
import { DealerAddressFields } from "@/components/dealer/dealer-address-fields";

export default async function BayiAdreslerimPage() {
  const { dealerId } = await requireDealerPortal();
  const dealer = await prisma.dealer.findUniqueOrThrow({
    where: { id: dealerId },
    select: {
      unvan: true,
      email: true,
      addressLine: true,
      deliveryAddressLine: true,
      city: true,
      district: true,
      deliveryZoneCode: true,
      phone: true,
    },
  });

  return (
    <div className="space-y-6 pb-24 sm:pb-6">
      <header className="border-b border-[var(--panel-border)] pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--panel-ink)]">Adreslerim</h1>
        <p className="mt-1 text-sm text-[var(--panel-ink-muted)]">
          Fatura ve teslimat adreslerini buradan güncelleyin
        </p>
      </header>

      <DealerAddressFields
        unvan={dealer.unvan}
        email={dealer.email}
        phone={dealer.phone}
        city={dealer.city}
        district={dealer.district}
        addressLine={dealer.addressLine}
        deliveryAddressLine={dealer.deliveryAddressLine}
        deliveryZoneCode={dealer.deliveryZoneCode}
      />
    </div>
  );
}
