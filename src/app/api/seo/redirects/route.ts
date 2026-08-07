import { NextResponse } from "next/server";
import { listActiveRedirectMap } from "@/infra/db/seo";

// Redirect map has no per-request personalization, so this is safe to cache
// server-side and reuse across requests. `force-dynamic` was forcing a DB hit
// on every storefront page load (this route backs the middleware redirect
// check, which runs on almost every non-static request).
export const revalidate = 300;

export async function GET() {
  const map = await listActiveRedirectMap();
  return NextResponse.json(map, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
