"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
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

const links = [
  { href: "/urunler", label: "Ürünler" },
  { href: "/#neden-yetis", label: "Neden Yetiş" },
  { href: "/#nasil-calisir", label: "Nasıl Çalışır" },
  { href: "/#iletisim", label: "İletişim" },
];

export function MobileNav({
  isLoggedIn,
  isStaff,
}: {
  isLoggedIn: boolean;
  isStaff: boolean;
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
        <Button variant="ghost" size="icon" aria-label="Menüyü aç" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-4/5 sm:max-w-xs">
        <SheetHeader>
          <SheetTitle>Menü</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {links.map((link) => (
            <SheetClose key={link.href} asChild>
              <Link
                href={link.href}
                className="rounded-md px-3 py-2.5 text-body font-medium text-neutral-700 hover:bg-brand-50 hover:text-brand-700"
              >
                {link.label}
              </Link>
            </SheetClose>
          ))}

          {isStaff ? (
            <SheetClose asChild>
              <Link
                href="/admin"
                className="rounded-md px-3 py-2.5 text-body font-medium text-neutral-700 hover:bg-brand-50 hover:text-brand-700"
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
                className="mt-2 rounded-md border border-neutral-200 px-3 py-2.5 text-center text-body font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Çıkış Yap
              </button>
            </SheetClose>
          ) : (
            <SheetClose asChild>
              <Link
                href="/auth"
                className="mt-2 rounded-md bg-brand-700 px-3 py-2.5 text-center text-body font-semibold text-white hover:bg-brand-800"
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
