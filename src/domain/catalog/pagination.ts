export const PRODUCT_PAGE_SIZE = 32;

export type ProductPageCursor = {
  name: string;
  id: string;
};

export type ProductListPage<T> = {
  items: T[];
  nextCursor: string | null;
  totalCount: number;
};

export function encodeProductCursor(cursor: ProductPageCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

export function decodeProductCursor(raw: string | null | undefined): ProductPageCursor | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as ProductPageCursor;
    if (typeof parsed.name === "string" && typeof parsed.id === "string") return parsed;
    return null;
  } catch {
    return null;
  }
}

export function paginateByCursor<T extends { id: string; name: string }>(
  rows: T[],
  limit: number,
): { items: T[]; nextCursor: string | null } {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items.at(-1);
  return {
    items,
    nextCursor: hasMore && last ? encodeProductCursor({ name: last.name, id: last.id }) : null,
  };
}
