"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Sticky glass header for canvas (non-overlay) pages.
 * Adds stronger blur + border after 80px scroll.
 */
export function StickyHeaderShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "border-b transition-[background-color,backdrop-filter,border-color] duration-200",
        scrolled
          ? "border-[color:var(--mkt-border)] bg-mkt-slab/85 backdrop-blur-md"
          : "border-[color:var(--mkt-border)] bg-mkt-slab/90 backdrop-blur",
        className,
      )}
    >
      {children}
    </div>
  );
}
