export function AdminPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h1 className="text-h2 leading-h2 font-semibold text-foreground">{title}</h1>
      {description ? (
        <p className="mt-1 text-body leading-body text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
