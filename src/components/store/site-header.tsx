import { headers } from "next/headers";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { CartTriggerButton } from "@/components/store/cart-trigger-button";
import { MobileNav } from "@/components/store/mobile-nav";
import { StoreUserMenu } from "@/components/store/store-user-menu";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/urunler", label: "Ürünler" },
  { href: "/haberler", label: "Haberler" },
  { href: "/tarifler", label: "Tarifler" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

export async function SiteHeader({
  variant = "canvas",
}: {
  /** overlay = transparent over hero photo; canvas = solid on marketing canvas */
  variant?: "overlay" | "canvas";
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const isStaff = session ? await isStaffUser(session.user.id) : false;
  const isOverlay = variant === "overlay";

  return (
    <header
      className={cn(
        "z-40 w-full",
        isOverlay ? "absolute inset-x-0 top-0" : "sticky top-0",
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-14 items-center justify-between gap-3 px-4 sm:gap-4 sm:px-5 md:h-16 md:px-8 lg:h-[5rem] lg:px-10",
          "pt-[env(safe-area-inset-top)]",
          !isOverlay && "border-b border-[color:var(--mkt-border)] bg-mkt-slab/90 backdrop-blur",
        )}
      >
        {/* Wordmark already includes brand mark - do not stack BrandMark beside it */}
        <Link href="/" className="flex min-w-0 shrink items-center">
          {isOverlay ? (
            <>
              <Logo
                variant="dark"
                size="md"
                className="brightness-0 invert md:hidden"
              />
              <Logo
                variant="dark"
                size="xl"
                className="hidden brightness-0 invert md:block"
              />
            </>
          ) : (
            <>
              <Logo size="md" className="md:hidden" />
              <Logo size="xl" className="hidden md:block" />
            </>
          )}
        </Link>

        <nav
          className={cn(
            "hidden items-center gap-7 lg:gap-9 md:flex",
            isOverlay
              ? "text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]"
              : "text-mkt-ink",
          )}
          aria-label="Ana menü"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[15px] font-semibold tracking-[-0.01em] transition-colors lg:text-[16px]",
                isOverlay
                  ? "text-white hover:text-white/85"
                  : "text-mkt-ink hover:text-mkt-green-text",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className={cn(isOverlay && "[&_button]:text-white [&_button]:hover:bg-white/15")}>
            <CartTriggerButton />
          </div>
          {session ? (
            <StoreUserMenu userName={session.user.name} isStaff={isStaff} />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/auth?tab=uye"
                className={cn(
                  "mkt-pill inline-flex items-center justify-center px-4 py-2.5 text-[14px] font-semibold tracking-[-0.01em]",
                  isOverlay
                    ? "bg-white text-[#0a0a0a] shadow-sm hover:bg-white/92"
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
          <MobileNav isLoggedIn={!!session} isStaff={isStaff} overlay={isOverlay} />
        </div>
      </div>
    </header>
  );
}
