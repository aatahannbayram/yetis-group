import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/infra/auth/server";
import { getUserDealerId, isStaffUser } from "@/infra/db/users";
import { prisma } from "@/infra/db/client";
import { IMPERSONATE_COOKIE, parseImpersonationCookie } from "@/lib/impersonation";
import { ImpersonationBanner } from "@/components/workspace/impersonation-banner";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { DealerNav } from "@/components/dealer/dealer-nav";
import { TooltipProvider } from "@/components/ui/tooltip";

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

  return (
    <TooltipProvider delayDuration={200}>
      <WorkspaceShell
        defaultDensity="comfortable"
        className="panel-shell dealer-shell min-h-screen bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary-subtle)_45%,var(--panel-canvas))_0%,var(--panel-canvas)_420px)] text-foreground"
      >
        {impersonating ? (
          <ImpersonationBanner dealerId={dealer.id} dealerName={dealer.unvan} />
        ) : null}
        <DealerNav dealerName={dealer.unvan} />
        <main className="mx-auto max-w-6xl px-3 py-5 sm:px-4 sm:py-7">{children}</main>
      </WorkspaceShell>
    </TooltipProvider>
  );
}
