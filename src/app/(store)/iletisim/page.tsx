import Link from "next/link";
import type { Metadata } from "next";
import { MessageCircle, Phone } from "lucide-react";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { Canvas, Slab } from "@/components/store/slab";
import { ContactForm } from "@/components/store/contact-form";
import { listCategories } from "@/infra/db/categories";
import { ensureDefaultLeadFields, listActiveFormFields } from "@/infra/db/lead-fields";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SITE } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "İletişim",
  description:
    "Yetiş Grup satış ekibine ulaşın. Bayilik, numune ve katalog talepleriniz tek CRM havuzuna düşer.",
  path: "/iletisim",
});

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ konu?: string }>;
}) {
  const { konu } = await searchParams;
  await ensureDefaultLeadFields();
  const [categories, fields] = await Promise.all([listCategories(), listActiveFormFields()]);

  const source =
    konu === "bayilik"
      ? "BAYILIK_BASVURUSU"
      : konu === "numune"
        ? "NUMUNE_TALEBI"
        : "ILETISIM_FORMU";

  return (
    <Canvas>
      <Slab>
        <SiteHeader />
        <div className="mkt-pad">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
            <div>
              <p className="mkt-label text-mkt-green-text">İletişim</p>
              <h1 className="mkt-h2 mt-2 text-balance text-mkt-ink">Satış ekibine yazın.</h1>
              <p className="mkt-body mt-4 max-w-md">
                Talebiniz doğrudan bayi adayı (CRM) havuzuna düşer. Ayrı bir kutu veya kopuk form
                yok — tek kayıt ilkesi.
              </p>

              <div className="mt-8 space-y-3">
                <a
                  href={`tel:${SITE.phone}`}
                  className="flex items-center gap-3 rounded-[1.15rem] bg-mkt-card-muted px-4 py-3 text-mkt-ink"
                >
                  <Phone className="size-4 text-mkt-green-text" aria-hidden />
                  <span className="text-[15px] font-medium">{SITE.phoneDisplay}</span>
                </a>
                <a
                  href={`https://wa.me/${SITE.phone.replace("+", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-[1.15rem] bg-mkt-card-muted px-4 py-3 text-mkt-ink"
                >
                  <MessageCircle className="size-4 text-mkt-green-text" aria-hidden />
                  <span className="text-[15px] font-medium">WhatsApp</span>
                </a>
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-center gap-3 rounded-[1.15rem] bg-mkt-card-muted px-4 py-3 text-mkt-ink"
                >
                  <span className="text-[15px] font-medium">{SITE.email}</span>
                </a>
              </div>

              <p className="mkt-body mt-6 text-[13px]">
                Bayilik süreci için ayrıca{" "}
                <Link href="/haberler/bayilik-nasil-alinir" className="text-mkt-green-text hover:underline">
                  bayilik rehberine
                </Link>{" "}
                bakabilirsiniz.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-[color:var(--mkt-border)] bg-white p-5 sm:p-7">
              <ContactForm
                defaultSource={source}
                categories={categories.map((c) => ({ id: c.id, name: c.name }))}
                fields={fields.map((f) => ({
                  id: f.id,
                  key: f.key,
                  label: f.label,
                  type: f.type,
                  options: f.options,
                  required: f.required,
                }))}
              />
            </div>
          </div>
        </div>
      </Slab>
      <SiteFooter />
    </Canvas>
  );
}
