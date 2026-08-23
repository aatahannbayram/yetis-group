"use client";

import type { LucideIcon, LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Panel/bayi icon wrapper — thin Material-line feel (21st.dev Material Line / Magnific-like).
 * Keeps Lucide (already in repo); stroke 1.5 by default for a cooler outline set.
 */
export function AppIcon({
  icon: Icon,
  className,
  strokeWidth = 1.5,
  size = 18,
  absoluteStrokeWidth,
  ...props
}: LucideProps & {
  icon: LucideIcon;
  size?: number;
}) {
  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      absoluteStrokeWidth={absoluteStrokeWidth}
      className={cn("shrink-0", className)}
      aria-hidden
      {...props}
    />
  );
}
