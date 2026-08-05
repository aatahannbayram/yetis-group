import { getLeads } from "@/infra/db/leads";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { LeadsBoard } from "@/components/admin/leads-board";

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Bayi Adayları"
        description="Görüşme aşamasındaki potansiyel bayiler — kazanılan adaylar M2'de gerçek bayi hesabına dönüştürülecek."
      />

      <div className="mt-8">
        <LeadsBoard
          leads={leads.map((lead) => ({
            id: lead.id,
            companyName: lead.companyName,
            contactName: lead.contactName,
            phone: lead.phone,
            city: lead.city,
            channel: lead.channel,
            stage: lead.stage,
            estimatedMonthlyKg: lead.estimatedMonthlyKg?.toString() ?? null,
            note: lead.note,
            activities: lead.activities.map((activity) => ({
              id: activity.id,
              type: activity.type,
              note: activity.note,
              createdAt: activity.createdAt.toISOString(),
            })),
          }))}
        />
      </div>
    </div>
  );
}
