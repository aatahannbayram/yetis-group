import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/admin/empty-state";

export function ComingSoonPage({
  title,
  description,
  icon,
  badge,
  relatedLink,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  relatedLink?: { href: string; label: string };
}) {
  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader title={title} />
      <div className="mt-8 flex max-w-md flex-col gap-4">
        <EmptyState icon={icon} title="Henüz eklenmedi" description={description} badge={badge} />
        {relatedLink ? (
          <Link
            href={relatedLink.href}
            className="flex items-center gap-1.5 self-start rounded-full bg-brand-700 px-4 py-2.5 text-body-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-800"
          >
            {relatedLink.label}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
