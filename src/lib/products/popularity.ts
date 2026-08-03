import { ProductViewSource } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";

const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
};

export type PopularProduct = Awaited<ReturnType<typeof getAllTimePopularProducts>>[number];

function sortByViewRank<T extends { id: string }>(
  products: T[],
  rankedIds: { productId: string }[],
): T[] {
  const order = new Map(rankedIds.map((row, index) => [row.productId, index]));
  return [...products].sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999));
}

async function productsFromViewCounts(
  counts: { productId: string }[],
  limit: number,
) {
  if (counts.length === 0) return [];

  const products = await prisma.product.findMany({
    where: {
      id: { in: counts.map((c) => c.productId) },
      isPublished: true,
    },
    include: productInclude,
  });

  return sortByViewRank(products, counts).slice(0, limit);
}

/** All-time most engaged published products (card clicks + page views). */
export async function getAllTimePopularProducts(limit = 6) {
  try {
    return await unstable_cache(
      async () => {
        const counts = await prisma.productView.groupBy({
          by: ["productId"],
          _count: { _all: true },
          orderBy: { _count: { productId: "desc" } },
          take: limit * 2,
        });

        return productsFromViewCounts(counts, limit);
      },
      ["all-time-popular", String(limit)],
      { revalidate: REVALIDATE.popular, tags: [CACHE_TAGS.popular] },
    )();
  } catch {
    return [];
  }
}

export async function getFeaturedProducts(limit = 6) {
  try {
    return await unstable_cache(
      async () =>
        prisma.product.findMany({
          where: { isPublished: true, isFeatured: true },
          include: productInclude,
          orderBy: { sortOrder: "asc" },
          take: limit,
        }),
      ["featured-products", String(limit)],
      { revalidate: REVALIDATE.catalog, tags: [CACHE_TAGS.catalog] },
    )();
  } catch {
    return [];
  }
}

const BOT_UA =
  /bot|crawler|spider|slurp|facebookexternalhit|whatsapp|telegrambot|preview|lighthouse|headless/i;

export function isLikelyBot(userAgent: string | null) {
  if (!userAgent) return false;
  return BOT_UA.test(userAgent);
}

const DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;

function parseSource(value: unknown): ProductViewSource {
  if (value === "CARD" || value === "card") return ProductViewSource.CARD;
  return ProductViewSource.PAGE;
}

export async function recordProductView(input: {
  slug: string;
  source?: string | null;
  visitorKey?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
}) {
  if (isLikelyBot(input.userAgent ?? null)) {
    return { recorded: false, reason: "bot" as const };
  }

  const product = await prisma.product.findUnique({
    where: { slug: input.slug },
    select: { id: true, isPublished: true },
  });

  if (!product?.isPublished) {
    return { recorded: false, reason: "not_found" as const };
  }

  const source = parseSource(input.source);
  const visitorKey = input.visitorKey?.trim() || null;
  const since = new Date(Date.now() - DEDUPE_WINDOW_MS);

  if (visitorKey) {
    const recent = await prisma.productView.findFirst({
      where: {
        productId: product.id,
        visitorKey,
        source,
        viewedAt: { gte: since },
      },
      select: { id: true },
    });
    if (recent) {
      return { recorded: false, reason: "deduped" as const };
    }
  }

  await prisma.productView.create({
    data: {
      productId: product.id,
      source,
      visitorKey,
      referrer: input.referrer?.slice(0, 500) ?? null,
    },
  });

  return { recorded: true as const, source };
}

export async function getAdminPopularitySummary(limit = 5) {
  try {
    const allTimeCounts = await prisma.productView.groupBy({
      by: ["productId"],
      _count: { _all: true },
      orderBy: { _count: { productId: "desc" } },
      take: limit,
    });

    const products = await prisma.product.findMany({
      where: { id: { in: allTimeCounts.map((c) => c.productId) } },
      select: { id: true, nameFa: true, slug: true },
    });
    const nameById = new Map(products.map((p) => [p.id, p]));

    return {
      allTime: allTimeCounts.map((c) => ({
        product: nameById.get(c.productId),
        views: c._count._all,
      })),
    };
  } catch {
    return { allTime: [] };
  }
}
