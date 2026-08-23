import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/infra/auth/server";
import { getUserDealerId, isStaffUser } from "@/infra/db/users";
import { prisma } from "@/infra/db/client";
import { countUnreadDealer, listDealerNotifications } from "@/infra/db/notifications";
import { getPaymentSettings } from "@/infra/db/payment-settings";
import { getDealerCreditExposure } from "@/infra/db/orders";
import { availableCreditKurus, canUseOnAccount } from "@/domain/ledger";
import { IMPERSONATE_COOKIE, parseImpersonationCookie } from "@/lib/impersonation";
import { ImpersonationBanner } from "@/components/workspace/impersonation-banner";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { DealerNav } from "@/components/dealer/dealer-nav";
import { DealerCartProvider } from "@/components/dealer/dealer-cart-context";
import { DealerCartSheet } from "@/components/dealer/dealer-cart-sheet";
import { fetchDealerCartAction } from "@/app/(dealer-portal)/bayi/siparis/actions";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function BayiLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth");

  const jar = await cookies();
  const impId = parseImpersonationCookie(jar.get(IMPERSONATE_COOKIE)?.value);
  const staff = await isStaffUser(session.user.id);

  let dealerId = await getUserDealerId(session.user.id);
  let impersonating = false;

  if (impId && staff) {
    dealerId = impId;
    impersonating = true;
  }

  if (!dealerId) {
    if (staff) redirect("/panel");
    redirect("/urunler");
  }

  const dealer = await prisma.dealer.findUnique({
    where: { id: dealerId },
    select: { id: true, unvan: true, paymentMethod: true, creditLimitKurus: true },
  });
  if (!dealer) redirect(staff ? "/panel" : "/urunler");

  const [unreadNotifications, dealerNotifications, initialCart, paymentSettings, exposureKurus] =
    await Promise.all([
      countUnreadDealer(dealer.id),
      listDealerNotifications(dealer.id, 12),
      fetchDealerCartAction(),
      getPaymentSettings(),
      getDealerCreditExposure(dealer.id),
    ]);

  const notifications = dealerNotifications.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    link: n.link,
    readAt: n.readAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
  }));

  const cariEligibility = canUseOnAccount({
    dealerPaymentMethod: dealer.paymentMethod,
    creditLimitKurus: dealer.creditLimitKurus,
    exposureKurus,
    orderTotalKurus: 0,
  });
  const cari = {
    eligible: cariEligibility.ok,
    availableKurus: availableCreditKurus(dealer.creditLimitKurus, exposureKurus),
  };

  return (
    <TooltipProvider delayDuration={200}>
      <DealerCartProvider initialCart={initialCart}>
        <WorkspaceShell
          defaultDensity="comfortable"
          className="panel-shell dealer-shell min-h-screen bg-[var(--panel-canvas)] text-foreground"
        >
          {impersonating ? (
            <ImpersonationBanner dealerId={dealer.id} dealerName={dealer.unvan} />
          ) : null}
          <DealerNav
            dealerName={dealer.unvan}
            unreadNotifications={unreadNotifications}
            notifications={notifications}
          />
          <main className="mx-auto max-w-6xl px-3 py-6 sm:px-5 sm:py-8">
            <div className="rounded-[var(--radius-xl)] bg-[var(--panel-surface)] p-4 shadow-[var(--shadow-md)] ring-1 ring-[var(--panel-border)]/55 sm:p-6 md:p-7">
              {children}
            </div>
          </main>
        </WorkspaceShell>
        <DealerCartSheet
          payment={{
            bankTransferEnabled: paymentSettings.bankTransferEnabled,
            bankName: paymentSettings.bankName,
            accountHolder: paymentSettings.accountHolder,
            iban: paymentSettings.iban,
            note: paymentSettings.note,
          }}
          cari={cari}
        />
      </DealerCartProvider>
    </TooltipProvider>
  );
}
