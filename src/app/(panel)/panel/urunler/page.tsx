import { Suspense } from "react";
import { AdminProductsSection } from "@/app/(panel)/panel/urunler/products-section";
import AdminProductsLoading from "@/app/(panel)/panel/urunler/loading";

export default function AdminProductsPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <Suspense fallback={<AdminProductsLoading />}>
        <AdminProductsSection />
      </Suspense>
    </div>
  );
}
