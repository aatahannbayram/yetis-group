import { cn } from "@/lib/utils";

/** Truncate with mandatory title/tooltip for clipped text. Never use on buttons. */
export function TruncatedText({
  children,
  className,
  as: Tag = "span",
}: {
  children: string;
  className?: string;
  as?: "span" | "p" | "div";
}) {
  return (
    <Tag className={cn("truncate", className)} title={children}>
      {children}
    </Tag>
  );
}
