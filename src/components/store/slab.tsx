import { cn } from "@/lib/utils";

type SlabProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: "section" | "div" | "footer" | "header";
};

export function Slab({ children, className, id, as: Tag = "section" }: SlabProps) {
  return (
    <Tag id={id} className={cn("mkt-slab", className)}>
      {children}
    </Tag>
  );
}

export function Canvas({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mkt-canvas mkt-slab-gap min-h-full", className)}>{children}</div>;
}
