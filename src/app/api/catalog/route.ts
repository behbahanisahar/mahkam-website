import { NextRequest, NextResponse } from "next/server";
import { getCatalogPage } from "@/lib/products/catalog";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const conductor = searchParams.get("conductor") ?? "";

  const catalog = await getCatalogPage({ q, category, conductor, page });

  return NextResponse.json({
    products: catalog.products.map((p) => ({
      slug: p.slug,
      nameFa: p.nameFa,
      shortDesc: p.shortDesc || p.introduction,
      conductor: p.conductor,
      images: p.images.map((img) => ({ url: img.url, alt: img.alt })),
    })),
    page: catalog.page,
    totalPages: catalog.totalPages,
    total: catalog.total,
  });
}
