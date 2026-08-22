import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeRouteSlug, latinSlugFor } from "@/lib/products/slug";

export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.replace(/^\/products\//, "");
  if (!slug || slug.includes("/")) return NextResponse.next();

  const latin = latinSlugFor(decodeRouteSlug(slug));
  if (!latin || latin === slug) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/products/${latin}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: "/products/:slug",
};
