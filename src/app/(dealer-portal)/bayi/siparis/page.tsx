import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/infra/auth/server";
import { getUserDealerId, isStaffUser } from "@/infra/db/users";
import { prisma } from "@/infra/db/client";
import { IMPERSONATE_COOKIE, parseImpersonationCookie } from "@/lib/impersonation";
import { resolveDealerProfile } from "@/features/dealer/dealerProfiles";
import { OrderTabs } from "@/components/dealer/order-tabs";

export default async function BayiSiparisPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth");

  const jar = await cookies();
  const impId = parseImpersonationCookie(jar.get(IMPERSONATE_COOKIE)?.value);
  const staff = await isStaffUser(session.user.id);
  let dealerId = await getUserDealerId(session.user.id);
  if (impId && staff) dealerId = impId;
  if (!dealerId) redirect("/");

  const dealer = await prisma.dealer.findUniqueOrThrow({
    where: { id: dealerId },
    select: { dealerType: true },
  });
  const profile = resolveDealerProfile(dealer.dealerType);

  return <OrderTabs defaultTab={profile.orderDefault} />;
}
