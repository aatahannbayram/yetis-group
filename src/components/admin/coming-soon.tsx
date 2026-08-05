import type { LucideIcon } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/admin/empty-state";

export function ComingSoonPage({
  title,
  description,
  icon,
  badge,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
}) {
  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader title={title} />
      <div className="mt-8 max-w-md">
        <EmptyState icon={icon} title="Henüz eklenmedi" description={description} badge={badge} />
      </div>
    </div>
  );
}
