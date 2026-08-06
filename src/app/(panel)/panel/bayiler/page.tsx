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
      priceListId: dealer.priceListId,
      priceListName: dealer.priceList?.name ?? null,
      salesRepId: dealer.salesRepId,
      userEmails: dealer.roles.map((r) => r.user.email),
      leadCompanyNames: dealer.fromLeads.map((l) => l.companyName),
    };
  });

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <PageHeader
        title="Bayiler"
        count={dealers.length}
        description="Bayi ve müşteri kayıtları, ticari koşullar ve atamalar."
        primaryAction={
          <Link
            href="/panel/bayi-adaylari"
            className="inline-flex h-9 items-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-[length:var(--text-body)] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
          >
            Bayi adaylarına git
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam bayi" value={dealers.length} href="#bayi-listesi" />
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
  );
}
