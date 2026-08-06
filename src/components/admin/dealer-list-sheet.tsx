"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { createDealerAction, updateDealerAction } from "@/app/(admin)/admin/bayiler/actions";

const STATUS_LABEL: Record<string, string> = {
  BASVURU: "Başvuru",
  INCELEME: "İnceleme",
  ONAYLI: "Onaylı",
  AKTIF: "Aktif",
  RISKLI: "Riskli",
  BLOKE: "Bloke",
  PASIF: "Pasif",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  AKTIF: "default",
  ONAYLI: "secondary",
  BASVURU: "outline",
  INCELEME: "outline",
  RISKLI: "destructive",
  BLOKE: "destructive",
  PASIF: "outline",
};

const DEALER_TYPE_LABEL: Record<string, string> = {
  BAYI: "Bayi",
  HORECA: "HORECA",
  ZINCIR: "Müşteri (Zincir Market)",
  ARA_TOPTANCI: "Ara Toptancı",
};

const DEALER_TYPES = ["BAYI", "ZINCIR", "HORECA", "ARA_TOPTANCI"] as const;
const STATUSES = ["BASVURU", "INCELEME", "ONAYLI", "AKTIF", "RISKLI", "BLOKE", "PASIF"] as const;

export type DealerRow = {
  id: string;
  unvan: string;
  dealerType: string;
  status: string;
  vergiNo: string | null;
  vergiDairesi: string | null;
  membershipTier: string | null;
  creditLimitKurus: number | null;
  paymentTermDays: number | null;
  deliveryZoneCode: string | null;
  priceListId: string | null;
  priceListName: string | null;
  salesRepId: string | null;
  userEmails: string[];
  leadCompanyNames: string[];
};

export function DealerListSheet({
  dealers,
  priceListOptions,
  salesRepOptions,
}: {
  dealers: DealerRow[];
  priceListOptions: { id: string; name: string }[];
  salesRepOptions: { id: string; name: string; email: string }[];
}) {
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

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate} className="gap-1.5">
          <Plus className="size-4" />
          Yeni Bayi / Müşteri Ekle
        </Button>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ünvan</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Fiyat listesi</TableHead>
              <TableHead>Kullanıcılar</TableHead>
              <TableHead>Geldiği Bayi Adayı</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dealers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-neutral-400">
                  Henüz bayi/müşteri kaydı yok. &ldquo;Yeni Bayi / Müşteri Ekle&rdquo; ile oluşturun.
                </TableCell>
              </TableRow>
            ) : (
              dealers.map((dealer) => (
                <TableRow key={dealer.id}>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => openEdit(dealer)}
                      className="text-left font-medium text-neutral-900 hover:text-brand-700 hover:underline"
                    >
                      {dealer.unvan}
                    </button>
                  </TableCell>
                  <TableCell className="text-neutral-500">
                    {DEALER_TYPE_LABEL[dealer.dealerType] ?? dealer.dealerType}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[dealer.status] ?? "secondary"}>
                      {STATUS_LABEL[dealer.status] ?? dealer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-neutral-500">
                    {dealer.priceListName ? (
                      <Link
                        href="/admin/fiyat-listeleri"
                        className="hover:text-brand-700 hover:underline"
                      >
                        {dealer.priceListName}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-caption text-neutral-500">
                    {dealer.userEmails.join(", ") || "-"}
                  </TableCell>
                  <TableCell className="text-caption text-neutral-400">
                    {dealer.leadCompanyNames.join(", ") || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={mode !== "closed"} onOpenChange={(open) => !open && close()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{mode === "edit" ? "Bayi / Müşteri Düzenle" : "Yeni Bayi / Müşteri"}</SheetTitle>
            <SheetDescription>
              Bayi, HORECA, zincir market (müşteri) ve ara toptancı kayıtlarının tümü aynı
              formdan yönetilir.
            </SheetDescription>
          </SheetHeader>

          <form
            action={mode === "edit" ? updateDealerAction : createDealerAction}
            onSubmit={close}
            className="flex-1 space-y-4 overflow-y-auto px-4 pb-4"
          >
            {mode === "edit" && editing ? (
              <input type="hidden" name="id" value={editing.id} />
            ) : null}

            <div className="space-y-1">
              <label className="text-caption text-muted-foreground">Ünvan</label>
              <Input name="unvan" defaultValue={editing?.unvan ?? ""} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-caption text-muted-foreground">Tip</label>
                <select
                  name="dealerType"
                  defaultValue={editing?.dealerType ?? "BAYI"}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  {DEALER_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {DEALER_TYPE_LABEL[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-caption text-muted-foreground">Durum</label>
                <select
                  name="status"
                  defaultValue={editing?.status ?? "BASVURU"}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-caption text-muted-foreground">Vergi No</label>
                <Input name="vergiNo" defaultValue={editing?.vergiNo ?? ""} />
              </div>
              <div className="space-y-1">
                <label className="text-caption text-muted-foreground">Vergi Dairesi</label>
                <Input name="vergiDairesi" defaultValue={editing?.vergiDairesi ?? ""} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-caption text-muted-foreground">Üyelik seviyesi</label>
              <Input name="membershipTier" defaultValue={editing?.membershipTier ?? ""} placeholder="Örn. Gold" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-caption text-muted-foreground">Kredi limiti (₺)</label>
                <Input
                  name="creditLimitTl"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={
                    editing?.creditLimitKurus != null ? editing.creditLimitKurus / 100 : ""
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-caption text-muted-foreground">Vade (gün)</label>
                <Input
                  name="paymentTermDays"
                  type="number"
                  defaultValue={editing?.paymentTermDays ?? ""}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-caption text-muted-foreground">Teslimat bölge kodu</label>
              <Input name="deliveryZoneCode" defaultValue={editing?.deliveryZoneCode ?? ""} />
            </div>

            <div className="space-y-1">
              <label className="text-caption text-muted-foreground">Fiyat listesi</label>
              <select
                name="priceListId"
                defaultValue={editing?.priceListId ?? ""}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              >
                <option value="">Atanmamış</option>
                {priceListOptions.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-caption text-muted-foreground">Satış temsilcisi</label>
              <select
                name="salesRepId"
                defaultValue={editing?.salesRepId ?? ""}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              >
                <option value="">Atanmamış</option>
                {salesRepOptions.map((rep) => (
                  <option key={rep.id} value={rep.id}>
                    {rep.name} ({rep.email})
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" className="w-full">
              {mode === "edit" ? "Kaydet" : "Oluştur"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
