const PALETTE = [
  "bg-brand-50 text-brand-700",
  "bg-brand-100 text-brand-800",
  "bg-neutral-100 text-neutral-600",
];

function paletteFor(category: string) {
  let hash = 0;
  for (const char of category) hash = (hash * 31 + char.charCodeAt(0)) % PALETTE.length;
  return PALETTE[hash];
}

export function ProductPlaceholder({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  return (
    <div
      className={`flex aspect-square items-center justify-center rounded-lg ${paletteFor(category)} ${className ?? ""}`}
      aria-hidden
    >
      <span className="text-h1 leading-h1 font-semibold opacity-70">
        {category.charAt(0).toLocaleUpperCase("tr-TR")}
      </span>
    </div>
  );
}
