import { NextResponse } from "next/server";
import { categoriesWithProducts } from "@/components/site/nav-category";
import { getCachedCategories } from "@/lib/products/queries";

/** Public nav categories for header mega-menu (and client fallback). */
export async function GET() {
  try {
    const roots = await getCachedCategories();

    const categories = categoriesWithProducts(
      roots.map((c) => {
        const childProducts = c.children.reduce((sum, ch) => sum + ch._count.products, 0);
        return {
          slug: c.slug,
          nameFa: c.nameFa,
          productCount: c._count.products + childProducts,
          children: c.children.map((ch) => ({
            slug: ch.slug,
            nameFa: ch.nameFa,
            productCount: ch._count.products,
          })),
        };
      }),
    );

    return NextResponse.json(
      { categories },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (err) {
    console.error("[api/categories]", err);
    return NextResponse.json({ categories: [] }, { status: 500 });
  }
}
