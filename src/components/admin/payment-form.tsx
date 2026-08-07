"use client";

import { useMemo, useState, useTransition } from "react";
import { CircleAlert, CircleCheck, Search, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { cn } from "@/lib/utils";
import { addPaymentAction } from "@/app/(panel)/panel/tahsilat/actions";

export type PaymentDealerOption = {
  id: string;
  unvan: string;
  balanceKurus: number;
};

const fieldClass =
  "h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none transition-shadow focus-visible:border-[var(--primary-solid)] focus-visible:ring-4 focus-visible:ring-[var(--primary-solid)]/15";

export function PaymentForm({ dealers }: { dealers: PaymentDealerOption[] }) {
  const [dealerId, setDealerId] = useState("");
  const [dealerQuery, setDealerQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedDealer = dealers.find((d) => d.id === dealerId) ?? null;

  const filteredDealers = useMemo(() => {
    const q = dealerQuery.trim().toLocaleLowerCase("tr-TR");
    if (!q) return dealers;
    return dealers.filter((d) => d.unvan.toLocaleLowerCase("tr-TR").includes(q));
  }, [dealers, dealerQuery]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!dealerId) {
      setError("Bayi seçin.");
      return;
    }
    const formData = new FormData(event.currentTarget);
    formData.set("dealerId", dealerId);
    const dealerLabel = selectedDealer?.unvan ?? "";

    startTransition(async () => {
      try {
        await addPaymentAction(formData);
        setSuccess(`${dealerLabel} için tahsilat kaydedildi.`);
        setDealerId("");
        setDealerQuery("");
        (event.target as HTMLFormElement).reset();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Tahsilat kaydedilemedi.");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5"
    >
      <div className="space-y-2">
        <label className="text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
          Bayi
        </label>
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
          <div className="relative border-b border-[var(--border)]">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden
            />
            <input
              type="search"
              value={dealerQuery}
              onChange={(e) => setDealerQuery(e.target.value)}
              placeholder="Ünvan ile ara…"
              className="h-10 w-full bg-transparent pr-3 pl-9 text-sm outline-none placeholder:text-[var(--text-muted)]"
              aria-label="Bayi ara"
            />
          </div>
          <div className="max-h-44 overflow-y-auto p-1.5" role="listbox" aria-label="Bayi listesi">
            {filteredDealers.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-[var(--text-muted)]">
                {dealerQuery.trim() ? `"${dealerQuery.trim()}" ile eşleşen kayıt yok` : "Bayi yok"}
              </p>
            ) : (
              filteredDealers.map((d) => {
                const selected = dealerId === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => setDealerId(d.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                      selected
                        ? "bg-[var(--primary-subtle)] font-medium text-[var(--primary-text)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface)]",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{d.unvan}</span>
                    <span
                      className={cn(
                        "shrink-0 tabular-nums text-[length:var(--text-caption)]",
                        d.balanceKurus > 0 ? "text-[var(--warning-text)]" : "text-[var(--text-muted)]",
                      )}
                    >
                      {d.balanceKurus > 0
                        ? `Borç ${formatMoney(money(d.balanceKurus))}`
                        : "Bakiye 0"}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
            Tutar (₺)
          </label>
          <Input
            name="amountTl"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            required
            className={cn(fieldClass, "tabular-nums")}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
            Açıklama (opsiyonel)
          </label>
          <Input name="description" placeholder="Tahsilat" className={fieldClass} />
        </div>
      </div>

      {error ? (
        <p className="flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--danger-subtle)] px-3 py-2 text-[length:var(--text-caption)] text-[var(--danger-text)]">
          <CircleAlert className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--success-subtle)] px-3 py-2 text-[length:var(--text-caption)] text-[var(--success-text)]">
          <CircleCheck className="size-3.5 shrink-0" />
          {success}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="h-11 w-full gap-1.5 rounded-full">
        <Wallet className="size-4" aria-hidden />
        {isPending ? "Kaydediliyor…" : "Tahsilatı kaydet"}
      </Button>
    </form>
  );
}
