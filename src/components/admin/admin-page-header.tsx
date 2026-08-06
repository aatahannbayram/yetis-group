import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-h3 leading-h3 font-bold tracking-[-0.02em] text-foreground md:text-h2 md:leading-h2">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-body-sm leading-relaxed text-muted-foreground md:text-body">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
