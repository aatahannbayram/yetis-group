import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/infra/auth/server";
import { isStaffUser, getUserDealerId } from "@/infra/db/users";
import { getOpenLeadsCount } from "@/infra/db/leads";
import { listDealerOptions } from "@/infra/db/dealers";
import { listStaffNotifications, countUnreadStaff } from "@/infra/db/notifications";
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

  if (!(await isStaffUser(session.user.id))) {
    const dealerId = await getUserDealerId(session.user.id);
    redirect(dealerId ? "/bayi" : "/auth?reason=staff");
  }

  const [openLeadsCount, dealers, notifications, unreadCount] = await Promise.all([
    getOpenLeadsCount(),
    listDealerOptions(),
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
        <SidebarProvider>
          <AdminSidebar openLeadsCount={openLeadsCount} />
          <SidebarInset className="min-w-0 bg-background">
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
            <main className="flex-1 px-3 py-4 sm:px-4 sm:py-5 md:p-6">
              <MotionShell>{children}</MotionShell>
            </main>
          </SidebarInset>
          <CommandPalette
            dealers={dealers.map((d) => ({ id: d.id, unvan: d.unvan }))}
          />
          <AiAssistantDock pageContext="Yetiş operasyon paneli" />
        </SidebarProvider>
        <Toaster />
      </AdminShell>
    </TooltipProvider>
  );
}
