import { Construction } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ComingSoonPage({
  title,
  description,
  relatedLink,
}: {
  title: string;
  description: string;
  icon?: unknown;
  badge?: string;
  relatedLink?: { href: string; label: string };
}) {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={title} />
      <div className="mt-8 flex max-w-md flex-col gap-4">
        <EmptyState
          icon={Construction}
          title="Yakında"
          description={description}
          tip="Bu ekran hazır olduğunda burada görünecek."
        />
        {relatedLink ? (
          <Link
            href={relatedLink.href}
            className="inline-flex items-center gap-1.5 self-start rounded-[var(--radius-sm)] bg-[var(--panel-accent-action)] px-4 py-2.5 text-[length:var(--panel-font-size)] font-semibold text-white transition-colors hover:bg-brand-800"
          >
            {relatedLink.label}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
