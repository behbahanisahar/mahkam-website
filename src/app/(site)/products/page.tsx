import type { Metadata } from "next";
import Link from "next/link";
import { ProductCountLabel } from "@/components/products/ProductCard";
import { CatalogLazyGrid } from "@/components/products/CatalogLazyGrid";
import { ProductSearch } from "@/components/products/ProductSearch";
import { SiteContainer } from "@/components/site/SiteContainer";
import { formatNumberFa } from "@/lib/i18n/fa";
import { getCatalogPage } from "@/lib/products/catalog";
import { getCachedCategories } from "@/lib/products/queries";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { SITE_PAGE_META } from "@/lib/seo/site-pages";
import { cn } from "@/lib/utils";

/**
 * Category / search filters must not be served from a cached unfiltered HTML page.
 * Catalog rows themselves are still cached in getCatalogPage().
 */
export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  conductor?: string;
  page?: string;
}>;

function findCategoryName(
  categories: Awaited<ReturnType<typeof getCachedCategories>>,
  slug: string,
): { nameFa: string; description: string | null } | null {
  for (const c of categories) {
    if (c.slug === slug) return { nameFa: c.nameFa, description: c.description };
    for (const child of c.children) {
      if (child.slug === slug) {
        return { nameFa: child.nameFa, description: child.description };
      }
    }
  }
  return null;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = Array.isArray(sp.q) ? (sp.q[0] ?? "").trim() : sp.q?.trim() ?? "";
  const categorySlug = Array.isArray(sp.category)
    ? (sp.category[0] ?? "")
    : (sp.category ?? "");
  const conductor = Array.isArray(sp.conductor)
    ? (sp.conductor[0] ?? "")
    : (sp.conductor ?? "");
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  // Search / conductor / pagination: followable but not indexed as separate URLs
  if (q || conductor || page > 1) {
    return pageMetadata({
      title: q ? `جستجو: ${q}` : "محصولات",
      description:
        "کاتالوگ گسترش سیم و کابل مهکام؛ نتایج فیلترشده — برای فهرست اصلی به صفحه محصولات بروید.",
      path: "/products",
      ogTitle: "کاتالوگ سیم و کابل مهکام",
      index: false,
      follow: true,
    });
  }

  if (categorySlug) {
    const categories = await getCachedCategories();
    const cat = findCategoryName(categories, categorySlug);
    if (cat) {
      return pageMetadata({
        title: cat.nameFa,
        description:
          cat.description?.trim() ||
          `مشاهده محصولات ${cat.nameFa} در کاتالوگ گسترش سیم و کابل مهکام؛ مشخصات فنی شفاف و استعلام قیمت از تلگرام.`,
        path: `/products?category=${encodeURIComponent(categorySlug)}`,
        ogTitle: `${cat.nameFa} | مهکام`,
        keywords: [cat.nameFa, "سیم و کابل", "مهکام", "کاتالوگ کابل"],
      });
    }
  }

  return SITE_PAGE_META.products;
}

function buildCategoryHref(
  slug: string,
  q: string,
  conductor: string,
) {
  const params = new URLSearchParams();
  if (slug) params.set("category", slug);
  if (q) params.set("q", q);
  if (conductor) params.set("conductor", conductor);
  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = Array.isArray(sp.q) ? (sp.q[0] ?? "").trim() : sp.q?.trim() ?? "";
  const categorySlug = Array.isArray(sp.category)
    ? (sp.category[0] ?? "")
    : (sp.category ?? "");
  const conductor = Array.isArray(sp.conductor)
    ? (sp.conductor[0] ?? "")
    : (sp.conductor ?? "");
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const [categories, catalog] = await Promise.all([
    getCachedCategories(),
    getCatalogPage({ q, category: categorySlug, conductor, page }),
  ]);

  const activeCategory = categorySlug ? findCategoryName(categories, categorySlug) : null;

  const categoryOptions = categories.map((c) => ({
    slug: c.slug,
    nameFa: c.nameFa,
    children: c.children.map((ch) => ({ slug: ch.slug, nameFa: ch.nameFa })),
  }));

  const baseParams = { q, category: categorySlug, conductor };

  const initialProducts = catalog.products.map((p) => ({
    slug: p.slug,
    nameFa: p.nameFa,
    shortDesc: p.shortDesc || p.introduction,
    conductor: p.conductor,
    images: p.images.map((img) => ({ url: img.url, alt: img.alt })),
  }));

  const heading = activeCategory?.nameFa ?? "محصولات";
  const selectedParent = categoryOptions.find(
    (c) =>
      c.slug === categorySlug || c.children.some((ch) => ch.slug === categorySlug),
  );
  const visibleSubs = selectedParent
    ? [{ parent: selectedParent, children: selectedParent.children }]
    : categoryOptions
        .filter((c) => c.children.length > 0)
        .map((c) => ({ parent: c, children: c.children }));

  return (
    <SiteContainer className="space-y-6 pt-5 sm:pt-6 lg:pt-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="brand-display text-3xl font-bold text-ink">{heading}</h1>
          <p className="mt-2 text-sm text-muted">
            <ProductCountLabel count={catalog.total} />
            {catalog.totalPages > 1 ? (
              <span className="mr-2 text-muted">
                — صفحه {formatNumberFa(page)} از {formatNumberFa(catalog.totalPages)}
              </span>
            ) : null}
          </p>
        </div>
      </header>

      <ProductSearch
        key={`${categorySlug}|${q}|${conductor}`}
        initialQ={q}
        categories={categoryOptions}
        initialCategory={categorySlug}
        initialConductor={conductor}
      />

      {categoryOptions.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildCategoryHref("", q, conductor)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                !categorySlug
                  ? "bg-copper text-white shadow-sm shadow-copper/25"
                  : "border border-glass-border bg-paper text-ink hover:border-copper/40",
              )}
            >
              همه
            </Link>
            {categoryOptions.map((c) => (
              <Link
                key={c.slug}
                href={buildCategoryHref(c.slug, q, conductor)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                  categorySlug === c.slug ||
                  c.children.some((ch) => ch.slug === categorySlug)
                    ? "bg-copper text-white shadow-sm shadow-copper/25"
                    : "border border-glass-border bg-paper text-ink hover:border-copper/40",
                )}
              >
                {c.nameFa}
              </Link>
            ))}
          </div>

          {visibleSubs.length > 0 ? (
            <div className="space-y-3">
              {visibleSubs.map(({ parent, children }) => (
                  <div key={`subs-${parent.slug}`}>
                    <p className="mb-2 text-[11px] font-medium text-muted">
                      زیردسته‌های {parent.nameFa}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={buildCategoryHref(parent.slug, q, conductor)}
                        className={cn(
                          "rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                          categorySlug === parent.slug
                            ? "border-copper bg-copper/12 font-semibold text-copper-deep"
                            : "border-glass-border bg-paper text-ink hover:border-copper/40",
                        )}
                      >
                        همهٔ {parent.nameFa}
                      </Link>
                      {children.map((child) => (
                        <Link
                          key={child.slug}
                          href={buildCategoryHref(child.slug, q, conductor)}
                          className={cn(
                            "rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                            categorySlug === child.slug
                              ? "border-copper bg-copper/12 font-semibold text-copper-deep"
                              : "border-glass-border bg-paper text-ink hover:border-copper/40",
                          )}
                        >
                          {child.nameFa}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {catalog.products.length === 0 ? (
        <div className="ui-card p-10 text-center text-sm text-muted">
          محصولی با این فیلتر یافت نشد.
        </div>
      ) : (
        <CatalogLazyGrid
          key={`${categorySlug}|${q}|${conductor}|${page}`}
          initialProducts={initialProducts}
          page={page}
          totalPages={catalog.totalPages}
          total={catalog.total}
          baseParams={baseParams}
        />
      )}
    </SiteContainer>
  );
}
