"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MOTION } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

/**
 * Renders fully visible by default (SSR, pre-hydration, no-JS, crawlers).
 * Off-screen elements reveal on scroll. Respects prefers-reduced-motion.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [state, setState] = useState<"visible" | "hidden" | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      setState("visible");
      return;
    }

    const rect = el.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (alreadyVisible) {
      setState("visible");
      return;
    }

    setState("hidden");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("visible");
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <div
      ref={ref}
      data-reveal={state === null ? undefined : state === "visible"}
      style={{
        transitionDelay: reduced ? "0ms" : `${delay}ms`,
        transitionDuration: reduced ? "0ms" : `${MOTION.slow}ms`,
      }}
      className={cn(className)}
    >
      {children}
    </div>
  );
}
