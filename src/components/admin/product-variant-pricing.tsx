"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditablePrice } from "@/components/admin/editable-price";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createVariantAction,
  updateGroupPriceAction,
  updateVariantPriceAction,
} from "@/app/(panel)/panel/urunler/actions";
import { cn } from "@/lib/utils";
import { PACKAGING_OPTIONS, packLabel } from "@/lib/format/packaging";

const fieldClass =
  "h-9 w-full rounded-lg border border-stone-200 bg-white px-2.5 text-sm outline-none focus-visible:border-[#1B5E3A] focus-visible:ring-4 focus-visible:ring-[#1B5E3A]/15 dark:border-zinc-800 dark:bg-zinc-950";

export type PricingVariant = {
  id: string;
  sku: string;
  packSize: string | null;
  packagingType: string;
  baseUnit: string;
  unitFactor: string;
  moq: number;
  vatRateBasisPoints: number;
  pricePerUnitKurus: number;
};

export type PricingList = {
  id: string;
  name: string;
  slug: string;
  dealerCount: number;
};

/** priceListId:variantId → kuruş (null = liste kalemi yok, baz kullanılır) */
export type GroupPriceMap = Record<string, number | null>;

export function ProductVariantPricing({
  productId,
  slug,
  variants,
  priceLists,
  groupPrices,
}: {
  productId: string;
  slug: string;
  variants: PricingVariant[];
  priceLists: PricingList[];
  groupPrices: GroupPriceMap;
}) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function priceKey(listId: string, variantId: string) {
    return `${listId}:${variantId}`;
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 px-4 py-3 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-stone-900 dark:text-zinc-50">Cinsler</h2>
            <p className="text-xs text-stone-500">
              Her cins ayrı SKU, stok, ambalaj ve fiyattır. Baz fiyat katalog varsayılanıdır.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowForm((v) => !v)}
            className="h-8 gap-1.5 bg-[#1B5E3A] text-white hover:bg-[#164e31]"
          >
            <Plus className="size-3.5" />
            Cins ekle
          </Button>
        </div>

        {showForm ? (
          <form
            ref={formRef}
            className="space-y-3 border-b border-stone-100 bg-stone-50/80 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950/50"
            action={(fd) => {
              startTransition(async () => {
                await createVariantAction(fd);
                formRef.current?.reset();
                setShowForm(false);
              });
            }}
          >
            <input type="hidden" name="productId" value={productId} />
            <input type="hidden" name="slug" value={slug} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="SKU (opsiyonel)">
                <Input name="sku" placeholder="Boş = otomatik" className={fieldClass} />
              </Field>
              <Field label="Paket boyutu">
                <Input name="packSize" placeholder="Örn. 1 kg vakum" className={fieldClass} required />
              </Field>
              <Field label="Ambalaj">
                <select name="packagingType" className={fieldClass} defaultValue="KOLI">
                  {PACKAGING_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Birim katsayısı (kg)">
                <Input
                  name="unitFactor"
                  type="number"
                  step="0.001"
                  min="0.001"
                  defaultValue="1"
                  required
                  className={fieldClass}
                />
              </Field>
              <Field label="Baz fiyat (₺)">
                <Input
                  name="priceTl"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0,00"
                  className={fieldClass}
                />
              </Field>
              <Field label="KDV %">
                <Input name="vatPercent" type="number" step="0.01" min="0" defaultValue="1" className={fieldClass} />
              </Field>
              <Field label="MOQ">
                <Input name="moq" type="number" min="1" defaultValue="1" className={fieldClass} />
              </Field>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                disabled={isPending}
                className="h-9 bg-[#1B5E3A] text-white hover:bg-[#164e31]"
              >
                {isPending ? "Ekleniyor…" : "Paketi kaydet"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-9"
                disabled={isPending}
                onClick={() => setShowForm(false)}
              >
                Vazgeç
              </Button>
            </div>
            <p className="text-xs text-stone-500">
              Yeni paket tüm fiyat listelerine baz fiyatla eklenir; grup fiyatını aşağıdan güncelleyin.
            </p>
          </form>
        ) : null}

        <Table>
          <TableHeader>
            <TableRow className="border-stone-200 dark:border-zinc-800">
              <TableHead>SKU</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead>Katsayı</TableHead>
              <TableHead>MOQ</TableHead>
              <TableHead>KDV</TableHead>
              <TableHead className="text-right">Baz fiyat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((v) => (
              <TableRow key={v.id} className="border-stone-200 dark:border-zinc-800">
                <TableCell className="font-mono text-xs text-stone-500">{v.sku}</TableCell>
                <TableCell className="text-stone-700 dark:text-zinc-300">
                  {packLabel(v.packSize, v.packagingType)}
                </TableCell>
                <TableCell className="tabular-nums text-stone-500">
                  {v.baseUnit} · ×{v.unitFactor}
                </TableCell>
                <TableCell className="tabular-nums text-stone-500">{v.moq}</TableCell>
                <TableCell className="tabular-nums text-stone-500">
                  %{(v.vatRateBasisPoints / 100).toString()}
                </TableCell>
                <TableCell className="text-right">
                  <EditablePrice
                    priceKurus={v.pricePerUnitKurus}
                    onSave={(kurus) => updateVariantPriceAction(v.id, kurus)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-stone-100 px-4 py-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-[#1B5E3A]" aria-hidden />
            <h2 className="text-sm font-semibold text-stone-900 dark:text-zinc-50">
              Bayi / müşteri grubu fiyatları
            </h2>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            Fiyat listesi atanan bayiler bu fiyatı görür. Boş hücre = baz fiyat. Düzenlemek için
            tutara tıklayın.
          </p>
        </div>

        {priceLists.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-stone-500">
            Henüz fiyat listesi yok.{" "}
            <a href="/panel/fiyat-listeleri" className="font-medium text-[#1B5E3A] underline">
              Fiyat listeleri
            </a>{" "}
            sayfasından oluşturun.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-stone-200 dark:border-zinc-800">
                  <TableHead className="sticky left-0 z-10 min-w-[160px] bg-white dark:bg-zinc-900">
                    Paket
                  </TableHead>
                  {priceLists.map((list) => (
                    <TableHead key={list.id} className="min-w-[120px] text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span>{list.name}</span>
                        <span className="text-[10px] font-normal text-stone-400">
                          {list.dealerCount} bayi
                        </span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((v) => (
                  <TableRow key={v.id} className="border-stone-200 dark:border-zinc-800">
                    <TableCell className="sticky left-0 z-10 bg-white dark:bg-zinc-900">
                      <p className="text-sm font-medium text-stone-800 dark:text-zinc-100">
                        {packLabel(v.packSize, v.packagingType)}
                      </p>
                      <p className="font-mono text-[11px] text-stone-400">{v.sku}</p>
                    </TableCell>
                    {priceLists.map((list) => {
                      const override = groupPrices[priceKey(list.id, v.id)];
                      const display = override ?? v.pricePerUnitKurus;
                      const isOverride = override != null;
                      return (
                        <TableCell key={list.id} className="text-right">
                          <div
                            className={cn(
                              "inline-flex flex-col items-end",
                              !isOverride && "opacity-70",
                            )}
                          >
                            <EditablePrice
                              priceKurus={display}
                              onSave={(kurus) =>
                                updateGroupPriceAction(list.id, v.id, kurus)
                              }
                            />
                            {!isOverride ? (
                              <span className="text-[10px] text-stone-400">baz</span>
                            ) : null}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-stone-500">{label}</span>
      {children}
    </label>
  );
}
