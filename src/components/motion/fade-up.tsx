"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  fadeUp,
  fadeUpTransition,
  scaleIn,
  staggerContainer,
  staggerItem,
} from "@/lib/motion-presets";

export function FadeUp({
  children,
  className,
  delay = 0,
  mode = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  mode?: "up" | "in" | "fade";
}) {
  const reduced = useReducedMotion();
  const variants =
    mode === "in"
      ? scaleIn
      : mode === "fade"
        ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
        : fadeUp;

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{ ...fadeUpTransition, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div className={cn(className)} variants={staggerItem}>
      {children}
    </motion.div>
  );
}
