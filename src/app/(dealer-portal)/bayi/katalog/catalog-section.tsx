import { getDealerOrderProductsPage } from "@/infra/db/product-list-page";
import { DealerCatalogWorkspace } from "@/components/dealer/dealer-catalog-workspace";

export async function BayiCatalogSection({ dealerId }: { dealerId: string }) {
  const catalogPage = await getDealerOrderProductsPage(dealerId);

  return (
    <DealerCatalogWorkspace
      initialProducts={catalogPage.items}
      initialNextCursor={catalogPage.nextCursor}
      totalProductCount={catalogPage.totalCount}
    />
  );
}
