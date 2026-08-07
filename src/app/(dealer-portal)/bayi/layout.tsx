import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/infra/auth/server";
import { getUserDealerId, isStaffUser } from "@/infra/db/users";
import { prisma } from "@/infra/db/client";
import { countUnreadDealer } from "@/infra/db/notifications";
import { getOrCreateCart } from "@/infra/db/cart";
import { IMPERSONATE_COOKIE, parseImpersonationCookie } from "@/lib/impersonation";
import { ImpersonationBanner } from "@/components/workspace/impersonation-banner";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { DealerNav } from "@/components/dealer/dealer-nav";
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
    redirect("/");
  }

  const dealer = await prisma.dealer.findUnique({
    where: { id: dealerId },
    select: { id: true, unvan: true },
  });
  if (!dealer) redirect(staff ? "/panel" : "/");

  const [unreadNotifications, cart] = await Promise.all([
    countUnreadDealer(dealer.id),
    getOrCreateCart({
      userId: impersonating ? null : session.user.id,
      dealerId: dealer.id,
      createGuest: false,
    }),
  ]);

  const cartCount = cart?.lines.reduce((n, l) => n + l.quantity, 0) ?? 0;

  return (
    <TooltipProvider delayDuration={200}>
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
          cartCount={cartCount}
        />
        <main className="mx-auto max-w-6xl px-3 py-5 sm:px-4 sm:py-7">{children}</main>
      </WorkspaceShell>
    </TooltipProvider>
  );
}
