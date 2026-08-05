import Image from "next/image";
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
  if (!imageUrl) {
    return <ProductPlaceholder category={category} className={className} />;
  }

  return (
    <div className={`relative aspect-square overflow-hidden ${className ?? ""}`}>
      <Image src={imageUrl} alt={alt} fill className="object-cover" sizes={sizes ?? "300px"} />
    </div>
  );
}
