import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { headers } from "next/headers";
import { auth } from "@/infra/auth/server";
import { getUserDealerId } from "@/infra/db/users";
import { PillCta } from "@/components/store/pill-cta";
import { Reveal } from "@/components/store/reveal";
import { SceneImage } from "@/components/store/scene-image";
import { Slab } from "@/components/store/slab";

async function CatalogCtaActions() {
  const session = await auth.api.getSession({ headers: await headers() });
  const dealerId = session?.user.id ? await getUserDealerId(session.user.id) : null;

  return (
    <div className="mt-8 flex w-full flex-col gap-2.5 sm:flex-row">
      {dealerId ? (
        <PillCta href="/bayi/siparis" className="w-full justify-center sm:w-auto">
          Sipariş paneli
        </PillCta>
      ) : (
        <PillCta href="/auth" className="w-full justify-center sm:w-auto">
          Bayi Girişi
        </PillCta>
      )}
      <Link
        href="/auth?tab=uye"
        className="mkt-pill inline-flex h-[3.25rem] w-full items-center justify-center gap-2 bg-white px-6 text-[15px] font-semibold text-[#0a0a0a] hover:bg-white/92 sm:w-auto"
      >
        Bayi başvurusu
        <ArrowUpRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

export function CatalogCtaSection() {
  return (
    <Slab className="relative overflow-hidden !bg-[#0f1f17] !p-0 text-white">
      <div className="grid items-stretch lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.42fr)]">
        <div className="relative flex flex-col justify-center px-5 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14 lg:px-12 lg:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(48,163,105,0.2),transparent_50%)]"
          />
          <Reveal className="relative">
            <p className="mkt-label text-mkt-accent">Bayi sipariş</p>
            <h2 className="mkt-h2 mt-3 max-w-lg text-balance text-white">
              Fiyat ve stok yalnızca panelde.
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/70">
              Onaylı hesapla liste fiyatınız, lot ve sipariş miktarı açılır. Misafir katalogda hikâye kalır.
            </p>
            <Suspense
              fallback={
                <div className="mt-8 flex w-full flex-col gap-2.5 sm:flex-row">
                  <div className="mkt-pill h-[3.25rem] w-full animate-pulse bg-white/10 sm:w-40" />
                  <div className="mkt-pill h-[3.25rem] w-full animate-pulse bg-white/10 sm:w-44" />
                </div>
              }
            >
              <CatalogCtaActions />
            </Suspense>
          </Reveal>
        </div>
        <div className="relative h-[220px] min-h-[220px] sm:h-[260px] lg:h-auto lg:min-h-full">
          <SceneImage
            id="products-cta"
            fill
            quality={70}
            className="object-center"
            sizes="(min-width: 1024px) 42vw, 100vw"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#0f1f17] via-[#0f1f17]/20 to-transparent lg:bg-gradient-to-r lg:from-[#0f1f17] lg:via-[#0f1f17]/35 lg:to-transparent"
          />
        </div>
      </div>
    </Slab>
  );
}
