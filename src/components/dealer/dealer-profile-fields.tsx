"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CircleAlert, Pencil, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateDealerProfileAction } from "@/app/(dealer-portal)/bayi/firmam/actions";

export type DealerProfileFieldsProps = {
  vergiNo: string | null;
  vergiDairesi: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  district: string | null;
  addressLine: string | null;
  creditLimitLabel: string | null;
  paymentTermLabel: string | null;
  priceListName: string | null;
  salesRepLabel: string | null;
};

function ReadOnlyField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="border-t border-[var(--panel-border)] px-4 py-3 sm:border-t-0 sm:odd:border-r sm:[&:nth-child(-n+2)]:border-t">
      <dt className="text-[11px] font-medium tracking-wide text-[var(--panel-ink-muted)] uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-[var(--panel-ink)]">{value?.trim() || "-"}</dd>
    </div>
  );
}

export function DealerProfileFields(props: DealerProfileFieldsProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState(props.email ?? "");
  const [phone, setPhone] = useState(props.phone ?? "");
  const [city, setCity] = useState(props.city ?? "");
  const [district, setDistrict] = useState(props.district ?? "");
  const [addressLine, setAddressLine] = useState(props.addressLine ?? "");

  function cancel() {
    setEmail(props.email ?? "");
    setPhone(props.phone ?? "");
    setCity(props.city ?? "");
    setDistrict(props.district ?? "");
    setAddressLine(props.addressLine ?? "");
    setError(null);
    setEditing(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        await updateDealerProfileAction(formData);
        setEditing(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Kaydedilemedi.");
      }
    });
  }

  const fieldClass =
    "h-9 rounded-lg border border-[var(--panel-border)] bg-white px-2.5 text-sm outline-none focus-visible:border-[var(--primary-solid)] focus-visible:ring-4 focus-visible:ring-[var(--primary-solid)]/15";

  if (!editing) {
    return (
      <>
        <div className="flex items-center justify-end px-4 pt-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5"
            onClick={() => setEditing(true)}
          >
            <Pencil className="size-3.5" aria-hidden />
            Bilgilerimi düzenle
          </Button>
        </div>
        <dl className="grid gap-0 sm:grid-cols-2">
          <ReadOnlyField label="Vergi no" value={props.vergiNo} />
          <ReadOnlyField label="Vergi dairesi" value={props.vergiDairesi} />
          <ReadOnlyField label="E-posta" value={props.email} />
          <ReadOnlyField label="Telefon" value={props.phone} />
          <ReadOnlyField
            label="Şehir / ilçe"
            value={[props.district, props.city].filter(Boolean).join(" / ") || null}
          />
          <ReadOnlyField label="Fatura adresi" value={props.addressLine} />
          <ReadOnlyField label="Kredi limiti" value={props.creditLimitLabel} />
          <ReadOnlyField label="Vade" value={props.paymentTermLabel} />
          <ReadOnlyField label="Fiyat listesi" value={props.priceListName} />
          <ReadOnlyField label="Satış temsilcisi" value={props.salesRepLabel} />
        </dl>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-[11px] font-medium tracking-wide text-[var(--panel-ink-muted)] uppercase">
            E-posta
          </span>
          <Input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="siparis@firma.com"
            className={fieldClass}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-[11px] font-medium tracking-wide text-[var(--panel-ink-muted)] uppercase">
            Telefon
          </span>
          <Input
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05xx xxx xx xx"
            className={fieldClass}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-[11px] font-medium tracking-wide text-[var(--panel-ink-muted)] uppercase">
            Şehir
          </span>
          <Input
            name="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="İstanbul"
            className={fieldClass}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-[11px] font-medium tracking-wide text-[var(--panel-ink-muted)] uppercase">
            İlçe
          </span>
          <Input
            name="district"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="Kadıköy"
            className={fieldClass}
          />
        </label>
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-[11px] font-medium tracking-wide text-[var(--panel-ink-muted)] uppercase">
            Fatura adresi
          </span>
          <Input
            name="addressLine"
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            placeholder="Mahalle, sokak, no"
            className={fieldClass}
          />
        </label>
      </div>

      <p className="text-xs text-[var(--panel-ink-muted)]">
        Unvan, vergi bilgisi, kredi limiti ve fiyat listesi burada değiştirilemez - bunlar için
        destek ekibiyle iletişime geçin.
      </p>

      {error ? (
        <p className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          <CircleAlert className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={cancel}
          className="h-9 gap-1.5"
        >
          <X className="size-3.5" aria-hidden />
          Vazgeç
        </Button>
        <Button type="submit" disabled={isPending} className="h-9 flex-1">
          {isPending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}
