"use client";

import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";

function AnimatedCount({ value, suffix }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controls = animate(0, value, {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        node.textContent = Math.round(v).toLocaleString("tr-TR") + (suffix ?? "");
      },
    });

    return () => controls.stop();
  }, [value, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export function CountUp({ value, suffix }: { value: number; suffix?: string }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <>
        {value.toLocaleString("tr-TR")}
        {suffix}
      </>
    );
  }

  return <AnimatedCount value={value} suffix={suffix} />;
}
