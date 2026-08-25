import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/infra/auth/server";
import { getUserDealerId, isStaffUser } from "@/infra/db/users";
import { IMPERSONATE_COOKIE, parseImpersonationCookie } from "@/lib/impersonation";
import { BayiCatalogSection } from "@/app/(dealer-portal)/bayi/katalog/catalog-section";
import BayiCatalogLoading from "@/app/(dealer-portal)/bayi/katalog/loading";

export default async function BayiKatalogPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth");

  const jar = await cookies();
  const impId = parseImpersonationCookie(jar.get(IMPERSONATE_COOKIE)?.value);
  const staff = await isStaffUser(session.user.id);
  let dealerId = await getUserDealerId(session.user.id);
  if (impId && staff) dealerId = impId;
  if (!dealerId) redirect("/");

  return (
    <Suspense fallback={<BayiCatalogLoading />}>
      <BayiCatalogSection dealerId={dealerId} />
    </Suspense>
  );
}
