import Image from "next/image";
import { cn } from "@/lib/utils";

/** Official wordmark PNGs (transparent). Intrinsic size 2250×1151. */
const sources = {
  light: { src: "/brand/logo-light.png", width: 2250, height: 1151 },
  dark: { src: "/brand/logo-dark.png", width: 2250, height: 1151 },
} as const;

const displayHeights = {
  sm: 32,
  md: 40,
  lg: 52,
  xl: 64,
  "2xl": 88,
} as const;

export function Logo({
  size = "md",
  variant = "light",
  className,
}: {
  size?: keyof typeof displayHeights;
  /** Surface the logo sits on: "light" (cream/white) or "dark" (brand panels). */
  variant?: "light" | "dark";
  className?: string;
}) {
  const height = displayHeights[size];
  const { src, width, height: naturalHeight } = sources[variant];

  return (
    <Image
      src={src}
      alt="Yetiş Grup"
      width={width}
      height={naturalHeight}
      style={{ height, width: "auto" }}
      className={cn("object-contain", className)}
      priority
    />
  );
}

/** Brand mark only — favicon / collapsed sidebar. */
export function BrandMark({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/brand/symbol.png"
      alt="Yetiş Grup"
      width={2250}
      height={2197}
      style={{ width: size, height: size }}
      className={cn("object-contain", className)}
      priority
    />
  );
}
