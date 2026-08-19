import Link from "next/link";

export function PdpCommerceGate({
  slug,
  isDealer,
}: {
  slug: string;
  isDealer: boolean;
}) {
  if (isDealer) {
    return (
      <div className="mt-8 rounded-[1.25rem] bg-[#FAF8F3] p-5">
        <p className="mkt-body">
          Fiyat, stok ve sipariş adedi yalnızca bayi panelinde görünür.
        </p>
        <Link
          href={`/bayi/siparis?urun=${encodeURIComponent(slug)}`}
          className="mkt-pill mt-4 inline-flex h-12 items-center justify-center bg-mkt-accent px-5 text-[15px] font-medium text-mkt-accent-ink hover:brightness-105"
        >
          Sipariş paneline git
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-[1.25rem] bg-[#FAF8F3] p-5">
      <p className="mkt-body">
        Fiyat, stok ve sipariş adedi onaylı bayi girişi sonrası panelde görünür.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/auth"
          className="mkt-pill inline-flex h-12 items-center justify-center bg-mkt-accent px-5 text-[15px] font-medium text-mkt-accent-ink hover:brightness-105"
        >
          Bayi Girişi
        </Link>
        <Link
          href="/auth?tab=uye"
          className="mkt-pill inline-flex h-12 items-center justify-center border border-[color:var(--mkt-border)] px-5 text-[15px] font-medium text-mkt-ink hover:bg-white"
        >
          Bayi başvurusu
        </Link>
      </div>
    </div>
  );
}
