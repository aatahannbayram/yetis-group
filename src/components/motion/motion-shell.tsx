"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { easeOutExpo, fadeUpTransition } from "@/lib/motion-presets";
import { cn } from "@/lib/utils";

/** Soft top progress on client navigations. */
export function RouteProgress({ className }: { className?: string }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (reduced) return;
    setActive(true);
    const done = window.setTimeout(() => setActive(false), 520);
    return () => window.clearTimeout(done);
  }, [pathname, reduced]);

  if (reduced) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px] overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <AnimatePresence>
        {active ? (
          <motion.div
            key={pathname}
            className="h-full origin-left bg-[#1B5E3A] dark:bg-emerald-400"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.48, ease: easeOutExpo }}
            style={{ transformOrigin: "0% 50%" }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** Page content entrance — wrap panel/store main children. */
export function PageEnter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      key={pathname}
      className={className}
      initial={{ opacity: 1, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={fadeUpTransition}
    >
      {children}
    </motion.div>
  );
}

export function MotionShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <RouteProgress />
      <PageEnter className={className}>{children}</PageEnter>
    </>
  );
}
