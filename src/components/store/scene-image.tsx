import Image from "next/image";
import { cn } from "@/lib/utils";
import { getImage, type ImageSlotId } from "@/content/images";

type SceneImageProps = {
  id: ImageSlotId;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  className?: string;
  sizes?: string;
  /** Override alt when context needs more specificity */
  alt?: string;
};

/**
 * Corporate scene image from the manifesto.
 * No debug overlays — placeholders are remapped to real assets.
 */
export function SceneImage({
  id,
  fill,
  width,
  height,
  priority,
  quality = 65,
  className,
  sizes,
  alt,
}: SceneImageProps) {
  const asset = getImage(id);

  if (fill) {
    return (
      <Image
        src={asset.src}
        alt={alt ?? asset.alt}
        fill
        priority={priority}
        quality={quality}
        loading={priority ? undefined : "lazy"}
        className={cn("object-cover", className)}
        sizes={sizes}
      />
    );
  }

  return (
    <Image
      src={asset.src}
      alt={alt ?? asset.alt}
      width={width ?? 800}
      height={height ?? 600}
      priority={priority}
      quality={quality}
      loading={priority ? undefined : "lazy"}
      className={cn("object-cover", className)}
      sizes={sizes}
    />
  );
}
