import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const siteLinks = [
  { href: "/urunler", label: "Ürünler" },
  { href: "/haberler", label: "Haberler" },
  { href: "/tarifler", label: "Tarifler" },
  { href: "/auth", label: "Bayi Girişi" },
];

const legalLinks = [
  { href: "/yasal/kullanim-kosullari", label: "Kullanım Koşulları" },
  { href: "/yasal/bayi-uyelik-sozlesmesi", label: "Bayi Üyelik Sözleşmesi" },
  { href: "/yasal/gizlilik-politikasi", label: "Gizlilik Politikası" },
  { href: "/yasal/kvkk-aydinlatma", label: "KVKK Aydınlatma" },
  { href: "/yasal/cerez-politikasi", label: "Çerez Politikası" },
];

const contactLinks = [
  { href: "mailto:info@yetisgrup.com", label: "info@yetisgrup.com" },
  { href: "tel:+908501234567", label: "0850 123 45 67" },
];

export function SiteFooter() {
  return (
    <footer id="iletisim" className="mkt-slab overflow-hidden bg-[#E7F4EC]">
      <div className="mkt-pad !py-10 md:!py-14">
      <Link href="/" className="inline-block">
        <Logo size="xl" className="md:hidden" />
        <Logo size="2xl" className="hidden md:block" />
      </Link>

      <div className="mt-8 grid gap-8 border-t border-[color:var(--mkt-border)] pt-8 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4 lg:gap-10 lg:pt-10">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="mkt-body max-w-xs text-mkt-ink">
            Temiz gıdaya eriş, sağlıklı yetiş. Yöresel ve kırsal ürünlerde B2B çözüm ortağı.
          </p>
          <p className="mkt-label mt-6 text-mkt-ink-muted/70">
            &copy; {new Date().getFullYear()} Yetiş Grup. Tüm hakları saklıdır.
          </p>
        </div>

        <FooterCol title="Site" links={siteLinks} />
        <FooterCol title="Yasal" links={legalLinks} />
        <div>
          <p className="mkt-label text-mkt-ink">İletişim</p>
          <ul className="mt-4 space-y-2.5">
            {contactLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="mkt-label text-mkt-ink-muted transition-colors hover:text-mkt-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <Link
            href="/auth"
            className="mkt-pill mkt-label mt-6 inline-flex w-full items-center justify-center bg-mkt-accent-ink px-5 py-2.5 text-white hover:opacity-90 sm:w-auto"
          >
            Bayi Girişi
          </Link>
        </div>
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
      <p className="mkt-label text-mkt-ink">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn("mkt-label text-mkt-ink-muted transition-colors hover:text-mkt-ink")}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
