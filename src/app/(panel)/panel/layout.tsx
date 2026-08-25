import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/infra/auth/server";
import { getStaffProfile, getUserDealerId } from "@/infra/db/users";
import { getOpenLeadsCount } from "@/infra/db/leads";
import { listDealerOptions } from "@/infra/db/dealers";
import { listStaffNotifications, countUnreadStaff } from "@/infra/db/notifications";
import { canAccessPanelPath } from "@/domain/staff/roles";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminShell } from "@/components/admin/admin-theme-context";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { CommandPalette } from "@/components/admin/command-palette";
import { AiAssistantDock } from "@/components/workspace/ai-assistant-dock";
import { ImpersonationBanner } from "@/components/workspace/impersonation-banner";
import { IMPERSONATE_COOKIE, parseImpersonationCookie } from "@/lib/impersonation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { MotionShell } from "@/components/motion/motion-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth");
  }

  const profile = await getStaffProfile(session.user.id);
  if (!profile?.isStaff) {
    const dealerId = await getUserDealerId(session.user.id);
    redirect(dealerId ? "/bayi" : "/auth?reason=staff");
  }

  const pathname = (await headers()).get("x-pathname") ?? "/panel";
  if (!canAccessPanelPath(pathname, profile.staffRole)) {
    redirect("/panel");
  }

  const dealerOpts = profile.isPlasiyer
    ? { salesRepId: session.user.id }
    : undefined;

  const [openLeadsCount, dealers, notifications, unreadCount] = await Promise.all([
    profile.isPlasiyer ? Promise.resolve(0) : getOpenLeadsCount(),
    listDealerOptions(dealerOpts),
    listStaffNotifications(8),
    countUnreadStaff(),
  ]);

  const jar = await cookies();
  const impersonateId = parseImpersonationCookie(jar.get(IMPERSONATE_COOKIE)?.value);
  const impersonated = impersonateId
    ? dealers.find((d) => d.id === impersonateId) ?? null
    : null;

  return (
    <TooltipProvider delayDuration={200}>
      <AdminShell>
        <SidebarProvider className="bg-[var(--canvas)]">
          <AdminSidebar openLeadsCount={openLeadsCount} staffRole={profile.staffRole} />
          <SidebarInset className="min-w-0 overflow-hidden bg-[var(--surface)] md:peer-data-[variant=inset]:m-3 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-[var(--radius-xl)] md:peer-data-[variant=inset]:shadow-[var(--shadow-md)] md:peer-data-[variant=inset]:ring-1 md:peer-data-[variant=inset]:ring-[var(--border)]/60">
            {impersonated ? (
              <ImpersonationBanner dealerId={impersonated.id} dealerName={impersonated.unvan} />
            ) : null}
            <AdminTopbar
              userName={session.user.name}
              userEmail={session.user.email}
              notifications={notifications.map((n) => ({
                id: n.id,
                title: n.title,
                body: n.body,
                link: n.link,
                readAt: n.readAt?.toISOString() ?? null,
                createdAt: n.createdAt.toISOString(),
              }))}
              unreadCount={unreadCount}
            />
            <main className="flex-1 px-3 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6">
              <MotionShell>{children}</MotionShell>
            </main>
          </SidebarInset>
          <CommandPalette
            dealers={dealers.map((d) => ({ id: d.id, unvan: d.unvan }))}
          />
          {!profile.isPlasiyer ? (
            <AiAssistantDock pageContext="Yetiş operasyon paneli" />
          ) : null}
        </SidebarProvider>
        <Toaster />
      </AdminShell>
    </TooltipProvider>
  );
}
