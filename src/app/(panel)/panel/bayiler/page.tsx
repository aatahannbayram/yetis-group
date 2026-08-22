import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { DealerListSheet, type DealerRow } from "@/components/admin/dealer-list-sheet";
import { listDealers, listPriceListOptions, listSalesRepOptions } from "@/infra/db/dealers";

export default async function AdminDealersPage() {
  const [dealers, priceListOptions, salesRepOptions] = await Promise.all([
    listDealers(),
    listPriceListOptions(),
    listSalesRepOptions(),
  ]);

  const activeCount = dealers.filter((d) => d.status === "AKTIF").length;
  const riskCount = dealers.filter((d) => d.status === "RISKLI" || d.status === "BLOKE").length;
  const unassignedPriceListCount = dealers.filter((d) => !d.priceListId).length;

  const rows: DealerRow[] = dealers.map((d) => {
    // Contact / commercial fields exist on schema; cast until Prisma client is regenerated.
    const dealer = d as typeof d & {
      email: string | null;
      phone: string | null;
      city: string | null;
      district: string | null;
      addressLine: string | null;
      deliveryAddressLine: string | null;
      paymentMethod: string | null;
      iban: string | null;
    };
    return {
      id: dealer.id,
      unvan: dealer.unvan,
      dealerType: dealer.dealerType,
      status: dealer.status,
      vergiNo: dealer.vergiNo,
      vergiDairesi: dealer.vergiDairesi,
      membershipTier: dealer.membershipTier,
      email: dealer.email,
      phone: dealer.phone,
      city: dealer.city,
      district: dealer.district,
      addressLine: dealer.addressLine,
      deliveryAddressLine: dealer.deliveryAddressLine,
      paymentMethod: dealer.paymentMethod,
      iban: dealer.iban,
      creditLimitKurus: dealer.creditLimitKurus,
      paymentTermDays: dealer.paymentTermDays,
      deliveryZoneCode: dealer.deliveryZoneCode,
      lat: dealer.lat != null ? Number(dealer.lat) : null,
      lng: dealer.lng != null ? Number(dealer.lng) : null,
      priceListId: dealer.priceListId,
      priceListName: dealer.priceList?.name ?? null,
      salesRepId: dealer.salesRepId,
      userEmails: dealer.roles.map((r) => r.user.email),
      leadCompanyNames: dealer.fromLeads.map((l) => l.companyName),
    };
  });

  return (
    <div className="-mx-3 -my-4 bg-stone-50 px-3 py-4 sm:-mx-4 sm:-my-5 sm:px-4 sm:py-5 md:-m-6 md:p-6 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl space-y-5">
        <PageHeader
          title="Bayi/Müşteriler"
          count={dealers.length}
          description="Kayıtlar, ticari koşullar ve atamalar."
          primaryAction={
            <Link
              href="/panel/bayi-adaylari"
              className="inline-flex h-9 items-center rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              Bayi/Müşteri adaylarına git
            </Link>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Toplam" value={dealers.length} href="#bayi-listesi" />
          <StatCard label="Aktif" value={activeCount} href="#bayi-listesi" />
          <StatCard
            label="Riskli / bloke"
            value={riskCount}
            tone={riskCount > 0 ? "warning" : undefined}
            href="#bayi-listesi"
          />
          <StatCard
            label="Fiyat listesi atanmamış"
            value={unassignedPriceListCount}
            tone={unassignedPriceListCount > 0 ? "warning" : undefined}
            href="#bayi-listesi"
          />
        </div>

        <div id="bayi-listesi">
          <DealerListSheet
            dealers={rows}
            priceListOptions={priceListOptions}
            salesRepOptions={salesRepOptions}
          />
        </div>
      </div>
    </div>
  );
}
