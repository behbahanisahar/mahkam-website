import { cache } from "react";
import { unstable_cache, unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";
import { decodeRouteSlug, latinSlugFor, prodSlugForLatin } from "@/lib/products/slug";

const productDetailInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  category: {
    include: { parent: true },
  },
} as const;

async function loadProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: productDetailInclude,
  });
}

async function loadProductByAnySlug(safeSlug: string) {
  const latin = latinSlugFor(safeSlug);
  const persian = prodSlugForLatin(safeSlug);
  const direct = await loadProductBySlug(safeSlug);
  if (direct) return direct;
  if (latin) {
    const aliased = await loadProductBySlug(latin);
    if (aliased) return aliased;
  }
  if (persian) return loadProductBySlug(persian);
  return null;
}

export const getPublishedProductBySlug = cache(async (slug: string) => {
  const safeSlug = decodeRouteSlug(slug);
  if (!safeSlug) return null;

  try {
    return await unstable_cache(
      async () => loadProductByAnySlug(safeSlug),
      ["product-by-slug-v4", safeSlug],
      { revalidate: REVALIDATE.product, tags: [CACHE_TAGS.product, `product:${safeSlug}`] },
    )();
  } catch (err) {
    console.error("[getPublishedProductBySlug] cache miss/fallback", safeSlug, err);
    try {
      return await loadProductByAnySlug(safeSlug);
    } catch (inner) {
      console.error("[getPublishedProductBySlug] failed", safeSlug, inner);
      return null;
    }
  }
});

/** Lightweight nav shape — avoid heavy nested selects that can fail in production. */
async function loadNavCategoryTree() {
  try {
    const roots = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        nameFa: true,
        description: true,
        children: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            slug: true,
            nameFa: true,
            description: true,
            _count: { select: { products: { where: { isPublished: true } } } },
          },
        },
        _count: { select: { products: { where: { isPublished: true } } } },
      },
    });

    return roots.map((c) => ({
      ...c,
      products: [] as { images: { url: string }[] }[],
      children: c.children.map((ch) => ({
        ...ch,
        products: [] as { images: { url: string }[] }[],
      })),
    }));
  } catch (err) {
    // Docker build has no host Postgres on 127.0.0.1 — never fail the build.
    console.error("[loadNavCategoryTree]", err);
    return [];
  }
}

export const getCachedCategories = unstable_cache(
  async () => loadNavCategoryTree(),
  ["product-categories-v10"],
  { revalidate: REVALIDATE.categories, tags: [CACHE_TAGS.categories] },
);

/**
 * Header mega-menu categories. Always fresh (noStore) so empty caches cannot stick.
 */
export async function getNavCategories() {
  noStore();
  try {
    const roots = await loadNavCategoryTree();
    if (roots.length > 0) return roots;

    // Fallback: any category that has published products (legacy nesting)
    const flat = await prisma.category.findMany({
      where: { products: { some: { isPublished: true } } },
      orderBy: { sortOrder: "asc" },
      take: 20,
      select: {
        id: true,
        slug: true,
        nameFa: true,
        description: true,
        _count: { select: { products: { where: { isPublished: true } } } },
        children: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            slug: true,
            nameFa: true,
            description: true,
            _count: { select: { products: { where: { isPublished: true } } } },
          },
        },
      },
    });
    return flat.map((c) => ({
      ...c,
      products: [] as { images: { url: string }[] }[],
      children: c.children.map((ch) => ({
        ...ch,
        products: [] as { images: { url: string }[] }[],
      })),
    }));
  } catch (err) {
    console.error("[getNavCategories]", err);
    return [];
  }
}
