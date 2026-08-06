import { listActiveCartsForAdmin } from "@/infra/db/admin-analytics";
import { CartsListPage } from "@/features/staff/carts/carts-list-page";

export default async function PanelB2bCartsPage() {
  const carts = await listActiveCartsForAdmin();

  return (
    <CartsListPage
      carts={carts.map((cart) => ({
        id: cart.id,
        ownerLabel:
          cart.dealer?.unvan ??
          cart.user?.name ??
          (cart.guestKey ? "Misafir sepet" : "Anonim"),
        ownerSub:
          cart.user?.email ??
          (cart.guestKey ? `Misafir · ${cart.guestKey.slice(0, 8)}` : cart.id) +
            (cart.dealer ? ` · ${cart.dealer.status}` : ""),
        lineCount: cart.lineCount,
        unitCount: cart.unitCount,
        subtotalKurus: cart.subtotalKurus,
        updatedAt: cart.updatedAt.toISOString(),
        lines: cart.lines.map((line) => ({
          name: `${line.productName} (${line.sku})`,
          qty: line.quantity,
          lineTotalKurus: line.unitPriceKurus * line.quantity,
        })),
      }))}
    />
  );
}
