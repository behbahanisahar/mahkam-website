import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { CACHE_TAGS } from "@/lib/cache";

export const dynamic = "force-dynamic";

/**
 * Bust Next data/route cache after catalog sync or ops.
 * Auth: header `x-cron-secret` or `?secret=` matching CRON_SECRET.
 */
export async function POST(req: NextRequest) {
  const secret =
    req.headers.get("x-cron-secret")?.trim() ||
    req.nextUrl.searchParams.get("secret")?.trim() ||
    "";
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected || secret !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  revalidateTag(CACHE_TAGS.categories, "max");
  revalidateTag(CACHE_TAGS.catalog, "max");
  revalidateTag(CACHE_TAGS.product, "max");
  revalidateTag(CACHE_TAGS.popular, "max");
  revalidatePath("/", "layout");
  revalidatePath("/products");
  revalidatePath("/sitemap.xml");

  return NextResponse.json({ ok: true, revalidated: true });
}
