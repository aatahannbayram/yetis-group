"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, PackagePlus } from "lucide-react";
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
  addVariantToPriceListAction,
  createPriceListAction,
  fillPriceListAction,
  updatePriceListItemAction,
} from "@/app/(panel)/panel/fiyat-listeleri/actions";
import { cn } from "@/lib/utils";

export type PriceListView = {
  id: string;
  name: string;
  slug: string;
  dealerNames: string[];
  items: Array<{
    id: string;
    variantId: string;
    priceKurus: number;
    sku: string;
    packLabel: string;
    productName: string;
    productSlug: string;
    imageUrl: string | null;
  }>;
};

export type VariantOption = {
  id: string;
  sku: string;
  label: string;
  basePriceTl: string;
};

export function PriceListsManager({
  lists,
  variantOptions,
}: {
  lists: PriceListView[];
  variantOptions: VariantOption[];
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [isPending, startTransition] = useTransition();
  const createRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          Listeler bayi/müşteri gruplarıdır. Bayiye atama{" "}
          <Link href="/panel/bayiler" className="font-medium text-[#1B5E3A] underline">
            Bayi/Müşteriler
          </Link>{" "}
          sayfasından yapılır.
        </p>
        <Button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="h-9 gap-1.5 bg-[#1B5E3A] text-white hover:bg-[#164e31]"
        >
          <Plus className="size-4" />
          Yeni liste
        </Button>
      </div>

      {showCreate ? (
        <form
          ref={createRef}
          className="flex flex-wrap items-end gap-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          action={(fd) => {
            startTransition(async () => {
              await createPriceListAction(fd);
              createRef.current?.reset();
              setShowCreate(false);
            });
          }}
        >
          <label className="min-w-[14rem] flex-1 space-y-1">
            <span className="text-xs font-medium text-stone-500">Liste adı</span>
            <Input
              name="name"
              required
              placeholder="Örn. HORECA, Zincir market"
              className="h-10"
              disabled={isPending}
            />
          </label>
          <Button
            type="submit"
            disabled={isPending}
            className="h-10 bg-[#1B5E3A] text-white hover:bg-[#164e31]"
          >
            Oluştur
          </Button>
        </form>
      ) : null}

      {lists.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold text-stone-800">Fiyat listesi yok</p>
          <p className="mt-1 text-sm text-stone-500">
            Standart, HORECA veya zincir gibi gruplar oluşturun.
          </p>
        </div>
      ) : null}

      {lists.map((priceList) => (
        <PriceListCard
          key={priceList.id}
          list={priceList}
          variantOptions={variantOptions.filter(
            (v) => !priceList.items.some((i) => i.variantId === v.id),
          )}
        />
      ))}
    </div>
  );
}

function PriceListCard({
  list,
  variantOptions,
}: {
  list: PriceListView;
  variantOptions: VariantOption[];
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [isPending, startTransition] = useTransition();
  const addRef = useRef<HTMLFormElement>(null);

  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 px-4 py-3.5 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-stone-900 dark:text-zinc-50">{list.name}</h2>
          <p className="mt-0.5 text-xs text-stone-500">
            {list.dealerNames.length === 0
              ? "Atanmış bayi yok"
              : `Bayi: ${list.dealerNames.join(", ")}`}
            {" · "}
            {list.items.length} kalem
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form
            action={(fd) => {
              startTransition(async () => {
                await fillPriceListAction(fd);
              });
            }}
          >
            <input type="hidden" name="priceListId" value={list.id} />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isPending}
              className="h-8 gap-1.5 border-stone-200"
            >
              <PackagePlus className="size-3.5" />
              Eksik SKU’ları doldur
            </Button>
          </form>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 border-stone-200"
            onClick={() => setShowAdd((v) => !v)}
          >
            <Plus className="size-3.5" />
            Kalem ekle
          </Button>
        </div>
      </div>

      {showAdd && variantOptions.length > 0 ? (
        <form
          ref={addRef}
          className="grid gap-3 border-b border-stone-100 bg-stone-50/80 px-4 py-3 sm:grid-cols-[1fr_8rem_auto] dark:border-zinc-800 dark:bg-zinc-950/40"
          action={(fd) => {
            startTransition(async () => {
              await addVariantToPriceListAction(fd);
              addRef.current?.reset();
              setShowAdd(false);
            });
          }}
        >
          <input type="hidden" name="priceListId" value={list.id} />
          <label className="space-y-1">
            <span className="text-xs font-medium text-stone-500">Varyant</span>
            <select
              name="variantId"
              required
              className="h-9 w-full rounded-lg border border-stone-200 bg-white px-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              defaultValue=""
              onChange={(e) => {
                const opt = variantOptions.find((v) => v.id === e.target.value);
                const el = addRef.current?.querySelector<HTMLInputElement>('input[name="priceTl"]');
                if (opt && el) el.value = opt.basePriceTl;
              }}
            >
              <option value="" disabled>
                Seçin
              </option>
              {variantOptions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-stone-500">Fiyat (₺)</span>
            <Input name="priceTl" type="number" step="0.01" min="0" required className="h-9" />
          </label>
          <div className="flex items-end">
            <Button
              type="submit"
              disabled={isPending}
              className="h-9 w-full bg-[#1B5E3A] text-white hover:bg-[#164e31] sm:w-auto"
            >
              Ekle
            </Button>
          </div>
        </form>
      ) : null}

      {showAdd && variantOptions.length === 0 ? (
        <p className="border-b border-stone-100 px-4 py-3 text-sm text-stone-500 dark:border-zinc-800">
          Tüm aktif varyantlar bu listede. Yeni paket için ürün detayından varyant ekleyin.
        </p>
      ) : null}

      {list.items.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-stone-500">
          Kalem yok. “Eksik SKU’ları doldur” ile kataloğu aktarın.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-stone-200 dark:border-zinc-800">
              <TableHead className="w-12" />
              <TableHead>Ürün / SKU</TableHead>
              <TableHead className="text-right">Grup fiyatı</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.items.map((item) => (
              <TableRow key={item.id} className="border-stone-200 dark:border-zinc-800">
                <TableCell className="w-12 pr-0">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt=""
                      width={36}
                      height={36}
                      className="size-9 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="size-9 rounded-lg bg-stone-100 dark:bg-zinc-800" aria-hidden />
                  )}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/panel/urunler/${item.productSlug}`}
                    className={cn(
                      "font-medium text-stone-900 hover:text-[#1B5E3A] dark:text-zinc-50",
                    )}
                  >
                    {item.productName}
                  </Link>
                  <p className="font-mono text-xs text-stone-400">
                    {item.sku}
                    {item.packLabel ? ` · ${item.packLabel}` : ""}
                  </p>
                </TableCell>
                <TableCell className="text-right">
                  <EditablePrice
                    priceKurus={item.priceKurus}
                    onSave={updatePriceListItemAction.bind(null, list.id, item.variantId)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
