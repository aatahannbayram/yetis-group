"use client";

import Link from "next/link";
import { Eye, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { IMPERSONATE_COOKIE } from "@/lib/impersonation";

export function ImpersonationBanner({
  dealerName,
  dealerId,
}: {
  dealerName: string;
  dealerId: string;
}) {
  const router = useRouter();

  function stop() {
    document.cookie = `${IMPERSONATE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    router.refresh();
  }

  return (
    <div
      className="flex items-center gap-3 border-b border-[color-mix(in_srgb,var(--skt-soon)_40%,transparent)] bg-[var(--warning-bg)] px-3 py-2 text-[length:var(--panel-font-size)] text-[var(--warning-fg)]"
      role="status"
    >
      <Eye className="size-4 shrink-0" aria-hidden />
      <p className="min-w-0 flex-1">
        <span className="font-semibold">{dealerName}</span>
        {" "}olarak görüntülüyorsunuz.
        <Link href="/bayi" className="ml-2 underline underline-offset-2">
          Bayi alanına git
        </Link>
        <span className="sr-only">({dealerId})</span>
      </p>
      <button
        type="button"
        onClick={stop}
        className="inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--panel-border)] bg-white px-2 py-1 text-caption font-medium text-[var(--panel-ink)]"
      >
        <X className="size-3.5" aria-hidden />
        Çık
      </button>
    </div>
  );
}

export function startImpersonation(dealerId: string) {
  document.cookie = `${IMPERSONATE_COOKIE}=${encodeURIComponent(dealerId)}; Path=/; Max-Age=${60 * 60 * 8}; SameSite=Lax`;
}
