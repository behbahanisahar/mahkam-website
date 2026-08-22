import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";

export const CATALOG_PAGE_SIZE = 30;
export const CATALOG_GRID_CLASS =
  "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5";

export type CatalogFilters = {
  q?: string;
  category?: string;
  conductor?: string;
  page?: number;
};

async function categoryIdsForSlug(slug: string): Promise<string[] | null> {
  const cat = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      parentId: true,
      children: { select: { id: true } },
    },
  });
  if (!cat) return null;
  // Parent: include its own products + every subcategory. Child: only itself.
  if (!cat.parentId && cat.children.length > 0) {
    return [cat.id, ...cat.children.map((c) => c.id)];
  }
  return [cat.id];
}

function searchWhere(q: string): Prisma.ProductWhereInput {
  return {
    OR: [
      { nameFa: { contains: q, mode: "insensitive" } },
      { shortDesc: { contains: q, mode: "insensitive" } },
      { introduction: { contains: q, mode: "insensitive" } },
      { applications: { contains: q, mode: "insensitive" } },
      { body: { contains: q, mode: "insensitive" } },
    ],
  };
}

async function buildWhere(filters: CatalogFilters): Promise<Prisma.ProductWhereInput> {
  const q = filters.q?.trim() ?? "";
  const categorySlug = filters.category?.trim() ?? "";
  const conductor = filters.conductor ?? "";
  const and: Prisma.ProductWhereInput[] = [{ isPublished: true }];

  if (conductor) and.push({ conductor });

  if (categorySlug) {
    const ids = await categoryIdsForSlug(categorySlug);
    if (!ids) {
      and.push({ id: "__no_such_category__" });
    } else {
      and.push({ categoryId: { in: ids } });
    }
  }

  if (q) and.push(searchWhere(q));

  return { AND: and };
}

export async function getCatalogPage(filters: CatalogFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const cacheKey = JSON.stringify({ ...filters, page, v: "cat-page-30" });

  return unstable_cache(
    async () => {
      try {
        const where = await buildWhere(filters);
        const [products, total] = await Promise.all([
          prisma.product.findMany({
            where,
            include: {
              images: { orderBy: { sortOrder: "asc" }, take: 1 },
              category: true,
            },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
            skip: (page - 1) * CATALOG_PAGE_SIZE,
            take: CATALOG_PAGE_SIZE,
          }),
          prisma.product.count({ where }),
        ]);

        return {
          products,
          total,
          page,
          pageSize: CATALOG_PAGE_SIZE,
          totalPages: Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE)),
        };
      } catch (err) {
        console.error("[getCatalogPage]", err);
        return {
          products: [],
          total: 0,
          page,
          pageSize: CATALOG_PAGE_SIZE,
          totalPages: 1,
        };
      }
    },
    ["catalog-page", cacheKey],
    { revalidate: REVALIDATE.catalog, tags: [CACHE_TAGS.catalog] },
  )();
}
