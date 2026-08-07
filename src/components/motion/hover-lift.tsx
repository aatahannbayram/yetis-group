"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { fadeUpTransition } from "@/lib/motion-presets";

/** Hover lift for interactive cards — subtle, modern. */
export function HoverLift({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn("will-change-transform", className)}
      whileHover={{ y: -3, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } }}
      whileTap={{ y: 0, scale: 0.992, transition: { duration: 0.12 } }}
      transition={fadeUpTransition}
    >
      {children}
    </motion.div>
  );
}
