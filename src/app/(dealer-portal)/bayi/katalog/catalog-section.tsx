import { getDealerCatalog } from "@/infra/db/dealer-catalog";
import { DealerCatalogWorkspace } from "@/components/dealer/dealer-catalog-workspace";

export async function BayiCatalogSection({ dealerId }: { dealerId: string }) {
  const products = await getDealerCatalog(dealerId);
  return <DealerCatalogWorkspace products={products} />;
}
