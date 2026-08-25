"use server";

import { getStoreCatalogProductsPage, type ProductListQuery } from "@/infra/db/product-list-page";

export async function loadStoreCatalogPageAction(input: ProductListQuery = {}) {
  return getStoreCatalogProductsPage(input);
}
