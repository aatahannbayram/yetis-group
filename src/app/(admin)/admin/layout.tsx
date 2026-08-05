import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminShell } from "@/components/admin/admin-theme-context";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { CommandPalette } from "@/components/admin/command-palette";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth");
  }

  // Bayi/müşteri hesapları (DEALER) mağazayı kullanır — admin paneli sadece
  // Yetiş çalışanlarına (STAFF) açık.
  if (!(await isStaffUser(session.user.id))) {
    redirect("/");
  }

  return (
    <TooltipProvider delayDuration={200}>
      <AdminShell>
        <SidebarProvider>
          <AdminSidebar />
          <SidebarInset className="bg-background">
            <AdminTopbar userName={session.user.name} />
            <main className="flex-1 p-6">{children}</main>
          </SidebarInset>
          <CommandPalette />
        </SidebarProvider>
      </AdminShell>
    </TooltipProvider>
  );
}
