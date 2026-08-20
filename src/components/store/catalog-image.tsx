"use client";

import { useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";

function isUploadedSrc(src: string): boolean {
  return src.startsWith("/uploads/");
}

export function CatalogImage({
  src,
  fallbackSrc,
  alt,
  className,
  sizes,
  priority,
}: {
  src: string | null;
  fallbackSrc?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [current, setCurrent] = useState<string | null>(src);
  const [seenSrc, setSeenSrc] = useState(src);
  if (src !== seenSrc) {
    setSeenSrc(src);
    setCurrent(src);
  }

  if (!current) {
    return (
      <div className="flex size-full items-center justify-center text-mkt-ink-muted">
        <Package className="size-10" aria-hidden />
      </div>
    );
  }

  return (
    <Image
      src={current}
      alt={alt}
      fill
      unoptimized={isUploadedSrc(current)}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => {
        if (fallbackSrc && fallbackSrc !== current) {
          setCurrent(fallbackSrc);
          return;
        }
        setCurrent(null);
      }}
    />
  );
}
