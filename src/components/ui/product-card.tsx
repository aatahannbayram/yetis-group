"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

type ConflictingHtmlHandlers =
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd";

interface ProductHighlightCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, ConflictingHtmlHandlers> {
  categoryIcon: React.ReactNode;
  category: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

/**
 * 3D-tilt product card: mouse-tracked rotation (spring-damped) + a radial
 * glow that follows the cursor. Ported from `framer-motion` to this
 * project's `motion` package (same API, already a dependency) and adjusted
 * to read `--primary` as a literal color instead of a shadcn HSL triplet,
 * since this project's tokens store hex values.
 */
export const ProductHighlightCard = React.forwardRef<HTMLDivElement, ProductHighlightCardProps>(
  ({ className, categoryIcon, category, title, description, imageSrc, imageAlt, ...props }, ref) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = ({ clientX, clientY, currentTarget }: React.MouseEvent) => {
      const { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    };

    const rotateX = useTransform(mouseY, [0, 350], [10, -10]);
    const rotateY = useTransform(mouseX, [0, 350], [-10, 10]);

    const springConfig = { stiffness: 300, damping: 20 };
    const springRotateX = useSpring(rotateX, springConfig);
    const springRotateY = useSpring(rotateY, springConfig);

    const glowX = useTransform(mouseX, [0, 350], [0, 100]);
    const glowY = useTransform(mouseY, [0, 350], [0, 100]);
    const glowOpacity = useTransform(mouseX, [0, 350], [0, 0.5]);

    return (
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          mouseX.set(0);
          mouseY.set(0);
        }}
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
        }}
        className={cn(
          "relative h-[350px] w-[350px] rounded-2xl bg-card shadow-lg transition-shadow duration-300 hover:shadow-2xl",
          className,
        )}
        {...props}
      >
        <div
          style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}
          className="absolute inset-4 rounded-xl bg-card-foreground/5 shadow-inner"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

          <motion.div
            className="pointer-events-none absolute -inset-px rounded-xl opacity-0"
            style={{
              opacity: glowOpacity,
              background: `radial-gradient(80px at ${glowX}% ${glowY}%, var(--primary), transparent 40%)`,
            }}
          />

          <div className="relative z-10 flex h-full flex-col justify-between p-6">
            <div className="flex items-center space-x-2 text-card-foreground">
              {categoryIcon}
              <span className="text-sm font-medium">{category}</span>
            </div>

            <div className="text-card-foreground">
              <h2 className="text-4xl font-bold tracking-tight">{title}</h2>
              <p className="mt-2 max-w-[60%] text-xs text-muted-foreground">{description}</p>
            </div>
          </div>

          <motion.img
            src={imageSrc}
            alt={imageAlt}
            style={{ transform: "translateZ(50px)" }}
            whileHover={{ scale: 1.1, y: -20, x: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute -right-12 -bottom-12 h-56 w-56 object-contain"
          />
        </div>
      </motion.div>
    );
  },
);

ProductHighlightCard.displayName = "ProductHighlightCard";
