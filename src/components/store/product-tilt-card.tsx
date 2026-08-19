"use client";

import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { SceneImage } from "@/components/store/scene-image";
import type { ImageSlotId } from "@/content/images";

type ProductTiltCardProps = {
  href: string;
  slot: ImageSlotId;
  tag: string;
  name: string;
  note: string;
};

/**
 * Same mouse-tracked tilt + cursor glow as components/ui/product-card.tsx,
 * applied to our own photographic catalog card instead of the generic
 * icon-badge layout — keeps the real product photo, tag, and copy.
 */
export function ProductTiltCard({ href, slot, tag, name, note }: ProductTiltCardProps) {
  const reduced = useReducedMotion();
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useTransform(mouseY, [0, 1], [7, -7]);
  const rotateY = useTransform(mouseX, [0, 1], [-7, 7]);
  const springConfig = { stiffness: 300, damping: 22 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const glowX = useTransform(mouseX, [0, 1], [0, 100]);
  const glowY = useTransform(mouseY, [0, 1], [0, 100]);
  const glow = useMotionTemplate`radial-gradient(110px at ${glowX}% ${glowY}%, color-mix(in srgb, var(--mkt-accent) 55%, transparent), transparent 70%)`;

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    mouseX.set((event.clientX - left) / width);
    mouseY.set((event.clientY - top) / height);
  }

  function handleMouseLeave() {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }

  return (
    <Link href={href} className="group block">
      <motion.div
        onMouseMove={reduced ? undefined : handleMouseMove}
        onMouseLeave={reduced ? undefined : handleMouseLeave}
        style={{
          rotateX: reduced ? 0 : springRotateX,
          rotateY: reduced ? 0 : springRotateY,
          transformStyle: "preserve-3d",
          transformPerspective: 800,
        }}
        className="relative aspect-[3/4] overflow-hidden rounded-[1.15rem]"
      >
        <SceneImage
          id={slot}
          fill
          quality={60}
          className="transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 768px) 220px, 70vw"
        />
        {reduced ? null : (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: glow }}
          />
        )}
      </motion.div>
      <span className="mkt-pill mkt-label mt-2.5 inline-flex bg-mkt-card-muted px-2.5 py-0.5 text-mkt-ink-muted">
        {tag}
      </span>
      <p className="mt-1.5 text-[0.95rem] font-medium tracking-[-0.015em] text-mkt-ink">{name}</p>
      <p className="mt-0.5 text-[13px] leading-relaxed text-mkt-ink-muted">{note}</p>
    </Link>
  );
}
