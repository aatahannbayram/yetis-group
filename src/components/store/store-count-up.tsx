"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "motion/react";

function AnimatedCount({
  value,
  suffix,
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controls = animate(0, value, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        const n =
          decimals > 0
            ? v.toFixed(decimals)
            : Math.round(v).toLocaleString("tr-TR");
        node.textContent = n + (suffix ?? "");
      },
    });

    return () => controls.stop();
  }, [value, suffix, decimals]);

  return <span ref={ref}>0{suffix}</span>;
}

/** Scroll-triggered count-up for store marketing stats. */
export function StoreCountUp({
  value,
  suffix,
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  if (reduced) {
    const n =
      decimals > 0 ? value.toFixed(decimals) : value.toLocaleString("tr-TR");
    return (
      <span>
        {n}
        {suffix}
      </span>
    );
  }

  return (
    <span ref={ref}>
      {started ? (
        <AnimatedCount value={value} suffix={suffix} decimals={decimals} />
      ) : (
        <>0{suffix}</>
      )}
    </span>
  );
}
