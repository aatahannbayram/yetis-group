import { NextResponse } from "next/server";
import { listActiveRedirectMap } from "@/infra/db/seo";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export async function GET() {
  const map = await listActiveRedirectMap();
  return NextResponse.json(map, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
    },
  });
}
