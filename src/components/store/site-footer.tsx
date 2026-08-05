import { Logo } from "@/components/ui/logo";

export function SiteFooter() {
  return (
    <footer id="iletisim" className="border-t border-neutral-200 bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-neutral-600 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo size="sm" />
          <p className="mt-2">Temiz Gıdaya Eriş, Sağlıklı Yetiş</p>
        </div>
        <p>&copy; {new Date().getFullYear()} Yetiş Grup. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  );
}
