import type { ReactNode } from "react";
import type { Metadata } from "next";
import { DealerShell } from "@/components/yg-ops/dealer/dealer-shell";

export const metadata: Metadata = {
  title: "Bayi portal (Ops UI)",
  robots: { index: false, follow: false },
};

/** Auth yok (mock). Mevcut /bayi dokunulmaz. */
export default function PortalGroupLayout({ children }: { children: ReactNode }) {
  return <DealerShell>{children}</DealerShell>;
}
