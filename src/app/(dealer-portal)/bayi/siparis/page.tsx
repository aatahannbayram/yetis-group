import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/infra/auth/server";
import { getUserDealerId, isStaffUser } from "@/infra/db/users";
import { IMPERSONATE_COOKIE, parseImpersonationCookie } from "@/lib/impersonation";
import { getDealerCatalog } from "@/infra/db/dealer-catalog";
import { DealerOrderWorkspace } from "@/components/dealer/dealer-order-workspace";

export default async function BayiSiparisPage({
  searchParams,
}: {
  searchParams: Promise<{ urun?: string; cins?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth");
  const { urun, cins } = await searchParams;

  const jar = await cookies();
  const impId = parseImpersonationCookie(jar.get(IMPERSONATE_COOKIE)?.value);
  const staff = await isStaffUser(session.user.id);
  let dealerId = await getUserDealerId(session.user.id);
  if (impId && staff) dealerId = impId;
  if (!dealerId) redirect("/");

  const products = await getDealerCatalog(dealerId);

  return (
    <DealerOrderWorkspace
      products={products}
      initialProductSlug={urun ?? null}
      initialCinsId={cins ?? null}
    />
  );
}
