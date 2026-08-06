"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { SITE } from "@/lib/site";
import { useConsent } from "@/components/store/consent-provider";

/** Nav order: discover → learn → engage → account */
const siteLinks = [
  { href: "/urunler", label: "Ürünler" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/haberler", label: "Haberler" },
  { href: "/tarifler", label: "Tarifler" },
  { href: "/iletisim", label: "İletişim" },
];

/** Legal order: privacy stack → commercial terms */
const legalLinks = [
  { href: "/yasal/gizlilik-politikasi", label: "Gizlilik" },
  { href: "/yasal/kvkk-aydinlatma", label: "KVKK" },
  { href: "/yasal/cerez-politikasi", label: "Çerezler" },
  { href: "/yasal/kullanim-kosullari", label: "Kullanım koşulları" },
  { href: "/yasal/bayi-uyelik-sozlesmesi", label: "Bayi sözleşmesi" },
];

export function SiteFooter() {
  const { openPreferences } = useConsent();

  return (
    <footer className="mkt-slab overflow-hidden">
      <div className="mkt-pad !py-10 md:!py-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div className="max-w-sm">
            <Link href="/" className="inline-block">
              <Logo size="lg" className="md:hidden" />
              <Logo size="xl" className="hidden md:block" />
            </Link>
            <p className="mt-4 text-[14px] leading-relaxed text-mkt-ink-muted sm:text-[15px]">
              {SITE.slogan}. Yöresel ve kırsal ürünlerde B2B çözüm ortağı.
            </p>
            <div className="mt-5 flex flex-col gap-1.5 text-[14px]">
              <a
                href={`mailto:${SITE.email}`}
                className="font-medium text-mkt-ink hover:text-mkt-green-text"
              >
                {SITE.email}
              </a>
              <a
                href={`tel:${SITE.phone}`}
                className="font-medium tabular-nums text-mkt-ink hover:text-mkt-green-text"
              >
                {SITE.phoneDisplay}
              </a>
            </div>
            <Link
              href="/auth"
              className="mkt-pill mt-6 inline-flex h-11 items-center justify-center bg-mkt-accent px-5 text-[14px] font-semibold text-mkt-accent-ink hover:brightness-105"
            >
              Bayi Girişi
            </Link>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-10">
            <FooterCol title="Keşfet" links={siteLinks} />
            <FooterCol title="Yasal" links={legalLinks} />
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[12px] font-semibold tracking-wide text-mkt-ink-muted uppercase">
                Hesap
              </p>
              <ul className="mt-3.5 space-y-2.5">
                <li>
                  <Link
                    href="/auth"
                    className="text-[14px] font-medium text-mkt-ink transition-colors hover:text-mkt-green-text"
                  >
                    Giriş yap
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth?tab=uye"
                    className="text-[14px] font-medium text-mkt-ink transition-colors hover:text-mkt-green-text"
                  >
                    Üye ol
                  </Link>
                </li>
                <li>
                  <Link
                    href="/iletisim"
                    className="text-[14px] font-medium text-mkt-ink transition-colors hover:text-mkt-green-text"
                  >
                    Satışa yaz
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={openPreferences}
                    className="text-[14px] font-medium text-mkt-ink transition-colors hover:text-mkt-green-text"
                  >
                    Çerez tercihleri
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[color:var(--mkt-border)] pt-6 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-mkt-ink-muted">
            &copy; {new Date().getFullYear()} {SITE.legalName}. Tüm hakları saklıdır.
          </p>
          <nav
            aria-label="Yasal kısayollar"
            className="flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-mkt-ink-muted"
          >
            {legalLinks.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-mkt-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-[12px] font-semibold tracking-wide text-mkt-ink-muted uppercase">
        {title}
      </p>
      <ul className="mt-3.5 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[14px] font-medium text-mkt-ink transition-colors hover:text-mkt-green-text"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
