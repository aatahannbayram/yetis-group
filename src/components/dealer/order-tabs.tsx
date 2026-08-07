"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bookmark, Grid3x3, Package, Search, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/store/reveal";
import { MOTION } from "@/lib/motion";

const tabs = [
  {
    id: "quick",
    label: "Hızlı sipariş",
    description: "SKU veya ürün adıyla satır satır ekleyin.",
    icon: Zap,
  },
  {
    id: "catalog",
    label: "Katalogdan seç",
    description: "Tam katalog mağaza deneyiminde.",
    icon: Grid3x3,
  },
  {
    id: "lists",
    label: "Listelerimden",
    description: "Kayıtlı sipariş listelerinizi tekrar kullanın.",
    icon: Bookmark,
  },
] as const;

const CATEGORY_IMAGES: Record<string, string> = {
  "beyaz peynir": "/products/beyaz-peynir.jpg",
  "kaşar": "/products/kasar.jpg",
  lor: "/products/lor.jpg",
  süt: "/products/sut.jpg",
  "tereyağı": "/products/tereyagi.jpg",
  tulum: "/products/tulum.jpg",
  "yoğurt": "/products/yogurt.jpg",
};

function categoryImage(name: string): string | null {
  return CATEGORY_IMAGES[name.trim().toLocaleLowerCase("tr-TR")] ?? null;
}

export function OrderTabs({
  defaultTab,
  categories,
}: {
  defaultTab: "quick" | "catalog" | "lists";
  categories: { slug: string; name: string }[];
}) {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>(defaultTab);

  return (
    <div className="space-y-5 pb-24 sm:pb-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--panel-ink)] sm:text-2xl">Sipariş ver</h1>
        <p className="mt-1 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
          Üç yoldan birini seçin, saniyeler içinde sepetinize ekleyin.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3" role="tablist">
        {tabs.map((t, i) => {
          const active = tab === t.id;
          return (
            <Reveal key={t.id} delay={i * MOTION.stagger}>
              <button
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={cn(
                  "group flex w-full flex-col items-start gap-2 rounded-[var(--radius-lg)] border p-4 text-left shadow-[var(--shadow-sm)] transition-[transform,box-shadow,border-color,background-color] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
                  active
                    ? "border-[var(--primary-solid)] bg-[linear-gradient(160deg,var(--primary-subtle),white_65%)]"
                    : "border-[var(--panel-border)] bg-white hover:border-[var(--primary-solid)]/40",
                )}
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-[var(--radius-md)] shadow-[var(--shadow-sm)] transition-transform duration-300 group-hover:scale-105",
                    active
                      ? "bg-[var(--primary-solid)] text-white"
                      : "bg-[var(--surface-3)] text-[var(--text-secondary)]",
                  )}
                >
                  <t.icon className="size-5" aria-hidden />
                </span>
                <span className="font-semibold text-[var(--panel-ink)]">{t.label}</span>
                <span className="text-caption text-[var(--panel-ink-muted)]">{t.description}</span>
              </button>
            </Reveal>
          );
        })}
      </div>

      {tab === "quick" ? (
        <Reveal>
          <section className="rounded-[var(--radius-lg)] border border-[var(--panel-border)] bg-white p-5 shadow-[var(--shadow-sm)]">
            <p className="text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
              SKU veya ürün adıyla satır satır ekleme. Excel yapıştırma yakında.
            </p>
            <label className="mt-4 block text-caption font-medium text-[var(--panel-ink)]" htmlFor="quick-sku">
              Ürün / SKU
            </label>
            <div className="relative mt-1.5">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--panel-ink-muted)]"
                aria-hidden
              />
              <input
                id="quick-sku"
                className="h-12 w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-white pr-3 pl-9 text-[length:var(--panel-font-size)] shadow-[var(--shadow-sm)] outline-none transition-colors focus-visible:border-[var(--primary-solid)] focus-visible:ring-3 focus-visible:ring-[var(--primary-solid)]/15"
                placeholder="Örn. beyaz peynir veya SKU"
              />
            </div>
          </section>
        </Reveal>
      ) : null}

      {tab === "catalog" ? (
        <div className="space-y-4">
          {categories.length > 0 ? (
            <Reveal>
              <section className="rounded-[var(--radius-lg)] border border-[var(--panel-border)] bg-white p-5 shadow-[var(--shadow-sm)]">
                <h2 className="font-semibold text-[var(--panel-ink)]">Kategoriden hızlı seç</h2>
                <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                  {categories.map((c) => {
                    const img = categoryImage(c.name);
                    return (
                      <Link
                        key={c.slug}
                        href={`/urunler?kategori=${c.slug}`}
                        className="group flex w-20 shrink-0 flex-col items-center gap-1.5"
                      >
                        <span className="relative size-20 overflow-hidden rounded-full border border-[var(--panel-border)] shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-md)]">
                          {img ? (
                            <Image
                              src={img}
                              alt=""
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                              sizes="80px"
                            />
                          ) : (
                            <span className="flex size-full items-center justify-center bg-[var(--surface-3)] text-[var(--text-muted)]">
                              <Package className="size-6" aria-hidden />
                            </span>
                          )}
                        </span>
                        <span className="max-w-full truncate text-center text-caption font-medium text-[var(--panel-ink)]">
                          {c.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            </Reveal>
          ) : null}

          <Reveal delay={MOTION.stagger}>
            <section className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--primary-solid)]/20 bg-[linear-gradient(160deg,var(--primary-subtle),white_70%)] p-5 shadow-[var(--shadow-sm)]">
              <p className="font-semibold text-[var(--panel-ink)]">Tam katalog mağaza deneyiminde</p>
              <p className="mt-1 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
                Fiyat listenize göre filtrelenmiş tüm ürünleri görün, sepete ekleyin.
              </p>
              <Link
                href="/urunler"
                className="mt-4 inline-flex min-h-12 items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--primary-solid)] px-4 font-semibold text-white shadow-[var(--shadow-sm)] transition-[transform,background-color] duration-200 hover:scale-[1.01] hover:bg-[var(--primary-hover)]"
              >
                Kataloğu aç <ArrowRight className="size-4" aria-hidden />
              </Link>
            </section>
          </Reveal>
        </div>
      ) : null}

      {tab === "lists" ? (
        <Reveal>
          <section className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] p-5 text-center">
            <Bookmark className="mx-auto size-8 text-[var(--panel-ink-muted)]" aria-hidden />
            <p className="mt-2 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
              Kayıtlı listeleriniz burada listelenecek.
            </p>
          </section>
        </Reveal>
      ) : null}
    </div>
  );
}
