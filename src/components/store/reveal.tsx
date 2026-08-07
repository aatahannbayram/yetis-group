"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { MOTION } from "@/lib/motion";
import { easeOutExpo } from "@/lib/motion-presets";

/**
 * Scroll reveal — SSR-visible by default, then animates in with Motion.
 * Respects prefers-reduced-motion.
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
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) {
      setShown(true);
      return;
    }

    const rect = el.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
    if (alreadyVisible) {
      setShown(true);
      return;
    }

    setShown(false);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={false}
      animate={
        shown
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: MOTION.revealY }
      }
      transition={{
        duration: MOTION.slow / 1000,
        delay: delay / 1000,
        ease: easeOutExpo,
      }}
    >
      {children}
    </motion.div>
  );
}
