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
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

const linkClass =
  "flex min-h-[3.25rem] items-center rounded-xl px-4 text-[17px] font-semibold tracking-[-0.015em] text-neutral-950 transition-colors hover:bg-[var(--brand-50)] hover:text-[var(--mkt-green-text)] active:bg-[var(--brand-100)]";

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
          className={cn(
            "size-11 md:hidden",
            overlay
              ? "bg-black/35 text-white shadow-sm backdrop-blur-md hover:bg-black/50 hover:text-white"
              : "text-neutral-950 hover:bg-neutral-100",
          )}
        >
          <Menu className="size-6" strokeWidth={2.5} />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        overlayClassName="bg-black/50 backdrop-blur-[2px]"
        className={cn(
          "w-[min(100%,20.5rem)] gap-0 border-r border-neutral-200 bg-white p-0 text-base text-neutral-900 shadow-2xl",
          "sm:max-w-sm",
        )}
      >
        <SheetHeader className="border-b border-neutral-100 px-5 py-5 text-left">
          <SheetTitle className="sr-only">Menü</SheetTitle>
          <Logo size="lg" />
          <p className="mt-2 text-[13px] leading-snug text-neutral-500">
            Bayi kataloğu ve sipariş
          </p>
        </SheetHeader>

        <nav className="flex flex-1 flex-col px-3 py-4" aria-label="Mobil menü">
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <SheetClose asChild>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </SheetClose>
              </li>
            ))}
            {isStaff ? (
              <li>
                <SheetClose asChild>
                  <Link href="/panel" className={linkClass}>
                    Yönetim Paneli
                  </Link>
                </SheetClose>
              </li>
            ) : null}
          </ul>

          <div className="mt-auto space-y-2 border-t border-neutral-100 px-1 pt-4 pb-2">
            {isLoggedIn ? (
              <SheetClose asChild>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex min-h-[3.25rem] w-full items-center justify-center rounded-xl border border-neutral-200 text-[16px] font-semibold text-neutral-900 hover:bg-neutral-50"
                >
                  Çıkış Yap
                </button>
              </SheetClose>
            ) : (
              <>
                <SheetClose asChild>
                  <Link
                    href="/auth?tab=uye"
                    className="flex min-h-[3.25rem] w-full items-center justify-center rounded-xl border border-neutral-200 text-[16px] font-semibold text-neutral-900 hover:bg-neutral-50"
                  >
                    Üye ol
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/auth"
                    className="flex min-h-[3.25rem] w-full items-center justify-center rounded-xl bg-[var(--mkt-accent)] text-[16px] font-semibold text-[var(--mkt-accent-ink)] hover:brightness-105"
                  >
                    Bayi Girişi
                  </Link>
                </SheetClose>
              </>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
