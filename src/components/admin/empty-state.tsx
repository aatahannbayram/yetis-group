import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  badge,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-3xl border border-dashed border-neutral-300 bg-card p-6">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
        <Icon className="size-5" aria-hidden />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-h4 leading-h4 font-semibold text-neutral-900">{title}</h3>
          {badge ? (
            <span className="rounded-full bg-info-bg px-2 py-0.5 text-caption leading-caption font-medium text-info-fg">
              {badge}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-body-sm leading-body-sm text-neutral-500">{description}</p>
      </div>
    </div>
  );
}
