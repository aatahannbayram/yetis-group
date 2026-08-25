"use server";

import { getAdminProductsPage, type ProductListQuery } from "@/infra/db/product-list-page";

export async function loadB2bCatalogPageAction(input: ProductListQuery = {}) {
  return getAdminProductsPage(input);
}
