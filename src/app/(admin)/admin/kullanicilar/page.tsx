import { getUsersWithPriceList } from "@/infra/db/users";
import { getPriceListsWithItems } from "@/infra/db/pricing";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { UsersTable } from "@/components/admin/users-table";

export default async function AdminUsersPage() {
  const [users, priceLists] = await Promise.all([
    getUsersWithPriceList(),
    getPriceListsWithItems(),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Kullanıcılar"
        description="Her kullanıcının hangi fiyat listesini göreceğini burada atayın."
      />

      <div className="mt-6">
        <UsersTable
          users={users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            accountType: u.accountType,
            priceListId: u.priceListId,
          }))}
          priceLists={priceLists.map((p) => ({ id: p.id, name: p.name }))}
        />
      </div>
    </div>
  );
}
