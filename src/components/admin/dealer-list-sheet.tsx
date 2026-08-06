"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
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

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

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
      <Label htmlFor={id} className="text-[length:var(--text-caption)] text-[var(--text-muted)]">
        {label}
        {required ? <span className="text-[var(--danger-text)]"> *</span> : null}
      </Label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-[length:var(--text-caption)] font-semibold tracking-[0.04em] text-[var(--text-muted)] uppercase">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function DealerListSheet({
  dealers,
  priceListOptions,
  salesRepOptions,
}: {
  dealers: DealerRow[];
  priceListOptions: { id: string; name: string }[];
  salesRepOptions: { id: string; name: string; email: string }[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"closed" | "create" | "edit">("closed");
  const [editing, setEditing] = useState<DealerRow | null>(null);

  function openCreate() {
    setEditing(null);
    setMode("create");
  }
  function openEdit(dealer: DealerRow) {
    setEditing(dealer);
    setMode("edit");
  }
  function close() {
    setMode("closed");
    setEditing(null);
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
            className="block max-w-[220px] truncate font-medium text-[var(--text-primary)]"
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
            <span className="whitespace-nowrap text-[var(--text-secondary)]">
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
          <span className="text-[var(--text-secondary)]">{(getValue() as string | null) || "-"}</span>
        ),
      },
      {
        accessorKey: "email",
        header: "E-posta",
        minSize: 160,
        cell: ({ getValue }) => {
          const email = getValue() as string | null;
          return (
            <span className="block max-w-[180px] truncate text-[var(--text-secondary)]" title={email ?? undefined}>
              {email || "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "phone",
        header: "Telefon",
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap tabular-nums text-[var(--text-secondary)]">
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
              className="text-[var(--text-secondary)] hover:text-[var(--primary-solid)] hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {row.original.priceListName}
            </Link>
          ) : (
            <span className="text-[var(--text-muted)]">-</span>
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
                Bu bayi olarak görüntüle
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [router],
  );

  return (
    <div className="space-y-3">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Ünvan, şehir, e-posta veya telefon ara…"
        trailing={
          <Button type="button" onClick={openCreate} className="h-8 gap-1.5">
            <Plus className="size-4" />
            Yeni bayi
          </Button>
        }
      />

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
        emptyTitle="Bayi kaydı yok"
        emptyDescription="Yeni bayi ekleyerek listeyi oluşturun."
        emptyAction={
          <Button type="button" onClick={openCreate} className="gap-1.5">
            <Plus className="size-4" />
            Yeni bayi
          </Button>
        }
        filterEmptyTitle="Filtre sonucu boş"
        filterEmptyDescription="Aramayı temizleyip tekrar deneyin."
      />

      <Sheet open={mode !== "closed"} onOpenChange={(open) => !open && close()}>
        <SheetContent className="w-full gap-0 p-0 sm:max-w-lg">
          <SheetHeader className="border-b border-[var(--border)] px-4 py-3 text-left">
            <SheetTitle className="pr-8">
              {mode === "edit" ? "Bayi düzenle" : "Yeni bayi"}
            </SheetTitle>
            <SheetDescription>
              Bayi, HORECA, zincir market ve ara toptancı kayıtları aynı formdan yönetilir.
            </SheetDescription>
          </SheetHeader>

          <form
            key={editing?.id ?? "create"}
            action={mode === "edit" ? updateDealerAction : createDealerAction}
            onSubmit={close}
            className="flex min-h-0 flex-1 flex-col"
          >
            {mode === "edit" && editing ? (
              <input type="hidden" name="id" value={editing.id} />
            ) : null}

            <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
              <Section title="Firma bilgileri">
                <Field id="dealer-unvan" label="Ünvan" required>
                  <Input
                    id="dealer-unvan"
                    name="unvan"
                    defaultValue={editing?.unvan ?? ""}
                    required
                    aria-required="true"
                    className="h-9"
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
                      className="h-9"
                    />
                  </Field>
                  <Field id="dealer-vergi-dairesi" label="Vergi dairesi">
                    <Input
                      id="dealer-vergi-dairesi"
                      name="vergiDairesi"
                      defaultValue={editing?.vergiDairesi ?? ""}
                      className="h-9"
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
                      className="h-9"
                    />
                  </Field>
                  <Field id="dealer-phone" label="Telefon">
                    <Input
                      id="dealer-phone"
                      name="phone"
                      type="tel"
                      defaultValue={editing?.phone ?? ""}
                      className="h-9"
                    />
                  </Field>
                </div>
                <Field id="dealer-address" label="Adres">
                  <Input
                    id="dealer-address"
                    name="addressLine"
                    defaultValue={editing?.addressLine ?? ""}
                    className="h-9"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field id="dealer-city" label="Şehir">
                    <Input
                      id="dealer-city"
                      name="city"
                      defaultValue={editing?.city ?? ""}
                      className="h-9"
                    />
                  </Field>
                  <Field id="dealer-district" label="İlçe">
                    <Input
                      id="dealer-district"
                      name="district"
                      defaultValue={editing?.district ?? ""}
                      className="h-9"
                    />
                  </Field>
                </div>
                <Field id="dealer-delivery-address" label="Teslimat adresi">
                  <Input
                    id="dealer-delivery-address"
                    name="deliveryAddressLine"
                    defaultValue={editing?.deliveryAddressLine ?? ""}
                    className="h-9"
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
                      className="h-9"
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
                      className="h-9"
                    />
                  </Field>
                  <Field id="dealer-payment-term" label="Vade (gün)">
                    <Input
                      id="dealer-payment-term"
                      name="paymentTermDays"
                      type="number"
                      defaultValue={editing?.paymentTermDays ?? ""}
                      className="h-9"
                    />
                  </Field>
                </div>
                <Field id="dealer-delivery-zone" label="Teslimat bölge kodu">
                  <Input
                    id="dealer-delivery-zone"
                    name="deliveryZoneCode"
                    defaultValue={editing?.deliveryZoneCode ?? ""}
                    className="h-9"
                  />
                </Field>
              </Section>

              <Section title="Atamalar">
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
                {mode === "edit" && editing ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => impersonate(editing)}
                  >
                    Bu bayi olarak görüntüle
                  </Button>
                ) : null}
              </Section>
            </div>

            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <Button type="button" variant="outline" onClick={close}>
                İptal
              </Button>
              <Button type="submit">{mode === "edit" ? "Kaydet" : "Oluştur"}</Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
