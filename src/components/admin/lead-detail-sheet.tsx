"use client";

import { useState, useTransition } from "react";
import {
  MapPin,
  Phone,
  FileText,
  Handshake,
  Truck,
  RefreshCcw,
  MessageCircle,
  PhoneCall,
  Mail,
  ListTodo,
  Bell,
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
  LEAD_SOURCE_LABELS,
  LEAD_STAGE_LABELS,
} from "@/domain/leads";
import { formatKg } from "@/lib/format/weight";
import { kg } from "@/domain/weight";
import { formatDateTime } from "@/lib/format/date";
import { addLeadActivityAction, transitionLeadStageAction } from "@/app/(admin)/admin/bayi-adaylari/actions";
import {
  completeLeadTaskAction,
  createLeadTaskAction,
} from "@/app/(admin)/admin/crm-alanlari/actions";
import { LEAD_STAGES, type LeadStage } from "@/domain/leads";
import { Input } from "@/components/ui/input";
import type { LeadItem } from "@/components/admin/leads-board";

const ACTIVITY_ICON: Record<(typeof LEAD_ACTIVITY_TYPES)[number], typeof Phone> = {
  ARAMA: Phone,
  NOT: FileText,
  TEKLIF: Handshake,
  TESLIMAT: Truck,
  DURUM_DEGISIKLIGI: RefreshCcw,
  EMAIL: Mail,
  WHATSAPP: MessageCircle,
  FORM: FileText,
  GOREV: ListTodo,
  HATIRLATMA: Bell,
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
  const [toStage, setToStage] = useState<LeadStage>(lead?.stage ?? "YENI");
  const [lostReason, setLostReason] = useState("");
  const [stageError, setStageError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!lead) return null;

  function handleSubmit() {
    if (!lead || !note.trim()) return;
    startTransition(async () => {
      await addLeadActivityAction(lead.id, type, note);
      setNote("");
    });
  }

  function handleStageChange() {
    if (!lead) return;
    setStageError(null);
    startTransition(async () => {
      try {
        await transitionLeadStageAction({
          leadId: lead.id,
          toStage,
          lostReason: toStage === "KAYBEDILDI" ? lostReason : null,
        });
      } catch (err) {
        setStageError(err instanceof Error ? err.message : "Aşama güncellenemedi.");
      }
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
            <Badge variant="outline" className="border-neutral-300 text-neutral-700">
              {LEAD_SOURCE_LABELS[lead.source] ?? lead.source}
            </Badge>
          </SheetDescription>
        </SheetHeader>

        <div className="border-b border-neutral-100 px-4 pb-4">
          <div className="mb-3 flex flex-wrap items-end gap-2">
            <div className="min-w-40 flex-1">
              <p className="mb-1 text-caption text-neutral-500">Aşama</p>
              <Select value={toStage} onValueChange={(v) => setToStage(v as LeadStage)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {LEAD_STAGE_LABELS[stage]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {toStage === "KAYBEDILDI" ? (
              <div className="min-w-40 flex-1">
                <p className="mb-1 text-caption text-neutral-500">Kayıp nedeni</p>
                <Input
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  placeholder="Zorunlu"
                />
              </div>
            ) : null}
            <Button type="button" variant="outline" disabled={isPending} onClick={handleStageChange}>
              Güncelle
            </Button>
          </div>
          {stageError ? <p className="mb-2 text-caption text-danger-fg">{stageError}</p> : null}
          {lead.estimatedMonthlyKg ? (
            <p className="mb-3 tabular-nums text-body-sm font-medium text-brand-700">
              ~{formatKg(kg(lead.estimatedMonthlyKg))}/ay tahmini hacim
            </p>
          ) : null}
          <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-700 text-body-sm font-semibold text-white">
              {lead.contactName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-sm leading-body-sm font-semibold text-neutral-900">
                {lead.contactName}
              </p>
              <p className="flex items-center gap-1 truncate text-caption text-neutral-500">
                <MapPin className="size-3" aria-hidden />
                {lead.city}
              </p>
              {lead.email ? (
                <p className="truncate text-caption text-neutral-500">{lead.email}</p>
              ) : null}
              {lead.interestedCategory ? (
                <p className="truncate text-caption text-neutral-500">
                  İlgi: {lead.interestedCategory}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 gap-1.5">
              <a
                href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex size-8 items-center justify-center rounded-full bg-white text-neutral-500 shadow-sm transition-colors hover:text-brand-700"
                aria-label="WhatsApp'tan yaz"
              >
                <MessageCircle className="size-4" aria-hidden />
              </a>
              <a
                href={`tel:${lead.phone}`}
                className="flex size-8 items-center justify-center rounded-full bg-white text-neutral-500 shadow-sm transition-colors hover:text-brand-700"
                aria-label="Ara"
              >
                <PhoneCall className="size-4" aria-hidden />
              </a>
            </div>
          </div>
          {lead.fieldValues.length > 0 ? (
            <ul className="mt-3 space-y-1 rounded-2xl border border-neutral-200 p-3 text-caption text-neutral-600">
              {lead.fieldValues.map((fv) => (
                <li key={fv.label}>
                  <span className="font-medium text-neutral-800">{fv.label}:</span> {fv.value}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="border-b border-neutral-100 px-4 py-3">
          <h3 className="text-caption font-semibold tracking-[0.1em] text-neutral-500 uppercase">
            Görevler
          </h3>
          <ul className="mt-2 space-y-2">
            {lead.tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-body-sm"
              >
                <div>
                  <p className={task.doneAt ? "text-neutral-400 line-through" : ""}>{task.title}</p>
                  {task.dueAt ? (
                    <p className="text-caption text-neutral-400">
                      Vade: {formatDateTime(new Date(task.dueAt))}
                    </p>
                  ) : null}
                </div>
                {!task.doneAt ? (
                  <form action={completeLeadTaskAction}>
                    <input type="hidden" name="id" value={task.id} />
                    <Button type="submit" size="sm" variant="outline">
                      Tamamla
                    </Button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
          <form action={createLeadTaskAction} className="mt-3 flex gap-2">
            <input type="hidden" name="leadId" value={lead.id} />
            <Input name="title" placeholder="Yeni görev" className="h-9" required />
            <Input name="dueAt" type="date" className="h-9 w-36" />
            <Button type="submit" size="sm">
              Ekle
            </Button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <h3 className="text-caption leading-caption font-semibold tracking-[0.1em] text-neutral-500 uppercase">
            Geçmiş / Akıbet
          </h3>
          {lead.activities.length === 0 ? (
            <p className="mt-3 text-body-sm text-neutral-400">Henüz kayıt yok.</p>
          ) : (
            <ol className="mt-3 flex flex-col">
              {lead.activities.map((activity, index) => {
                const Icon = ACTIVITY_ICON[activity.type];
                const isLast = index === lead.activities.length - 1;
                return (
                  <li key={activity.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white">
                        <Icon className="size-3" aria-hidden />
                      </div>
                      {!isLast ? (
                        <div className="w-px flex-1 bg-neutral-200" aria-hidden />
                      ) : null}
                    </div>
                    <div className={isLast ? "pb-1" : "pb-5"}>
                      <p className="text-caption text-neutral-400">
                        {formatDateTime(new Date(activity.createdAt))}
                      </p>
                      <p className="text-body-sm leading-body-sm font-semibold text-neutral-900">
                        {LEAD_ACTIVITY_TYPE_LABELS[activity.type]}
                      </p>
                      <p className="text-body-sm leading-body-sm text-neutral-600">
                        {activity.note}
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
