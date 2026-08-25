import type { ReactNode } from "react";
import type { Metadata } from "next";
import { AdminShell } from "@/components/yg-ops/admin/admin-shell";

export const metadata: Metadata = {
  title: "Yönetim (Ops UI)",
  robots: { index: false, follow: false },
};

/** Auth yok (mock). Mevcut /panel dokunulmaz. */
export default function YonetimGroupLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
