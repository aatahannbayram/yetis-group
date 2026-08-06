import { getLeads, getLeadDashboardData } from "@/infra/db/leads";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { LeadsBoard } from "@/components/admin/leads-board";
import { ensureDefaultLeadFields } from "@/infra/db/lead-fields";

export default async function LeadsPage() {
  await ensureDefaultLeadFields();
  const [leads, dash] = await Promise.all([getLeads(), getLeadDashboardData()]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <AdminPageHeader
        title="Bayi Adayları"
        description="Tüm giriş kanalları (iletişim formu, bayilik, numune…) tek Lead havuzuna düşer. Kazanılınca Dealer’a terfi eder."
      />

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-h4 font-semibold">Kaynak bazlı dönüşüm</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-body-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="py-2 pr-3 font-medium">Kaynak</th>
                <th className="py-2 pr-3 font-medium">Toplam</th>
                <th className="py-2 pr-3 font-medium">Açık</th>
                <th className="py-2 pr-3 font-medium">Kazanılan</th>
                <th className="py-2 pr-3 font-medium">Kayıp</th>
                <th className="py-2 font-medium">Dönüşüm %</th>
              </tr>
            </thead>
            <tbody>
              {dash.sourceConversion.map((row) => (
                <tr key={row.source} className="border-b border-border/70">
                  <td className="py-2.5 pr-3 font-medium">{row.label}</td>
                  <td className="py-2.5 pr-3 tabular-nums">{row.total}</td>
                  <td className="py-2.5 pr-3 tabular-nums">{row.open}</td>
                  <td className="py-2.5 pr-3 tabular-nums">{row.won}</td>
                  <td className="py-2.5 pr-3 tabular-nums">{row.lost}</td>
                  <td className="py-2.5 tabular-nums">{row.conversionRate}</td>
                </tr>
              ))}
              {dash.sourceConversion.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-muted-foreground">
                    Henüz lead yok.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <LeadsBoard
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
    </div>
  );
}
