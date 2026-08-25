import { NextResponse, type NextRequest } from "next/server";

const CANONICAL_HOST = "yetisgrup.com";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";
  if (host === `www.${CANONICAL_HOST}`) {
    const url = request.nextUrl.clone();
    url.hostname = CANONICAL_HOST;
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/panel") ||
    pathname.startsWith("/bayi") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/brand") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".")
  ) {
    const res = NextResponse.next();
    if (pathname.startsWith("/panel")) {
      res.headers.set("x-pathname", pathname);
    }
    return res;
  }

  try {
    const mapUrl = new URL("/api/seo/redirects", request.url);
    const res = await fetch(mapUrl, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
      // Middleware runs on almost every request. Without a bound here, a
      // stall on this internal call (DB hiccup, cold start) blocks every
      // page on the site instead of just this redirect check.
      signal: AbortSignal.timeout(2_000),
    });
    if (!res.ok) return NextResponse.next();
    const map = (await res.json()) as Record<string, { to: string; code: number }>;
    const hit = map[pathname];
    if (!hit) return NextResponse.next();

    const destination = hit.to.startsWith("http")
      ? hit.to
      : new URL(hit.to, request.url).toString();
    return NextResponse.redirect(destination, hit.code === 302 ? 302 : 301);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|favicon.png).*)"],
};
