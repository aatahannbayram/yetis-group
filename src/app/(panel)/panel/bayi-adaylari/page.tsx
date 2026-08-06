import { getLeads } from "@/infra/db/leads";
import { ensureDefaultLeadFields } from "@/infra/db/lead-fields";
import { LeadsListPage } from "@/features/staff/leads/leads-list-page";

export default async function LeadsPage() {
  await ensureDefaultLeadFields();
  const leads = await getLeads();

  return (
    <LeadsListPage
      leads={leads.map((lead) => ({
        id: lead.id,
        companyName: lead.companyName,
        contactName: lead.contactName,
        phone: lead.phone,
        email: lead.email,
        city: lead.city,
        channel: lead.channel,
        source: lead.source,
        stage: lead.stage,
        estimatedMonthlyKg: lead.estimatedMonthlyKg?.toString() ?? null,
        note: lead.note,
        interestedCategory: lead.interestedCategory?.name ?? null,
        assigneeName: lead.assignee?.name ?? null,
        updatedAt: lead.updatedAt.toISOString(),
        fieldValues: lead.fieldValues.map((fv) => ({
          label: fv.field.label,
          value: fv.valueText ?? fv.valueNum?.toString() ?? "",
        })),
        tasks: lead.tasks.map((t) => ({
          id: t.id,
          title: t.title,
          dueAt: t.dueAt?.toISOString() ?? null,
          doneAt: t.doneAt?.toISOString() ?? null,
        })),
        activities: lead.activities.map((activity) => ({
          id: activity.id,
          type: activity.type,
          note: activity.note,
          createdAt: activity.createdAt.toISOString(),
        })),
      }))}
    />
  );
}
