"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { authClient } from "@/infra/auth/client";
import { cn } from "@/lib/utils";

const links = [
  { href: "/urunler", label: "Ürünler" },
  { href: "/haberler", label: "Haberler" },
  { href: "/tarifler", label: "Tarifler" },
  { href: "/#hakkimizda", label: "Hakkımızda" },
  { href: "/#iletisim", label: "İletişim" },
];

export function MobileNav({
  isLoggedIn,
  isStaff,
  overlay = false,
}: {
  isLoggedIn: boolean;
  isStaff: boolean;
  overlay?: boolean;
}) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Menüyü aç"
          className={cn("md:hidden", overlay && "text-white hover:bg-white/10 hover:text-white")}
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-4/5 border-none bg-mkt-slab sm:max-w-xs">
        <SheetHeader>
          <SheetTitle className="sr-only">Menü</SheetTitle>
          <Logo size="lg" />
        </SheetHeader>
        <nav className="flex flex-col gap-2 px-4 pt-2">
          {links.map((link) => (
            <SheetClose key={link.href} asChild>
              <Link
                href={link.href}
                className="mkt-pill mkt-label bg-mkt-card-muted px-4 py-3 text-mkt-ink hover:bg-mkt-accent hover:text-mkt-accent-ink"
              >
                {link.label}
              </Link>
            </SheetClose>
          ))}

          {isStaff ? (
            <SheetClose asChild>
              <Link
                href="/admin"
                className="mkt-pill mkt-label bg-mkt-card-muted px-4 py-3 text-mkt-ink hover:bg-mkt-accent hover:text-mkt-accent-ink"
              >
                Yönetim Paneli
              </Link>
            </SheetClose>
          ) : null}

          {isLoggedIn ? (
            <SheetClose asChild>
              <button
                type="button"
                onClick={handleSignOut}
                className="mkt-pill mkt-label mt-2 border border-[color:var(--mkt-border)] px-4 py-3 text-center text-mkt-ink hover:bg-mkt-card-muted"
              >
                Çıkış Yap
              </button>
            </SheetClose>
          ) : (
            <SheetClose asChild>
              <Link
                href="/auth"
                className="mkt-pill mkt-label mt-2 bg-mkt-accent px-4 py-3 text-center text-mkt-accent-ink hover:brightness-105"
              >
                Bayi Girişi
              </Link>
            </SheetClose>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
