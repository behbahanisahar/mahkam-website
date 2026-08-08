import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";

const productDetailInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  category: {
    include: { parent: true },
  },
} as const;

export const getPublishedProductBySlug = cache(async (slug: string) => {
  return prisma.product.findUnique({
    where: { slug },
    include: productDetailInclude,
  });
});

export const getCachedCategories = unstable_cache(
  async () => {
    try {
      return await prisma.category.findMany({
        where: { parentId: null },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          slug: true,
          nameFa: true,
          description: true,
          _count: {
            select: {
              products: { where: { isPublished: true } },
              children: true,
            },
          },
          products: {
            where: { isPublished: true },
            take: 1,
            orderBy: { sortOrder: "asc" },
            select: {
              images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
            },
          },
          children: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              slug: true,
              nameFa: true,
              description: true,
              products: {
                where: { isPublished: true },
                take: 1,
                orderBy: { sortOrder: "asc" },
                select: {
                  images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
                },
              },
              _count: { select: { products: { where: { isPublished: true } } } },
            },
          },
        },
      });
    } catch {
      return [];
    }
  },
  ["product-categories-v5"],
  { revalidate: REVALIDATE.categories, tags: [CACHE_TAGS.categories] },
);
