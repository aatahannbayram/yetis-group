"use server";

import { resolveDealerContext } from "@/features/dealer/actions";
import { getDealerOrderProductsPage, type ProductListQuery } from "@/infra/db/product-list-page";

export async function loadDealerCatalogPageAction(input: ProductListQuery = {}) {
  const ctx = await resolveDealerContext();
  if (!ctx) return { items: [], nextCursor: null, totalCount: 0 };
  return getDealerOrderProductsPage(ctx.dealerId, input);
}
