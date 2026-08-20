import { catalogFallbackImage } from "@/content/catalog-images";
import { CatalogImage } from "@/components/store/catalog-image";
import { ProductPlaceholder } from "@/components/store/product-placeholder";

export function ProductImage({
  imageUrl,
  category,
  alt,
  className,
  sizes,
}: {
  imageUrl: string | null;
  category: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const src = catalogFallbackImage(category, imageUrl);
  const categorySrc = catalogFallbackImage(category, null);

  if (!src) {
    return <ProductPlaceholder category={category} className={className} />;
  }

  return (
    <div className={`relative aspect-square overflow-hidden ${className ?? ""}`}>
      <CatalogImage
        src={src}
        fallbackSrc={categorySrc === src ? null : categorySrc}
        alt={alt}
        className="object-cover"
        sizes={sizes ?? "300px"}
      />
    </div>
  );
}
