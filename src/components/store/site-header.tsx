import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { MobileNav } from "@/components/store/mobile-nav";
import { StoreUserMenu } from "@/components/store/store-user-menu";
import { StoreHeaderNav } from "@/components/store/store-header-nav";
import { StickyHeaderShell } from "@/components/store/sticky-header-shell";
import { auth } from "@/infra/auth/server";
import { getUserDealerId, isStaffUser } from "@/infra/db/users";
import { cn } from "@/lib/utils";

function AuthActionsFallback({ isOverlay }: { isOverlay: boolean }) {
  return (
    <>
      <div className="hidden items-center gap-2 sm:flex" aria-hidden>
        <span
          className={cn(
            "mkt-pill inline-flex h-[42px] w-[5.5rem] animate-pulse",
            isOverlay
              ? "bg-white/25 group-data-[stuck=true]/hdr:bg-stone-200/80"
              : "bg-stone-200/80",
          )}
        />
        <span className="mkt-pill inline-flex h-[42px] w-[6.5rem] animate-pulse bg-mkt-accent/50" />
      </div>
      <span
        className={cn(
          "flex size-10 animate-pulse rounded-lg md:hidden",
          isOverlay
            ? "bg-white/20 group-data-[stuck=true]/hdr:bg-stone-200/80"
            : "bg-stone-200/80",
        )}
        aria-hidden
      />
    </>
  );
}

async function HeaderAuthActions({ isOverlay }: { isOverlay: boolean }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const [isStaff, dealerId] = session
    ? await Promise.all([isStaffUser(session.user.id), getUserDealerId(session.user.id)])
    : [false, null];

  return (
    <>
      {session ? (
        <div
          className={cn(
            isOverlay &&
              "[&_button]:text-white [&_button]:hover:bg-white/15 group-data-[stuck=true]/hdr:[&_button]:text-mkt-ink group-data-[stuck=true]/hdr:[&_button]:hover:bg-black/[0.05]",
          )}
        >
          <StoreUserMenu
            userName={session.user.name}
            isStaff={isStaff}
            hasDealer={dealerId !== null}
          />
        </div>
      ) : (
        <div className="hidden items-center gap-2 sm:flex">
          <Link
            href="/auth?tab=uye"
            className={cn(
              "mkt-pill inline-flex items-center justify-center px-4 py-2.5 text-[14px] font-semibold tracking-[-0.01em]",
              isOverlay
                ? "bg-white text-[#0a0a0a] shadow-sm hover:bg-white/92 group-data-[stuck=true]/hdr:border group-data-[stuck=true]/hdr:border-[color:var(--mkt-border)] group-data-[stuck=true]/hdr:bg-transparent group-data-[stuck=true]/hdr:shadow-none group-data-[stuck=true]/hdr:hover:bg-black/[0.05]"
                : "border border-[color:var(--mkt-border)] bg-white text-mkt-ink hover:bg-mkt-card-muted",
            )}
          >
            Üye ol
          </Link>
          <Link
            href="/auth"
            className="mkt-pill bg-mkt-accent px-5 py-2.5 text-[14px] font-semibold tracking-[-0.01em] text-mkt-accent-ink hover:brightness-105"
          >
            Bayi Girişi
          </Link>
        </div>
      )}
      <MobileNav
        isLoggedIn={!!session}
        isStaff={isStaff}
        hasDealer={dealerId !== null}
        overlay={isOverlay}
      />
    </>
  );
}

export function SiteHeader({
  variant = "canvas",
  pinOnScroll = true,
}: {
  /** overlay = transparent over hero photo; canvas = solid on marketing canvas */
  variant?: "overlay" | "canvas";
  /** Overlay header pins to the viewport and becomes a floating glass bar after scroll. */
  pinOnScroll?: boolean;
}) {
  const isOverlay = variant === "overlay";
  const pin = isOverlay && pinOnScroll;

  const inner = (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4",
        "px-3 sm:px-4 md:px-5",
        "pt-[env(safe-area-inset-top)] group-data-[stuck=true]/hdr:pt-0",
        "h-14 md:h-[4.25rem]",
      )}
    >
      <Link href="/" className="relative z-10 flex min-w-0 shrink items-center">
        <Logo
          size="md"
          className={cn(
            "md:hidden",
            isOverlay &&
              "brightness-0 invert drop-shadow-[0_1px_10px_rgba(0,0,0,0.45)] group-data-[stuck=true]/hdr:brightness-100 group-data-[stuck=true]/hdr:invert-0 group-data-[stuck=true]/hdr:drop-shadow-none",
          )}
        />
        <Logo
          size="lg"
          className={cn(
            "hidden md:block",
            isOverlay &&
              "brightness-0 invert drop-shadow-[0_1px_10px_rgba(0,0,0,0.45)] group-data-[stuck=true]/hdr:brightness-100 group-data-[stuck=true]/hdr:invert-0 group-data-[stuck=true]/hdr:drop-shadow-none",
          )}
        />
      </Link>

      <div className="pointer-events-none absolute inset-x-0 hidden justify-center md:flex">
        <div className="pointer-events-auto">
          <StoreHeaderNav overlay={isOverlay} />
        </div>
      </div>

      <div className="relative z-10 flex shrink-0 items-center gap-2">
        <Suspense fallback={<AuthActionsFallback isOverlay={isOverlay} />}>
          <HeaderAuthActions isOverlay={isOverlay} />
        </Suspense>
      </div>
    </div>
  );

  if (pin) {
    return <StickyHeaderShell overlay>{inner}</StickyHeaderShell>;
  }

  if (isOverlay) {
    return <header className="absolute inset-x-0 top-0 z-50 w-full">{inner}</header>;
  }

  return (
    <StickyHeaderShell overlay={false} className="sticky top-0">
      {inner}
    </StickyHeaderShell>
  );
}
