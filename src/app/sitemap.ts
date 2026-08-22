import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS, REVALIDATE } from "@/lib/cache";
import { getSiteUrl } from "@/lib/site";
import {
  CATALOG_PRODUCT_SLUGS,
  SITEMAP_CATEGORY_SLUGS,
} from "@/lib/seo/catalog-slugs";
import { canonicalProductSlug } from "@/lib/products/slug";

export const revalidate = 3600;

type SitemapEntity = { slug: string; updatedAt: Date };

const getSitemapData = unstable_cache(
  async (): Promise<{ products: SitemapEntity[]; categories: SitemapEntity[] }> => {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ]);
    return { products, categories };
  },
  ["sitemap-entries-v3"],
  {
    revalidate: REVALIDATE.catalog,
    tags: [CACHE_TAGS.catalog, CACHE_TAGS.categories, CACHE_TAGS.product],
  },
);

function bundledFallback(now: Date): {
  products: SitemapEntity[];
  categories: SitemapEntity[];
} {
  return {
    products: CATALOG_PRODUCT_SLUGS.map((slug) => ({ slug, updatedAt: now })),
    categories: SITEMAP_CATEGORY_SLUGS.map((slug) => ({ slug, updatedAt: now })),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  let products: SitemapEntity[] = [];
  let categories: SitemapEntity[] = [];

  try {
    const data = await getSitemapData();
    products = data.products;
    categories = data.categories;
  } catch {
    // use bundled catalog below
  }

  // Merge DB slugs with bundled catalog so partial DB syncs still expose full catalog URLs.
  const fallback = bundledFallback(now);
  const productBySlug = new Map<string, SitemapEntity>();
  for (const p of fallback.products) {
    productBySlug.set(canonicalProductSlug(p.slug), p);
  }
  for (const p of products) {
    const slug = canonicalProductSlug(p.slug);
    const prev = productBySlug.get(slug);
    productBySlug.set(slug, prev && prev.updatedAt > p.updatedAt ? prev : { slug, updatedAt: p.updatedAt });
  }
  products = [...productBySlug.values()];

  const categoryBySlug = new Map<string, SitemapEntity>();
  for (const c of fallback.categories) {
    categoryBySlug.set(c.slug, c);
  }
  for (const c of categories) {
    const prev = categoryBySlug.get(c.slug);
    categoryBySlug.set(c.slug, prev && prev.updatedAt > c.updatedAt ? prev : { slug: c.slug, updatedAt: c.updatedAt });
  }
  categories = [...categoryBySlug.values()];

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/prices`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/price-list`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${base}/price-list/sim-afshan`, lastModified: now, changeFrequency: "daily", priority: 0.84 },
    {
      url: `${base}/price-list/cable-aluminum`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.84,
    },
    {
      url: `${base}/price-list/sim-afshan-earth`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.84,
    },
    { url: `${base}/price-list/sim-mesi`, lastModified: now, changeFrequency: "daily", priority: 0.84 },
    {
      url: `${base}/price-list/sim-aluminum`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.84,
    },
    { url: `${base}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    {
      url: `${base}/guides/sim-afshan-vs-maftoli`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${base}/guides/aluminum-cable-buying-guide`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${base}/guides/voltage-drop-cable`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${base}/guides/kharid-sim-kabel-lalazar`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/products?category=${encodeURIComponent(c.slug)}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/products/${encodeURIComponent(canonicalProductSlug(p.slug))}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
