"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { createDealerAction, updateDealerAction } from "@/app/(panel)/panel/bayiler/actions";
import { startImpersonation } from "@/components/workspace/impersonation-banner";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  BASVURU: "Başvuru",
  INCELEME: "İnceleme",
  ONAYLI: "Onaylı",
  AKTIF: "Aktif",
  RISKLI: "Riskli",
  BLOKE: "Bloke",
  PASIF: "Pasif",
};

const STATUS_TONE: Record<string, StatusTone> = {
  AKTIF: "success",
  ONAYLI: "success",
  RISKLI: "danger",
  BLOKE: "danger",
  BASVURU: "info",
  INCELEME: "info",
  PASIF: "neutral",
};

const DEALER_TYPE_LABEL: Record<string, string> = {
  BAYI: "Bayi",
  HORECA: "HORECA",
  ZINCIR: "Müşteri (zincir market)",
  ARA_TOPTANCI: "Ara toptancı",
};

const MEMBERSHIP_LABEL: Record<string, string> = {
  STANDART: "Standart",
  PREMIUM: "Premium",
  VIP: "VIP",
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  VADELI: "Vadeli",
  PESIN: "Peşin",
  HAVALE: "Havale",
  KARMA: "Karma",
};

const DEALER_TYPES = ["BAYI", "ZINCIR", "HORECA", "ARA_TOPTANCI"] as const;
const STATUSES = ["BASVURU", "INCELEME", "ONAYLI", "AKTIF", "RISKLI", "BLOKE", "PASIF"] as const;
const MEMBERSHIP_TIERS = ["STANDART", "PREMIUM", "VIP"] as const;
const PAYMENT_METHODS = ["VADELI", "PESIN", "HAVALE", "KARMA"] as const;

const fieldControlClass =
  "h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus-visible:border-[#1B5E3A] focus-visible:ring-4 focus-visible:ring-[#1B5E3A]/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500";

const selectClassName = fieldControlClass;

export type DealerRow = {
  id: string;
  unvan: string;
  dealerType: string;
  status: string;
  vergiNo: string | null;
  vergiDairesi: string | null;
  membershipTier: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  district: string | null;
  addressLine: string | null;
  deliveryAddressLine: string | null;
  paymentMethod: string | null;
  iban: string | null;
  creditLimitKurus: number | null;
  paymentTermDays: number | null;
  deliveryZoneCode: string | null;
  lat: number | null;
  lng: number | null;
  priceListId: string | null;
  priceListName: string | null;
  salesRepId: string | null;
  userEmails: string[];
  leadCompanyNames: string[];
};

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-stone-700 dark:text-zinc-300">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </Label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="border-b border-stone-100 pb-2 dark:border-zinc-800">
        <h3 className="text-xs font-medium tracking-wide text-stone-500 uppercase dark:text-zinc-500">
          {title}
        </h3>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function DealerListSheet({
  dealers,
  priceListOptions,
  salesRepOptions,
  fieldMode = false,
}: {
  dealers: DealerRow[];
  priceListOptions: { id: string; name: string }[];
  salesRepOptions: { id: string; name: string; email: string }[];
  /** Plasiyer: sadece atanmış bayiler, oluşturma yok, odak impersonation. */
  fieldMode?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openId = searchParams.get("open");
  const openDealer = openId ? (dealers.find((d) => d.id === openId) ?? null) : null;

  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"closed" | "create" | "edit">(() =>
    openDealer ? "edit" : "closed",
  );
  const [editing, setEditing] = useState<DealerRow | null>(() => openDealer);
  const [saving, startSaving] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (openId) router.replace("/panel/bayiler", { scroll: false });
    // Runs once on mount to strip the incoming ?open= param; state itself is seeded via lazy init above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    if (fieldMode) return;
    setEditing(null);
    setSaveError(null);
    setMode("create");
  }
  function openEdit(dealer: DealerRow) {
    setEditing(dealer);
    setSaveError(null);
    setMode("edit");
  }
  function close() {
    setMode("closed");
    setEditing(null);
    setSaveError(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (fieldMode) return;
    const formData = new FormData(e.currentTarget);
    setSaveError(null);
    startSaving(async () => {
      try {
        if (mode === "edit") {
          await updateDealerAction(formData);
        } else {
          await createDealerAction(formData);
        }
        close();
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Kaydedilemedi");
      }
    });
  }

  function impersonate(dealer: DealerRow) {
    startImpersonation(dealer.id);
    close();
    router.push("/bayi");
    router.refresh();
  }

  const columns = useMemo<ColumnDef<DealerRow, unknown>[]>(
    () => [
      {
        accessorKey: "unvan",
        header: "Ünvan",
        minSize: 180,
        cell: ({ row }) => (
          <span
            className="block max-w-[220px] truncate font-medium text-stone-900 dark:text-zinc-50"
            title={row.original.unvan}
          >
            {row.original.unvan}
          </span>
        ),
      },
      {
        accessorKey: "dealerType",
        header: "Tip",
        cell: ({ getValue }) => {
          const type = String(getValue());
          return (
            <span className="whitespace-nowrap text-stone-600 dark:text-zinc-400">
              {DEALER_TYPE_LABEL[type] ?? type}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Durum",
        cell: ({ getValue }) => {
          const status = String(getValue());
          return (
            <StatusBadge
              label={STATUS_LABEL[status] ?? status}
              tone={STATUS_TONE[status] ?? "neutral"}
            />
          );
        },
      },
      {
        accessorKey: "city",
        header: "Şehir",
        cell: ({ getValue }) => (
          <span className="text-stone-600 dark:text-zinc-400">
            {(getValue() as string | null) || "-"}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: "E-posta",
        minSize: 160,
        cell: ({ getValue }) => {
          const email = getValue() as string | null;
          return (
            <span
              className="block max-w-[180px] truncate text-stone-600 dark:text-zinc-400"
              title={email ?? undefined}
            >
              {email || "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "phone",
        header: "Telefon",
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap tabular-nums text-stone-600 dark:text-zinc-400">
            {(getValue() as string | null) || "-"}
          </span>
        ),
      },
      {
        id: "priceList",
        header: "Fiyat listesi",
        cell: ({ row }) =>
          row.original.priceListName ? (
            <Link
              href="/panel/fiyat-listeleri"
              className="text-stone-600 hover:text-[#1B5E3A] hover:underline dark:text-zinc-400"
              onClick={(e) => e.stopPropagation()}
            >
              {row.original.priceListName}
            </Link>
          ) : (
            <span className="text-stone-400">-</span>
          ),
      },
      {
        id: "actions",
        header: "",
        size: 48,
        enableSorting: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="İşlemler"
                className="text-stone-400 hover:text-stone-700"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => openEdit(row.original)}>Düzenle</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  startImpersonation(row.original.id);
                  router.push("/bayi");
                  router.refresh();
                }}
              >
                Bu hesap olarak görüntüle
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [router],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-stone-200 px-3 py-2 dark:border-zinc-800">
        <ListToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Ünvan, şehir, e-posta veya telefon ara…"
          trailing={
            fieldMode ? undefined : (
              <Button type="button" onClick={openCreate} className="h-9 gap-1.5">
                <Plus className="size-4" />
                Yeni bayi/müşteri
              </Button>
            )
          }
        />
      </div>

      <DataTable
        data={dealers}
        columns={columns}
        getRowId={(r) => r.id}
        storageKey="panel-dealers"
        search={search}
        globalFilterFn={(row, q) => {
          const hay = [
            row.unvan,
            row.city,
            row.district,
            row.email,
            row.phone,
            row.priceListName,
            DEALER_TYPE_LABEL[row.dealerType] ?? row.dealerType,
            STATUS_LABEL[row.status] ?? row.status,
            ...row.userEmails,
          ]
            .filter(Boolean)
            .join(" ")
            .toLocaleLowerCase("tr-TR");
          return hay.includes(q);
        }}
        onRowOpen={openEdit}
        emptyTitle={fieldMode ? "Atanmış bayi yok" : "Bayi/müşteri kaydı yok"}
        emptyDescription={
          fieldMode
            ? "Yönetici size bayi atadığında burada listelenir."
            : "Yeni bayi/müşteri ekleyerek listeyi oluşturun."
        }
        emptyAction={
          fieldMode ? undefined : (
            <Button type="button" onClick={openCreate} className="gap-1.5">
              <Plus className="size-4" />
              Yeni bayi/müşteri
            </Button>
          )
        }
        filterEmptyTitle="Filtre sonucu boş"
        filterEmptyDescription="Aramayı temizleyip tekrar deneyin."
      />

      <Sheet open={mode !== "closed"} onOpenChange={(open) => !open && close()}>
        <SheetContent className="w-full gap-0 border-stone-200 bg-white p-0 sm:max-w-lg dark:border-zinc-800 dark:bg-zinc-950">
          <SheetHeader className="space-y-1 border-b border-stone-200 px-5 py-4 text-left dark:border-zinc-800">
            <SheetTitle className="pr-8 text-lg font-semibold tracking-tight text-stone-900 dark:text-zinc-50">
              {fieldMode
                ? "Bayi detayı"
                : mode === "edit"
                  ? "Bayi/müşteri düzenle"
                  : "Yeni bayi/müşteri"}
            </SheetTitle>
            <SheetDescription className="text-sm text-stone-500 dark:text-zinc-400">
              {fieldMode
                ? "Atanan bayiyi inceleyin veya bayi portalına geçin."
                : "Bayi, HORECA, zincir market ve ara toptancı kayıtları aynı formdan yönetilir."}
            </SheetDescription>
          </SheetHeader>

          <form
            key={editing?.id ?? "create"}
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            {mode === "edit" && editing ? (
              <input type="hidden" name="id" value={editing.id} />
            ) : null}

            <div className="flex-1 space-y-8 overflow-y-auto bg-stone-50/60 px-5 py-5 dark:bg-zinc-950">
              <Section title="Firma bilgileri">
                <Field id="dealer-unvan" label="Ünvan" required>
                  <Input
                    id="dealer-unvan"
                    name="unvan"
                    defaultValue={editing?.unvan ?? ""}
                    required
                    aria-required="true"
                    className={fieldControlClass}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field id="dealer-type" label="Tip" required>
                    <select
                      id="dealer-type"
                      name="dealerType"
                      defaultValue={editing?.dealerType ?? "BAYI"}
                      required
                      aria-required="true"
                      className={selectClassName}
                    >
                      {DEALER_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {DEALER_TYPE_LABEL[t]}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field id="dealer-status" label="Durum" required>
                    <select
                      id="dealer-status"
                      name="status"
                      defaultValue={editing?.status ?? "BASVURU"}
                      required
                      aria-required="true"
                      className={selectClassName}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field id="dealer-vergi-no" label="Vergi no">
                    <Input
                      id="dealer-vergi-no"
                      name="vergiNo"
                      defaultValue={editing?.vergiNo ?? ""}
                      className={fieldControlClass}
                    />
                  </Field>
                  <Field id="dealer-vergi-dairesi" label="Vergi dairesi">
                    <Input
                      id="dealer-vergi-dairesi"
                      name="vergiDairesi"
                      defaultValue={editing?.vergiDairesi ?? ""}
                      className={fieldControlClass}
                    />
                  </Field>
                </div>
                <Field id="dealer-membership" label="Üyelik seviyesi">
                  <select
                    id="dealer-membership"
                    name="membershipTier"
                    defaultValue={editing?.membershipTier ?? ""}
                    className={selectClassName}
                  >
                    <option value="">Seçilmedi</option>
                    {MEMBERSHIP_TIERS.map((t) => (
                      <option key={t} value={t}>
                        {MEMBERSHIP_LABEL[t]}
                      </option>
                    ))}
                  </select>
                </Field>
              </Section>

              <Section title="İletişim">
                <div className="grid grid-cols-2 gap-3">
                  <Field id="dealer-email" label="E-posta">
                    <Input
                      id="dealer-email"
                      name="email"
                      type="email"
                      defaultValue={editing?.email ?? ""}
                      className={fieldControlClass}
                    />
                  </Field>
                  <Field id="dealer-phone" label="Telefon">
                    <Input
                      id="dealer-phone"
                      name="phone"
                      type="tel"
                      defaultValue={editing?.phone ?? ""}
                      className={fieldControlClass}
                    />
                  </Field>
                </div>
                <Field id="dealer-address" label="Adres">
                  <Input
                    id="dealer-address"
                    name="addressLine"
                    defaultValue={editing?.addressLine ?? ""}
                    className={fieldControlClass}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field id="dealer-city" label="Şehir">
                    <Input
                      id="dealer-city"
                      name="city"
                      defaultValue={editing?.city ?? ""}
                      className={fieldControlClass}
                    />
                  </Field>
                  <Field id="dealer-district" label="İlçe">
                    <Input
                      id="dealer-district"
                      name="district"
                      defaultValue={editing?.district ?? ""}
                      className={fieldControlClass}
                    />
                  </Field>
                </div>
                <Field id="dealer-delivery-address" label="Teslimat adresi">
                  <Input
                    id="dealer-delivery-address"
                    name="deliveryAddressLine"
                    defaultValue={editing?.deliveryAddressLine ?? ""}
                    className={fieldControlClass}
                  />
                </Field>
              </Section>

              <Section title="Ticari koşullar">
                <div className="grid grid-cols-2 gap-3">
                  <Field id="dealer-payment-method" label="Ödeme yöntemi">
                    <select
                      id="dealer-payment-method"
                      name="paymentMethod"
                      defaultValue={editing?.paymentMethod ?? ""}
                      className={selectClassName}
                    >
                      <option value="">Seçilmedi</option>
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {PAYMENT_METHOD_LABEL[m]}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field id="dealer-iban" label="IBAN">
                    <Input
                      id="dealer-iban"
                      name="iban"
                      defaultValue={editing?.iban ?? ""}
                      className={cn(fieldControlClass, "font-mono text-[13px]")}
                      autoComplete="off"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field id="dealer-credit-limit" label="Kredi limiti (₺)">
                    <Input
                      id="dealer-credit-limit"
                      name="creditLimitTl"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={
                        editing?.creditLimitKurus != null
                          ? editing.creditLimitKurus / 100
                          : ""
                      }
                      className={cn(fieldControlClass, "tabular-nums")}
                    />
                  </Field>
                  <Field id="dealer-payment-term" label="Vade (gün)">
                    <Input
                      id="dealer-payment-term"
                      name="paymentTermDays"
                      type="number"
                      defaultValue={editing?.paymentTermDays ?? ""}
                      className={cn(fieldControlClass, "tabular-nums")}
                    />
                  </Field>
                </div>
                <Field id="dealer-delivery-zone" label="Teslimat bölge kodu">
                  <Input
                    id="dealer-delivery-zone"
                    name="deliveryZoneCode"
                    defaultValue={editing?.deliveryZoneCode ?? ""}
                    className={fieldControlClass}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field id="dealer-lat" label="Enlem (lat)">
                    <Input
                      id="dealer-lat"
                      name="lat"
                      type="number"
                      step="0.0000001"
                      defaultValue={editing?.lat ?? ""}
                      placeholder="41.0082"
                      className={cn(fieldControlClass, "tabular-nums")}
                    />
                  </Field>
                  <Field id="dealer-lng" label="Boylam (lng)">
                    <Input
                      id="dealer-lng"
                      name="lng"
                      type="number"
                      step="0.0000001"
                      defaultValue={editing?.lng ?? ""}
                      placeholder="28.9784"
                      className={cn(fieldControlClass, "tabular-nums")}
                    />
                  </Field>
                </div>
                <p className="text-[11px] text-[var(--panel-ink-muted)]">
                  Rota planı için gerekli. Yoksa bayi rotaya alınamaz.
                </p>
              </Section>

              <Section title="Atamalar">
                {fieldMode ? (
                  <>
                    <input type="hidden" name="priceListId" value={editing?.priceListId ?? ""} />
                    <input type="hidden" name="salesRepId" value={editing?.salesRepId ?? ""} />
                    <p className="text-sm text-stone-600 dark:text-zinc-400">
                      Fiyat listesi:{" "}
                      <span className="font-medium text-stone-900 dark:text-zinc-100">
                        {editing?.priceListName ?? "Atanmamış"}
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <Field id="dealer-price-list" label="Fiyat listesi">
                      <select
                        id="dealer-price-list"
                        name="priceListId"
                        defaultValue={editing?.priceListId ?? ""}
                        className={selectClassName}
                      >
                        <option value="">Atanmamış</option>
                        {priceListOptions.map((pl) => (
                          <option key={pl.id} value={pl.id}>
                            {pl.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field id="dealer-sales-rep" label="Satış temsilcisi">
                      <select
                        id="dealer-sales-rep"
                        name="salesRepId"
                        defaultValue={editing?.salesRepId ?? ""}
                        className={selectClassName}
                      >
                        <option value="">Atanmamış</option>
                        {salesRepOptions.map((rep) => (
                          <option key={rep.id} value={rep.id}>
                            {rep.name} ({rep.email})
                          </option>
                        ))}
                      </select>
                    </Field>
                  </>
                )}
                {mode === "edit" && editing ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full border-stone-200 text-stone-700 hover:bg-white dark:border-zinc-700 dark:text-zinc-300"
                    onClick={() => impersonate(editing)}
                  >
                    Bu hesap olarak görüntüle
                  </Button>
                ) : null}
              </Section>
            </div>

            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t border-stone-200 bg-white px-5 py-3.5 dark:border-zinc-800 dark:bg-zinc-950">
              {saveError ? (
                <p className="mr-auto text-sm text-red-600 dark:text-red-400" role="status">
                  {saveError}
                </p>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                onClick={close}
                disabled={saving}
                className="h-10 text-stone-600 hover:text-stone-900"
              >
                {fieldMode ? "Kapat" : "İptal"}
              </Button>
              {!fieldMode ? (
                <Button type="submit" disabled={saving} className="h-10 min-w-[6.5rem]">
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : mode === "edit" ? (
                    "Kaydet"
                  ) : (
                    "Oluştur"
                  )}
                </Button>
              ) : null}
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
