import Image from "next/image";
import { cn } from "@/lib/utils";

// Exact intrinsic dimensions of the source wordmark PNGs.
const sources = {
  light: { src: "/logo-wordmark.png", width: 1956, height: 978 },
  dark: { src: "/logo-wordmark-dark-bg.png", width: 2000, height: 1027 },
};

const displayHeights = {
  sm: 22,
  md: 28,
  lg: 40,
};

export function Logo({
  size = "md",
  variant = "light",
  className,
}: {
  size?: keyof typeof displayHeights;
  /** which surface the logo sits on: "light" (cream/white) or "dark" (brand-700 etc.) */
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
