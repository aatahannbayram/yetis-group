"use client";

import { Leaf, Milk, Wheat } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

type PieceKind = "wheel" | "wedge" | "leaf" | "drop" | "grain";

const PIECES: Array<{
  kind: PieceKind;
  left: string;
  delay: number;
  duration: number;
  size: number;
  spin: number;
  sway: number;
  color: string;
}> = [
  { kind: "wheel", left: "7%", delay: 0, duration: 2.2, size: 22, spin: 160, sway: 16, color: "#E2B64A" },
  { kind: "leaf", left: "16%", delay: 0.08, duration: 2.4, size: 17, spin: -110, sway: -20, color: "#30A369" },
  { kind: "drop", left: "24%", delay: 0.14, duration: 2.1, size: 12, spin: 40, sway: 10, color: "#FAF8F3" },
  { kind: "wedge", left: "33%", delay: 0.05, duration: 2.35, size: 18, spin: 200, sway: -14, color: "#D4A017" },
  { kind: "grain", left: "42%", delay: 0.18, duration: 2.5, size: 16, spin: -80, sway: 18, color: "#C4A36A" },
  { kind: "wheel", left: "51%", delay: 0.04, duration: 2.15, size: 20, spin: -150, sway: -12, color: "#F0C96A" },
  { kind: "leaf", left: "59%", delay: 0.2, duration: 2.45, size: 15, spin: 90, sway: 22, color: "#00693E" },
  { kind: "drop", left: "68%", delay: 0.1, duration: 2.25, size: 11, spin: -30, sway: -8, color: "#E8F2EC" },
  { kind: "wedge", left: "76%", delay: 0.16, duration: 2.3, size: 17, spin: 170, sway: 14, color: "#E8C547" },
  { kind: "grain", left: "85%", delay: 0.06, duration: 2.4, size: 15, spin: -100, sway: -18, color: "#B8893A" },
  { kind: "leaf", left: "92%", delay: 0.22, duration: 2.2, size: 14, spin: 70, sway: 12, color: "#248A58" },
  { kind: "wheel", left: "12%", delay: 0.28, duration: 2.1, size: 14, spin: 90, sway: -10, color: "#C9922E" },
  { kind: "drop", left: "47%", delay: 0.32, duration: 2.0, size: 10, spin: 20, sway: 8, color: "#FFFDF8" },
  { kind: "leaf", left: "71%", delay: 0.26, duration: 2.35, size: 13, spin: -60, sway: -16, color: "#30A369" },
  { kind: "wedge", left: "28%", delay: 0.34, duration: 2.05, size: 13, spin: 130, sway: 11, color: "#E2B64A" },
  { kind: "grain", left: "88%", delay: 0.3, duration: 2.15, size: 12, spin: 50, sway: 9, color: "#8A6A32" },
];

function CheeseWheel({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" fill={color} />
      <path d="M12 12 L20.2 9.2 A9 9 0 0 0 12 3 Z" fill="#fff" fillOpacity="0.28" />
      <circle cx="10" cy="9.5" r="1.15" fill="#fff" fillOpacity="0.45" />
      <circle cx="8" cy="14" r="0.9" fill="#fff" fillOpacity="0.35" />
      <circle cx="14.5" cy="13.5" r="0.7" fill="#fff" fillOpacity="0.3" />
    </svg>
  );
}

function CheeseWedge({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M4 18.5 L12 4.5 L20 18.5 Z"
        fill={color}
        stroke="#8A6A32"
        strokeOpacity="0.35"
        strokeWidth="0.8"
      />
      <circle cx="11" cy="12" r="1" fill="#fff" fillOpacity="0.4" />
      <circle cx="13.5" cy="15" r="0.7" fill="#fff" fillOpacity="0.3" />
    </svg>
  );
}

function PieceMark({ kind, color, size }: { kind: PieceKind; color: string; size: number }) {
  if (kind === "wheel") return <CheeseWheel color={color} size={size} />;
  if (kind === "wedge") return <CheeseWedge color={color} size={size} />;
  if (kind === "leaf") return <Leaf style={{ color, width: size, height: size }} strokeWidth={2.2} />;
  if (kind === "grain") return <Wheat style={{ color, width: size, height: size }} strokeWidth={2.2} />;
  return <Milk style={{ color: "#6B8F7A", width: size, height: size }} strokeWidth={2} />;
}

/**
 * Dairy-themed burst for a successful order: wheels, wedges, leaves, grain.
 * Brand greens and rind golds only. No rainbow confetti.
 */
export function OrderCelebrate({ active }: { active: boolean }) {
  const reduced = useReducedMotion();

  if (!active || reduced) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden>
      {PIECES.map((piece, i) => (
        <motion.span
          key={`${piece.kind}-${i}`}
          className="absolute top-0"
          style={{ left: piece.left }}
          initial={{ y: -28, x: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: ["-8%", "108%"],
            x: [0, piece.sway, -piece.sway * 0.4],
            opacity: [0, 1, 1, 0],
            rotate: piece.spin,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: [0.22, 0.84, 0.32, 1],
          }}
        >
          <PieceMark kind={piece.kind} color={piece.color} size={piece.size} />
        </motion.span>
      ))}
    </div>
  );
}

export function OrderCelebrateStamp() {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="mb-4 flex flex-col items-center text-center"
      initial={reduced ? false : { opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-[#FAF8F3] shadow-[inset_0_1px_0_0_rgb(255_255_255/0.8),0_8px_20px_-10px_rgb(16_70_42/0.35)]">
        <CheeseWheel color="#E2B64A" size={28} />
      </span>
      <p className="mt-3 text-[16px] font-semibold tracking-[-0.02em] text-mkt-ink">Siparişiniz alındı</p>
      <p className="mt-1 max-w-[16rem] text-[13px] leading-relaxed text-mkt-ink-muted">
        Teşekkürler. Ödeme tercihiniz kaydedildi.
      </p>
    </motion.div>
  );
}
