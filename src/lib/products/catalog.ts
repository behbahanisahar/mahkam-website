import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";

export const CATALOG_PAGE_SIZE = 9;

export type CatalogFilters = {
  q?: string;
  category?: string;
  conductor?: string;
  page?: number;
};

function buildWhere(filters: CatalogFilters): Prisma.ProductWhereInput {
  const q = filters.q?.trim() ?? "";
  const categorySlug = filters.category ?? "";
  const conductor = filters.conductor ?? "";

  return {
    isPublished: true,
    ...(conductor ? { conductor } : {}),
    ...(categorySlug
      ? {
          category: {
            OR: [{ slug: categorySlug }, { parent: { slug: categorySlug } }],
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { nameFa: { contains: q, mode: "insensitive" } },
            { shortDesc: { contains: q, mode: "insensitive" } },
            { introduction: { contains: q, mode: "insensitive" } },
            { applications: { contains: q, mode: "insensitive" } },
            { body: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export async function getCatalogPage(filters: CatalogFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const where = buildWhere(filters);
  const cacheKey = JSON.stringify({ ...filters, page });

  return unstable_cache(
    async () => {
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
    },
    ["catalog-page", cacheKey],
    { revalidate: REVALIDATE.catalog, tags: [CACHE_TAGS.catalog] },
  )();
}
