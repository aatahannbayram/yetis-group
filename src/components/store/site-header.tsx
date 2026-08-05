import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { CartTriggerButton } from "@/components/store/cart-trigger-button";
import { MobileNav } from "@/components/store/mobile-nav";
import { StoreUserMenu } from "@/components/store/store-user-menu";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";

export async function SiteHeader() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isStaff = session ? await isStaffUser(session.user.id) : false;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-700 md:flex">
          <Link href="/urunler" className="hover:text-brand-700">
            Ürünler
          </Link>
          <Link href="/#neden-yetis" className="hover:text-brand-700">
            Neden Yetiş
          </Link>
          <Link href="/#nasil-calisir" className="hover:text-brand-700">
            Nasıl Çalışır
          </Link>
          <Link href="/#iletisim" className="hover:text-brand-700">
            İletişim
          </Link>
        </nav>

        <div className="flex items-center gap-1.5">
          <CartTriggerButton />
          {session ? (
            <StoreUserMenu userName={session.user.name} isStaff={isStaff} />
          ) : (
            <Button asChild size="lg" className="hidden rounded-2xl sm:inline-flex">
              <Link href="/auth">Bayi Girişi</Link>
            </Button>
          )}
          <MobileNav isLoggedIn={!!session} isStaff={isStaff} />
        </div>
      </div>
    </header>
  );
}
