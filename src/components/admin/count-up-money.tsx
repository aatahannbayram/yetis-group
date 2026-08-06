"use client";

import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";

function AnimatedMoneyValue({ valueKurus }: { valueKurus: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controls = animate(0, valueKurus, {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        node.textContent = formatMoney(money(Math.round(v)));
      },
    });

    return () => controls.stop();
  }, [valueKurus]);

  return <span ref={ref}>{formatMoney(money(0))}</span>;
}

export function AnimatedMoney({ valueKurus }: { valueKurus: number }) {
  const reduced = useReducedMotion();

  if (reduced) return <>{formatMoney(money(valueKurus))}</>;

  return <AnimatedMoneyValue valueKurus={valueKurus} />;
}
