"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Plus, Undo2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CreditLimitBar } from "@/components/admin/credit-limit-bar";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { cn } from "@/lib/utils";
import { addLedgerEntryAction, reverseLedgerEntryAction } from "@/app/(panel)/panel/cari/actions";
import { StatusBadge } from "@/components/ui/status-badge";

const DEALER_TYPE_LABEL: Record<string, string> = {
  BAYI: "Bayi",
  HORECA: "HORECA",
  ZINCIR: "Müşteri (Zincir Market)",
  ARA_TOPTANCI: "Ara Toptancı",
};

export type LedgerEntryRow = {
  id: string;
  type: "BORC" | "ODEME";
  amountKurus: number;
  description: string;
  createdAt: string;
  reversesId: string | null;
};

export type DealerBalanceRow = {
  id: string;
  unvan: string;
  dealerType: string;
  creditLimitKurus: number | null;
  paymentTermDays: number | null;
  entryCount: number;
  balanceKurus: number;
  entries: LedgerEntryRow[];
};

export function DealerLedgerBoard({ dealers }: { dealers: DealerBalanceRow[] }) {
  const [openDealerId, setOpenDealerId] = useState<string | null>(null);

  const openDealer = dealers.find((d) => d.id === openDealerId) ?? null;
  const entries = openDealer?.entries ?? null;

  function close() {
    setOpenDealerId(null);
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dealers.map((dealer, index) => {
          const owesMoney = dealer.balanceKurus > 0;
          const overLimit =
            dealer.creditLimitKurus != null && dealer.balanceKurus > dealer.creditLimitKurus;

          return (
            <motion.button
              key={dealer.id}
              type="button"
              onClick={() => setOpenDealerId(dealer.id)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3 }}
              className={cn(
                "relative overflow-hidden rounded-[var(--radius-md)] border bg-[var(--surface)] p-4 text-left shadow-[var(--shadow-sm)] transition-[border-color,box-shadow] hover:shadow-[var(--shadow-md)]",
                overLimit
                  ? "border-[var(--danger-border)]"
                  : owesMoney
                    ? "border-[var(--warning-border)]"
                    : "border-[var(--border)] hover:border-[var(--border-strong)]",
              )}
            >
              {overLimit || owesMoney ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-y-0 left-0 w-[3px]",
                    overLimit ? "bg-[var(--danger-solid)]" : "bg-[var(--warning-solid)]",
                  )}
                />
              ) : null}
              <div className="flex items-start justify-between gap-2 pl-0.5">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[var(--text-primary)]">{dealer.unvan}</p>
                  <p className="text-caption text-[var(--text-muted)]">
                    {DEALER_TYPE_LABEL[dealer.dealerType] ?? dealer.dealerType}
                  </p>
                </div>
                <StatusBadge
                  label={`${dealer.entryCount} kayıt`}
                  tone={overLimit ? "danger" : "neutral"}
                />
              </div>

              <p
                className={cn(
                  "mt-4 tabular-nums text-[1.5rem] font-bold",
                  overLimit ? "text-[var(--danger-text)]" : "text-[var(--text-primary)]",
                )}
              >
                {formatMoney(money(Math.abs(dealer.balanceKurus)))}
              </p>
              <p className="text-caption text-[var(--text-muted)]">
                {owesMoney ? "Bayi borcu" : dealer.balanceKurus < 0 ? "Bayi alacaklı" : "Bakiye sıfır"}
              </p>

              <div className="mt-4">
                <CreditLimitBar
                  balanceKurus={dealer.balanceKurus}
                  limitKurus={dealer.creditLimitKurus}
                />
                {dealer.paymentTermDays ? (
                  <p className="mt-1 text-caption text-[var(--text-muted)]">
                    {dealer.paymentTermDays} gün vade
                  </p>
                ) : null}
              </div>
            </motion.button>
          );
        })}
      </div>

      <Sheet open={openDealer !== null} onOpenChange={(open) => !open && close()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {openDealer ? (
            <>
              <SheetHeader>
                <SheetTitle>{openDealer.unvan}</SheetTitle>
                <SheetDescription>
                  Cari hareket geçmişi — append-only, düzeltme ters kayıtla yapılır.
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
                <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <p className="text-caption text-[var(--text-muted)]">Güncel bakiye</p>
                  <p
                    className={cn(
                      "mt-1 tabular-nums text-h3 leading-h3 font-bold",
                      openDealer.balanceKurus > 0
                        ? "text-[var(--danger-text)]"
                        : "text-[var(--text-primary)]",
                    )}
                  >
                    {formatMoney(money(Math.abs(openDealer.balanceKurus)))}
                  </p>
                </div>

                <form
                  action={async (formData) => {
                    await addLedgerEntryAction(formData);
                    close();
                  }}
                  className="space-y-3 rounded-2xl border border-border/70 p-4"
                >
                  <input type="hidden" name="dealerId" value={openDealer.id} />
                  <p className="flex items-center gap-1.5 text-caption font-medium text-muted-foreground">
                    <Plus className="size-3.5" />
                    Yeni kayıt
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      name="type"
                      defaultValue="BORC"
                      className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    >
                      <option value="BORC">Borç (fatura/sevkiyat)</option>
                      <option value="ODEME">Ödeme (tahsilat)</option>
                    </select>
                    <Input name="amountTl" type="number" step="0.01" min="0.01" placeholder="₺ tutar" required />
                  </div>
                  <Input name="description" placeholder="Açıklama" required />
                  <Button type="submit" size="sm" className="w-full">
                    Kaydet
                  </Button>
                </form>

                <div>
                  <p className="mb-2 text-caption font-medium text-muted-foreground">Hareketler</p>
                  <div className="space-y-2">
                      {(entries ?? []).map((entry, index) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.04 }}
                          className="flex items-start justify-between gap-3 rounded-xl border border-border/60 px-3 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="text-body-sm text-neutral-800">{entry.description}</p>
                            <p className="text-caption text-muted-foreground">
                              {new Date(entry.createdAt).toLocaleString("tr-TR")}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span
                              className={cn(
                                "tabular-nums text-body-sm font-semibold",
                                entry.type === "BORC" ? "text-danger-fg" : "text-brand-700",
                              )}
                            >
                              {entry.type === "BORC" ? "+" : "−"}
                              {formatMoney(money(entry.amountKurus))}
                            </span>
                            {!entry.reversesId ? (
                              <form
                                action={async (formData) => {
                                  await reverseLedgerEntryAction(formData);
                                  close();
                                }}
                              >
                                <input type="hidden" name="entryId" value={entry.id} />
                                <Button
                                  type="submit"
                                  size="icon-sm"
                                  variant="ghost"
                                  title="Ters kayıt oluştur"
                                >
                                  <Undo2 className="size-3.5" />
                                </Button>
                              </form>
                            ) : null}
                          </div>
                        </motion.div>
                      ))}
                      {entries && entries.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                          <Wallet className="size-6" />
                          <p className="text-caption">Henüz cari hareketi yok.</p>
                        </div>
                      ) : null}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
