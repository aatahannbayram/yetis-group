"use client";

import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { AnimatePresence, motion } from "motion/react";
import { CircleAlert, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LEAD_STAGE_LABELS,
  isTransitionAllowed,
  type LeadStage,
} from "@/domain/leads";
import { transitionLeadStageAction } from "@/app/(panel)/panel/bayi-adaylari/actions";
import {
  leadStaleDays,
  leadStaleLabel,
  leadStaleTone,
} from "@/features/staff/leads/staleness";
import { formatKg } from "@/lib/format/weight";
import { kg } from "@/domain/weight";
import { cn } from "@/lib/utils";
import type { LeadItem } from "@/components/admin/leads-board";

export type KanbanLead = LeadItem & { updatedAt: string };

/** Open pipeline — terminal stages optional when present in data. */
const PIPELINE_STAGES: LeadStage[] = [
  "YENI",
  "ILETISIMDE",
  "NITELIKLI",
  "NUMUNE",
  "NUMUNE_TEKLIF",
  "TEKLIF",
  "MUZAKERE",
];

const TERMINAL_STAGES: LeadStage[] = ["KAZANILDI", "KAYBEDILDI"];

function nextAction(lead: KanbanLead): string {
  const openTask = lead.tasks.find((t) => !t.doneAt);
  if (openTask) return openTask.title;
  if (lead.stage === "YENI") return "İlk arama yap";
  if (lead.stage === "ILETISIMDE") return "İhtiyaç netleştir";
  if (lead.stage === "NITELIKLI") return "Numune planla";
  if (lead.stage === "NUMUNE" || lead.stage === "NUMUNE_TEKLIF") return "Numune takibi";
  if (lead.stage === "TEKLIF" || lead.stage === "MUZAKERE") return "Teklifi kapat";
  return "-";
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function LeadCardFace({
  lead,
  dragHandleProps,
  muted,
}: {
  lead: KanbanLead;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  muted?: boolean;
}) {
  const days = leadStaleDays(lead.updatedAt);
  const tone = leadStaleTone(days);
  const action = nextAction(lead);

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-stone-200/90 bg-white p-3 shadow-sm transition-shadow",
        "hover:border-stone-300 hover:shadow-md",
        "dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700",
        muted && "opacity-40",
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[11px] font-semibold tracking-wide text-stone-600 dark:bg-zinc-800 dark:text-zinc-300">
          {initials(lead.companyName)}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-semibold text-stone-900 dark:text-zinc-50"
            title={lead.companyName}
          >
            {lead.companyName}
          </p>
          <p className="mt-0.5 truncate text-xs text-stone-500 dark:text-zinc-400">
            {lead.assigneeName ?? "Atanmadı"}
            <span className="text-stone-300 dark:text-zinc-600"> · </span>
            <span
              className={cn(
                tone === "critical" && "text-red-600 dark:text-red-400",
                tone === "urgent" && "text-amber-700 dark:text-amber-400",
                tone === "warn" && "text-amber-600",
              )}
            >
              {leadStaleLabel(days)}
            </span>
          </p>
        </div>
        {dragHandleProps ? (
          <div
            {...dragHandleProps}
            className="-mr-1 -mt-0.5 flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-stone-300 transition-colors hover:bg-stone-100 hover:text-stone-500 active:cursor-grabbing dark:hover:bg-zinc-800"
            aria-label="Sürükle"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="size-4" />
          </div>
        ) : null}
      </div>

      <p
        className="mt-2.5 truncate text-xs text-stone-600 dark:text-zinc-400"
        title={action}
      >
        {action}
      </p>

      {lead.estimatedMonthlyKg ? (
        <p className="mt-1.5 text-[11px] font-medium tabular-nums text-stone-400 dark:text-zinc-500">
          {formatKg(kg(lead.estimatedMonthlyKg))} / ay
        </p>
      ) : null}
    </div>
  );
}

function DraggableLeadCard({
  lead,
  onOpen,
}: {
  lead: KanbanLead;
  onOpen: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
    data: { stage: lead.stage },
  });

  return (
    <motion.div
      ref={setNodeRef}
      layout
      layoutId={lead.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDragging ? 0.3 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        role="button"
        tabIndex={0}
        className="cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E3A]/35 focus-visible:ring-offset-2"
        onClick={() => onOpen(lead.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(lead.id);
          }
        }}
      >
        <LeadCardFace
          lead={lead}
          muted={isDragging}
          dragHandleProps={{ ...attributes, ...listeners }}
        />
      </div>
    </motion.div>
  );
}

function KanbanColumn({
  stage,
  leads,
  onOpen,
}: {
  stage: LeadStage;
  leads: KanbanLead[];
  onOpen: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage, data: { stage } });
  const potential = leads.reduce(
    (s, l) => s + (l.estimatedMonthlyKg ? Number(l.estimatedMonthlyKg) : 0),
    0,
  );

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-[17.5rem] shrink-0 flex-col rounded-2xl border transition-all duration-200",
        isOver
          ? "border-[#1B5E3A]/40 bg-[#1B5E3A]/[0.06] shadow-[inset_0_0_0_1px_rgba(27,94,58,0.12)] dark:border-emerald-500/40 dark:bg-emerald-500/10"
          : "border-stone-200/80 bg-stone-100/70 dark:border-zinc-800 dark:bg-zinc-950/70",
      )}
    >
      <div className="sticky top-0 z-[1] flex items-start justify-between gap-2 rounded-t-2xl px-3 pt-3 pb-2 backdrop-blur-sm">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-stone-900 dark:text-zinc-50">
            {LEAD_STAGE_LABELS[stage]}
          </p>
          <p className="mt-0.5 text-[11px] tabular-nums text-stone-500 dark:text-zinc-400">
            {leads.length === 0
              ? "Boş"
              : `${leads.length} · ${Math.round(potential).toLocaleString("tr-TR")} kg/ay`}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
            leads.length > 0
              ? "bg-white text-stone-700 shadow-sm ring-1 ring-stone-200/80 dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-700"
              : "bg-stone-200/60 text-stone-400 dark:bg-zinc-800 dark:text-zinc-500",
          )}
        >
          {leads.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-2.5 pb-3">
        <AnimatePresence mode="popLayout">
          {leads.map((lead) => (
            <DraggableLeadCard key={lead.id} lead={lead} onOpen={onOpen} />
          ))}
        </AnimatePresence>

        {leads.length === 0 ? (
          <div
            className={cn(
              "flex min-h-[4.5rem] flex-1 items-center justify-center rounded-xl border border-dashed px-3 py-6 text-center text-xs transition-colors",
              isOver
                ? "border-[#1B5E3A]/50 text-[#1B5E3A] dark:border-emerald-400 dark:text-emerald-300"
                : "border-stone-300/70 text-stone-400 dark:border-zinc-700 dark:text-zinc-500",
            )}
          >
            {isOver ? "Bırak" : "Kart sürükleyin"}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function LeadsKanban({
  leads,
  onOpen,
}: {
  leads: KanbanLead[];
  onOpen: (id: string) => void;
}) {
  const [items, setItems] = useState(leads);
  const [synced, setSynced] = useState(leads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [pendingLost, setPendingLost] = useState<{ leadId: string; from: LeadStage } | null>(
    null,
  );
  const [lostReason, setLostReason] = useState("");
  const [isPending, startTransition] = useTransition();

  if (leads !== synced) {
    setSynced(leads);
    setItems(leads);
  }

  const columns = useMemo(() => {
    const stages = [...PIPELINE_STAGES];
    for (const t of TERMINAL_STAGES) {
      if (items.some((l) => l.stage === t) || leads.some((l) => l.stage === t)) {
        stages.push(t);
      }
    }
    return stages;
  }, [items, leads]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const activeLead = items.find((l) => l.id === activeId) ?? null;

  async function commitStage(leadId: string, toStage: LeadStage, lostReasonValue?: string) {
    const prev = items;
    setItems((cur) =>
      cur.map((l) => (l.id === leadId ? { ...l, stage: toStage, updatedAt: new Date().toISOString() } : l)),
    );
    setBoardError(null);
    try {
      await transitionLeadStageAction({
        leadId,
        toStage,
        lostReason: lostReasonValue ?? null,
      });
    } catch (e) {
      setItems(prev);
      setBoardError(e instanceof Error ? e.message : "Aşama güncellenemedi.");
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setBoardError(null);
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const lead = items.find((l) => l.id === active.id);
    if (!lead) return;

    const overId = String(over.id);
    const targetStage = (
      columns.includes(overId as LeadStage)
        ? overId
        : items.find((l) => l.id === overId)?.stage
    ) as LeadStage | undefined;

    if (!targetStage || lead.stage === targetStage) return;

    if (!isTransitionAllowed(lead.stage, targetStage)) {
      setBoardError(
        `${LEAD_STAGE_LABELS[lead.stage]} → ${LEAD_STAGE_LABELS[targetStage]} geçişine izin yok.`,
      );
      return;
    }

    if (targetStage === "KAYBEDILDI") {
      setPendingLost({ leadId: lead.id, from: lead.stage });
      setLostReason("");
      return;
    }

    startTransition(() => {
      void commitStage(lead.id, targetStage);
    });
  }

  function confirmLost() {
    if (!pendingLost || !lostReason.trim()) return;
    const { leadId } = pendingLost;
    setPendingLost(null);
    startTransition(() => {
      void commitStage(leadId, "KAYBEDILDI", lostReason.trim());
    });
  }

  return (
    <div className="relative">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-0.5">
        <p className="text-xs text-stone-500 dark:text-zinc-400">
          Kartları sütunlar arasında sürükleyerek aşama değiştirin.
        </p>
        {isPending ? (
          <span className="text-[11px] text-stone-400">Kaydediliyor…</span>
        ) : null}
      </div>

      {boardError ? (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <p className="flex-1">{boardError}</p>
          <button
            type="button"
            className="text-xs font-medium underline-offset-2 hover:underline"
            onClick={() => setBoardError(null)}
          >
            Kapat
          </button>
        </div>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
          {columns.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              leads={items.filter((l) => l.stage === stage)}
              onOpen={onOpen}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}>
          {activeLead ? (
            <div className="w-[16.5rem] rotate-[2deg] scale-[1.02] cursor-grabbing shadow-xl shadow-stone-900/10">
              <LeadCardFace lead={activeLead} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {pendingLost ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-labelledby="lost-reason-title"
            className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2
              id="lost-reason-title"
              className="text-base font-semibold text-stone-900 dark:text-zinc-50"
            >
              Kayıp nedeni
            </h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-zinc-400">
              Kaybedildi aşamasına geçmek için kısa bir neden gerekli.
            </p>
            <Input
              autoFocus
              className="mt-4 h-10 rounded-lg border-stone-200"
              placeholder="Örn. fiyat, rakip, zamanlama…"
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmLost();
              }}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setPendingLost(null)}
              >
                Vazgeç
              </Button>
              <Button
                type="button"
                className="bg-[#1B5E3A] text-white hover:bg-[#164e31]"
                disabled={!lostReason.trim()}
                onClick={confirmLost}
              >
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
