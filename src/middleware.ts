import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/brand") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    const mapUrl = new URL("/api/seo/redirects", request.url);
    const res = await fetch(mapUrl, {
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
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
