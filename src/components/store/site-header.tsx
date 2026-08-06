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
  { href: "/#hakkimizda", label: "Hakkımızda" },
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
          "mx-auto flex h-[5rem] items-center justify-between gap-4 px-5 md:px-8 lg:px-10",
          !isOverlay && "border-b border-[color:var(--mkt-border)] bg-mkt-slab/90 backdrop-blur",
        )}
      >
        {/* Wordmark already includes brand mark — do not stack BrandMark beside it */}
        <Link href="/" className="flex items-center">
          {isOverlay ? (
            <Logo variant="dark" size="xl" className="brightness-0 invert" />
          ) : (
            <Logo size="xl" />
          )}
        </Link>

        <nav
          className={cn(
            "mkt-label hidden items-center gap-8 md:flex",
            isOverlay ? "text-white/90" : "text-mkt-ink-muted",
          )}
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-opacity hover:opacity-100",
                isOverlay ? "hover:text-white" : "hover:text-mkt-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className={cn(isOverlay && "[&_button]:text-white")}>
            <CartTriggerButton />
          </div>
          {session ? (
            <StoreUserMenu userName={session.user.name} isStaff={isStaff} />
          ) : (
            <Link
              href="/auth"
              className="mkt-pill mkt-label hidden bg-mkt-accent px-5 py-2.5 text-mkt-accent-ink hover:brightness-105 sm:inline-flex"
            >
              Bayi Girişi
            </Link>
          )}
          <MobileNav isLoggedIn={!!session} isStaff={isStaff} overlay={isOverlay} />
        </div>
      </div>
    </header>
  );
}
