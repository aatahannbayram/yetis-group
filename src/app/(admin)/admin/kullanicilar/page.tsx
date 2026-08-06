import { getUsersWithPriceList } from "@/infra/db/users";
import { getPriceListsWithItems } from "@/infra/db/pricing";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PillButton, StatCard } from "@/components/admin/stat-card";
import { UsersTable } from "@/components/admin/users-table";

export default async function AdminUsersPage() {
  const [users, priceLists] = await Promise.all([
    getUsersWithPriceList(),
    getPriceListsWithItems(),
  ]);

  const staffCount = users.filter((u) => u.accountType === "STAFF").length;
  const dealerCount = users.filter((u) => u.accountType === "DEALER").length;
  const unassignedCount = users.filter(
    (u) => u.accountType === "DEALER" && !u.priceListId,
  ).length;

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Kullanıcılar"
        description="Her kullanıcının hangi fiyat listesini göreceğini burada atayın."
        actions={
          <PillButton href="/admin/fiyat-listeleri" variant="secondary">
            Fiyat Listeleri
          </PillButton>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam Kullanıcı" value={users.length} href="#kullanici-listesi" featured />
        <StatCard label="Yetiş Ekibi" value={staffCount} href="#kullanici-listesi" />
        <StatCard label="Bayi Kullanıcısı" value={dealerCount} href="#kullanici-listesi" />
        <StatCard
          label="Fiyat Listesi Atanmamış"
          value={unassignedCount}
          warn={unassignedCount > 0}
          href="#kullanici-listesi"
        />
      </div>

      <div id="kullanici-listesi" className="mt-6">
        <UsersTable
          users={users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            accountType: u.accountType,
            priceListId: u.priceListId,
            dealerLabel: u.dealer?.unvan ?? null,
          }))}
          priceLists={priceLists.map((p) => ({ id: p.id, name: p.name }))}
        />
      </div>
    </div>
  );
}
