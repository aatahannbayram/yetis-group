import { describe, expect, it } from "vitest";
import {
  decodeProductCursor,
  encodeProductCursor,
  paginateByCursor,
  PRODUCT_PAGE_SIZE,
} from "@/domain/catalog/pagination";

describe("product pagination", () => {
  it("uses 32 as default page size", () => {
    expect(PRODUCT_PAGE_SIZE).toBe(32);
  });

  it("encodes and decodes cursor", () => {
    const cursor = { name: "Beyaz Peynir", id: "prod_1" };
    expect(decodeProductCursor(encodeProductCursor(cursor))).toEqual(cursor);
  });

  it("returns next cursor when more rows exist", () => {
    const rows = [
      { id: "1", name: "A" },
      { id: "2", name: "B" },
      { id: "3", name: "C" },
    ];
    const page = paginateByCursor(rows, 2);
    expect(page.items).toHaveLength(2);
    expect(decodeProductCursor(page.nextCursor)).toEqual({ name: "B", id: "2" });
  });
});
