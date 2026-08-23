import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/infra/auth/server";
import { getUserDealerId, isStaffUser } from "@/infra/db/users";
import { prisma } from "@/infra/db/client";
import { calculateBalance } from "@/domain/ledger";
import { IMPERSONATE_COOKIE, parseImpersonationCookie } from "@/lib/impersonation";
import {
  composeHomeModules,
  resolveDealerProfile,
  resolveLifecycle,
} from "@/features/dealer/dealerProfiles";
import dynamic from "next/dynamic";
import { getOrCreateCart } from "@/infra/db/cart";
import { listPublishedAnnouncements } from "@/infra/db/campaigns";

const DealerHomeModules = dynamic(
  () =>
    import("@/components/dealer/dealer-home-modules").then((m) => m.DealerHomeModules),
  {
    loading: () => (
      <div className="space-y-5" aria-busy="true" aria-label="Yükleniyor">
        <div className="h-[11.5rem] animate-pulse rounded-[1.35rem] bg-[var(--surface-3)] sm:h-[13rem]" />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="h-28 animate-pulse rounded-2xl bg-[var(--surface-3)]" />
          <div className="h-28 animate-pulse rounded-2xl bg-[var(--surface-3)]" />
          <div className="h-28 animate-pulse rounded-2xl bg-[var(--surface-3)]" />
        </div>
      </div>
    ),
  },
);

const TYPE_LABEL: Record<string, string> = {
  BAYI: "Market / Şarküteri",
  HORECA: "HORECA",
  ARA_TOPTANCI: "Ara toptancı",
  ZINCIR: "Zincir",
};

export default async function BayiHomePage() {
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
    include: {
      ledgerEntries: true,
      carts: {
        where: { lines: { some: {} } },
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: {
          lines: {
            include: {
              variant: { include: { product: { select: { name: true, imageUrl: true } } } },
            },
          },
        },
      },
    },
  });

  const profile = resolveDealerProfile(dealer.dealerType);
  const lastCart = dealer.carts[0] ?? null;
  const lifecycle = resolveLifecycle({
    status: dealer.status,
    createdAt: dealer.createdAt,
    lastOrderAt: lastCart?.updatedAt ?? null,
    orderCount: dealer.carts.length,
  });
  const modules = composeHomeModules(profile, lifecycle);
  const balanceKurus = calculateBalance(dealer.ledgerEntries);
  const [announcements, currentCart] = await Promise.all([
    listPublishedAnnouncements(),
    getOrCreateCart({
      userId: impId && staff ? null : session.user.id,
      dealerId,
      createGuest: Boolean(impId && staff),
    }),
  ]);

  const lastSummary = lastCart
    ? lastCart.lines
        .slice(0, 3)
        .map((l) => l.variant.product.name)
        .join(", ") + (lastCart.lines.length > 3 ? "…" : "")
    : null;
  const lastCartThumbnails = lastCart
    ? Array.from(new Set(lastCart.lines.map((l) => l.variant.product.imageUrl).filter(Boolean)))
        .slice(0, 3)
        .map((url) => url as string)
    : [];

  return (
    <DealerHomeModules
      modules={modules}
      dealerName={dealer.unvan}
      dealerTypeLabel={TYPE_LABEL[dealer.dealerType] ?? dealer.dealerType}
      creditLimitKurus={dealer.creditLimitKurus}
      balanceKurus={balanceKurus}
      paymentTermDays={dealer.paymentTermDays}
      openCartLines={currentCart?.lines.length ?? 0}
      lastCartSummary={lastSummary}
      lastCartThumbnails={lastCartThumbnails}
      announcements={announcements}
    />
  );
}
