"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/lib/motion-presets";

const viewport = { once: true, amount: 0.2, margin: "0px 0px -10% 0px" } as const;

const transition = { duration: 0.72, ease: easeOutExpo };

const variants: Record<"up" | "left" | "right" | "scale", Variants> = {
  up: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition },
  },
  left: {
    hidden: { opacity: 0, x: -48 },
    visible: { opacity: 1, x: 0, transition },
  },
  right: {
    hidden: { opacity: 0, x: 48 },
    visible: { opacity: 1, x: 0, transition },
  },
  scale: {
    hidden: { opacity: 0, scale: 1.08 },
    visible: { opacity: 1, scale: 1, transition: { duration: 1.05, ease: easeOutExpo } },
  },
};

/** Scroll-triggered enter for the storefront homepage. */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  from = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  from?: "up" | "left" | "right" | "scale";
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  const preset = variants[from];
  const withDelay: Variants = delay
    ? {
        hidden: preset.hidden,
        visible: {
          ...(typeof preset.visible === "object" ? preset.visible : {}),
          transition: {
            ...(typeof preset.visible === "object" &&
            preset.visible &&
            "transition" in preset.visible
              ? preset.visible.transition
              : transition),
            delay,
          },
        },
      }
    : preset;

  return (
    <motion.div
      className={cn(from === "scale" && "h-full w-full", className)}
      variants={withDelay}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      {children}
    </motion.div>
  );
}

const staggerParent: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
};

export function ScrollStagger({
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
      variants={staggerParent}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      {children}
    </motion.div>
  );
}

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition },
};

export function ScrollItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div className={className} variants={staggerChild}>
      {children}
    </motion.div>
  );
}
