"use client";

import { useMemo, useState } from "react";
import { Building2, MapPin, Phone, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LEAD_ACTIVITY_TYPES, LEAD_CHANNEL_LABELS, LEAD_STAGES, LEAD_STAGE_LABELS } from "@/domain/leads";
import { formatKg } from "@/lib/format/weight";
import { kg } from "@/domain/weight";
import { LeadDetailSheet } from "@/components/admin/lead-detail-sheet";

const STAGE_BADGE_VARIANT: Record<(typeof LEAD_STAGES)[number], "default" | "secondary" | "outline"> = {
  YENI: "outline",
  ILETISIMDE: "secondary",
  NITELIKLI: "secondary",
  NUMUNE: "secondary",
  NUMUNE_TEKLIF: "secondary",
  TEKLIF: "secondary",
  MUZAKERE: "secondary",
  KAZANILDI: "default",
  KAYBEDILDI: "outline",
};

export type LeadItem = {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  city: string;
  channel: string;
  stage: (typeof LEAD_STAGES)[number];
  estimatedMonthlyKg: string | null;
  note: string | null;
  activities: {
    id: string;
    type: (typeof LEAD_ACTIVITY_TYPES)[number];
    note: string;
    createdAt: string;
  }[];
};

export function LeadsBoard({ leads }: { leads: LeadItem[] }) {
  const [query, setQuery] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return leads;
    return leads.filter(
      (lead) =>
        lead.companyName.toLocaleLowerCase("tr-TR").includes(q) ||
        lead.contactName.toLocaleLowerCase("tr-TR").includes(q) ||
        lead.city.toLocaleLowerCase("tr-TR").includes(q),
    );
  }, [leads, query]);

  const columns = LEAD_STAGES.map((stage) => ({
    stage,
    label: LEAD_STAGE_LABELS[stage],
    leads: filtered.filter((lead) => lead.stage === stage),
  }));

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) ?? null;

  return (
    <div>
      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Şirket, kişi veya şehir ara..."
          className="h-10 border-border bg-muted pl-9 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-6 flex snap-x gap-4 overflow-x-auto pb-4">
        {columns.map(({ stage, label, leads: stageLeads }) => (
          <div key={stage} className="w-70 shrink-0 snap-start">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-body-sm leading-body-sm font-semibold text-neutral-700">
                {label}
              </h2>
              <span className="tabular-nums text-caption text-neutral-400">
                {stageLeads.length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {stageLeads.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-200 p-4 text-center text-caption text-neutral-400">
                  Boş
                </div>
              ) : (
                stageLeads.map((lead) => (
                  <Card
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className="cursor-pointer shadow-sm transition-shadow hover:shadow-md"
                  >
                    <CardContent className="flex flex-col gap-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-body-sm leading-body-sm font-semibold text-neutral-900">
                          {lead.companyName}
                        </p>
                        <Badge
                          variant={STAGE_BADGE_VARIANT[lead.stage]}
                          className={
                            STAGE_BADGE_VARIANT[lead.stage] === "outline"
                              ? "shrink-0 border-neutral-300 text-neutral-700"
                              : "shrink-0"
                          }
                        >
                          {LEAD_CHANNEL_LABELS[lead.channel]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-caption text-neutral-500">
                        <Building2 className="size-3.5" aria-hidden />
                        {lead.contactName}
                      </div>
                      <div className="flex items-center gap-1.5 text-caption text-neutral-500">
                        <Phone className="size-3.5" aria-hidden />
                        {lead.phone}
                      </div>
                      <div className="flex items-center gap-1.5 text-caption text-neutral-500">
                        <MapPin className="size-3.5" aria-hidden />
                        {lead.city}
                      </div>
                      {lead.estimatedMonthlyKg ? (
                        <p className="tabular-nums text-caption font-medium text-brand-700">
                          ~{formatKg(kg(lead.estimatedMonthlyKg))}/ay
                        </p>
                      ) : null}
                      {lead.activities.length > 0 ? (
                        <p className="border-t border-neutral-100 pt-2 text-caption leading-caption text-neutral-500">
                          {lead.activities.length} kayıt &middot; son: {lead.activities[0].note}
                        </p>
                      ) : lead.note ? (
                        <p className="border-t border-neutral-100 pt-2 text-caption leading-caption text-neutral-500">
                          {lead.note}
                        </p>
                      ) : null}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <LeadDetailSheet
        lead={selectedLead}
        open={selectedLeadId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedLeadId(null);
        }}
      />
    </div>
  );
}
