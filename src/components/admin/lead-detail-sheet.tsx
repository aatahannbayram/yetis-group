"use client";

import { useState, useTransition } from "react";
import {
  Building2,
  MapPin,
  Phone,
  FileText,
  Handshake,
  Truck,
  RefreshCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  LEAD_ACTIVITY_TYPES,
  LEAD_ACTIVITY_TYPE_LABELS,
  LEAD_CHANNEL_LABELS,
  LEAD_STAGE_LABELS,
} from "@/domain/leads";
import { formatKg } from "@/lib/format/weight";
import { kg } from "@/domain/weight";
import { formatDateTime } from "@/lib/format/date";
import { addLeadActivityAction } from "@/app/(admin)/admin/bayi-adaylari/actions";
import type { LeadItem } from "@/components/admin/leads-board";

const ACTIVITY_ICON: Record<(typeof LEAD_ACTIVITY_TYPES)[number], typeof Phone> = {
  ARAMA: Phone,
  NOT: FileText,
  TEKLIF: Handshake,
  TESLIMAT: Truck,
  DURUM_DEGISIKLIGI: RefreshCcw,
};

export function LeadDetailSheet({
  lead,
  open,
  onOpenChange,
}: {
  lead: LeadItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [type, setType] = useState<(typeof LEAD_ACTIVITY_TYPES)[number]>("ARAMA");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!lead) return null;

  function handleSubmit() {
    if (!lead || !note.trim()) return;
    startTransition(async () => {
      await addLeadActivityAction(lead.id, type, note);
      setNote("");
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{lead.companyName}</SheetTitle>
          <SheetDescription className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{LEAD_STAGE_LABELS[lead.stage]}</Badge>
            <Badge variant="outline" className="border-neutral-300 text-neutral-700">
              {LEAD_CHANNEL_LABELS[lead.channel]}
            </Badge>
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-1.5 border-b border-neutral-100 px-4 pb-4 text-body-sm text-neutral-600">
          <div className="flex items-center gap-1.5">
            <Building2 className="size-3.5" aria-hidden />
            {lead.contactName}
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="size-3.5" aria-hidden />
            {lead.phone}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden />
            {lead.city}
          </div>
          {lead.estimatedMonthlyKg ? (
            <p className="tabular-nums font-medium text-brand-700">
              ~{formatKg(kg(lead.estimatedMonthlyKg))}/ay tahmini hacim
            </p>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <h3 className="text-body-sm leading-body-sm font-semibold text-neutral-900">
            Geçmiş / Akıbet
          </h3>
          {lead.activities.length === 0 ? (
            <p className="mt-3 text-body-sm text-neutral-400">Henüz kayıt yok.</p>
          ) : (
            <ol className="mt-3 flex flex-col gap-4">
              {lead.activities.map((activity) => {
                const Icon = ACTIVITY_ICON[activity.type];
                return (
                  <li key={activity.id} className="flex gap-3">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                      <Icon className="size-3.5" aria-hidden />
                    </div>
                    <div>
                      <p className="text-body-sm leading-body-sm font-medium text-neutral-900">
                        {LEAD_ACTIVITY_TYPE_LABELS[activity.type]}
                      </p>
                      <p className="text-body-sm leading-body-sm text-neutral-600">
                        {activity.note}
                      </p>
                      <p className="mt-0.5 text-caption text-neutral-400">
                        {formatDateTime(new Date(activity.createdAt))}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-neutral-200 p-4">
          <Select value={type} onValueChange={(v) => setType(v as (typeof LEAD_ACTIVITY_TYPES)[number])}>
            <SelectTrigger className="h-9 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_ACTIVITY_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {LEAD_ACTIVITY_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ne oldu? (ör. 'Numune gönderildi, teslimat için depo ile görüşüldü')"
            className="min-h-20"
          />
          <Button onClick={handleSubmit} disabled={isPending || !note.trim()}>
            Kaydet
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
