import { revalidateTag } from "next/cache";

/** Public store catalog + category chips (unstable_cache). */
export const STORE_CATALOG_TAG = "store-catalog";

export function revalidateStoreCatalog() {
  revalidateTag(STORE_CATALOG_TAG, "max");
}
