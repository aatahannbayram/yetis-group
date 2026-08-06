import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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

  const rows: DealerRow[] = dealers.map((d) => ({
    id: d.id,
    unvan: d.unvan,
    dealerType: d.dealerType,
    status: d.status,
    vergiNo: d.vergiNo,
    vergiDairesi: d.vergiDairesi,
    membershipTier: d.membershipTier,
    creditLimitKurus: d.creditLimitKurus,
    paymentTermDays: d.paymentTermDays,
    deliveryZoneCode: d.deliveryZoneCode,
    priceListId: d.priceListId,
    priceListName: d.priceList?.name ?? null,
    salesRepId: d.salesRepId,
    userEmails: d.roles.map((r) => r.user.email),
    leadCompanyNames: d.fromLeads.map((l) => l.companyName),
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Bayiler"
        description="Tek ticari varlık: Dealer. Lead terfisi ve kullanıcı rolleri bu kayda bağlanır."
        actions={
          <Link
            href="/admin/bayi-adaylari"
            className="rounded-full border border-border bg-card px-4 py-2.5 text-body-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Bayi Adaylarına Git
          </Link>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam Bayi" value={dealers.length} href="#bayi-listesi" featured />
        <StatCard label="Aktif" value={activeCount} href="#bayi-listesi" />
        <StatCard
          label="Riskli / Bloke"
          value={riskCount}
          warn={riskCount > 0}
          href="#bayi-listesi"
        />
        <StatCard
          label="Fiyat Listesi Atanmamış"
          value={unassignedPriceListCount}
          warn={unassignedPriceListCount > 0}
          href="#bayi-listesi"
        />
      </div>

      <div id="bayi-listesi" className="mt-6">
        <DealerListSheet
          dealers={rows}
          priceListOptions={priceListOptions}
          salesRepOptions={salesRepOptions}
        />
      </div>
    </div>
  );
}
