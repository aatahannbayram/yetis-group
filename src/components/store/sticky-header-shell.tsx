"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * Overlay hero: transparent on the photo; after scroll a floating cream glass bar.
 * Pinned overlay bars portal to document.body so hero `overflow: hidden` cannot clip them.
 */
export function StickyHeaderShell({
  children,
  className,
  overlay = false,
}: {
  children: React.ReactNode;
  className?: string;
  overlay?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!overlay) return;
    setPortalTarget(document.body);
  }, [overlay]);

  const tree = (
    <header
      data-pin={overlay ? "true" : "false"}
      data-overlay={overlay ? "true" : "false"}
      data-stuck={scrolled ? "true" : "false"}
      className={cn("store-hdr group/hdr", className)}
    >
      <div className="store-hdr-bar">{children}</div>
    </header>
  );

  if (overlay && portalTarget) {
    return createPortal(tree, portalTarget);
  }

  return tree;
}
