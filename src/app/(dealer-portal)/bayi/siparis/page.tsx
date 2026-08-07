import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/infra/auth/server";
import { getUserDealerId, isStaffUser } from "@/infra/db/users";
import { IMPERSONATE_COOKIE, parseImpersonationCookie } from "@/lib/impersonation";
import { getDealerCatalog } from "@/infra/db/dealer-catalog";
import { getPaymentSettings } from "@/infra/db/payment-settings";
import { getOrCreateCart } from "@/infra/db/cart";
import { DealerOrderWorkspace } from "@/components/dealer/dealer-order-workspace";
import type { DealerCartView } from "./actions";

export default async function BayiSiparisPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth");

  const jar = await cookies();
  const impId = parseImpersonationCookie(jar.get(IMPERSONATE_COOKIE)?.value);
  const staff = await isStaffUser(session.user.id);
  let dealerId = await getUserDealerId(session.user.id);
  if (impId && staff) dealerId = impId;
  if (!dealerId) redirect("/");

  const [products, payment, cart] = await Promise.all([
    getDealerCatalog(dealerId),
    getPaymentSettings(),
    getOrCreateCart({
      userId: impId && staff ? null : session.user.id,
      dealerId,
      createGuest: Boolean(impId && staff),
    }),
  ]);

  const initialCart: DealerCartView | null = cart
    ? {
        id: cart.id,
        lines: cart.lines.map((line) => ({
          id: line.id,
          variantId: line.variantId,
          name: line.variant.product.name,
          sku: line.variant.sku,
          unitLabel: line.variant.packSize ?? line.variant.packagingType,
          imageUrl: line.variant.product.imageUrl,
          quantity: line.quantity,
          unitPriceKurus: line.unitPriceKurus,
          lineTotalKurus: line.unitPriceKurus * line.quantity,
        })),
        itemCount: cart.lines.reduce((n, l) => n + l.quantity, 0),
        totalKurus: cart.lines.reduce((n, l) => n + l.unitPriceKurus * l.quantity, 0),
      }
    : null;

  return (
    <DealerOrderWorkspace
      products={products}
      initialCart={initialCart}
      payment={{
        bankTransferEnabled: payment.bankTransferEnabled,
        bankName: payment.bankName,
        accountHolder: payment.accountHolder,
        iban: payment.iban,
        note: payment.note,
      }}
    />
  );
}
