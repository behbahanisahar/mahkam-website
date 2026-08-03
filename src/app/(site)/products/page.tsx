import type { Metadata } from "next";
import Link from "next/link";
import { ProductCountLabel } from "@/components/products/ProductCard";
import { CatalogLazyGrid } from "@/components/products/CatalogLazyGrid";
import { ProductSearch } from "@/components/products/ProductSearch";
import { SiteContainer } from "@/components/site/SiteContainer";
import { formatNumberFa } from "@/lib/i18n/fa";
import { getCatalogPage } from "@/lib/products/catalog";
import { getCachedCategories } from "@/lib/products/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "محصولات",
  description: "کاتالوگ گسترش سیم و کابل مهکام؛ جستجو بر اساس نام، دسته و نوع هادی.",
  alternates: { canonical: "/products" },
};

export const revalidate = 300;

type SearchParams = Promise<{
  q?: string;
  category?: string;
  conductor?: string;
  page?: string;
}>;

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
  const q = sp.q?.trim() ?? "";
  const categorySlug = sp.category ?? "";
  const conductor = sp.conductor ?? "";
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const [categories, catalog] = await Promise.all([
    getCachedCategories(),
    getCatalogPage({ q, category: categorySlug, conductor, page }),
  ]);

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

  return (
    <SiteContainer className="space-y-6 pt-5 sm:pt-6 lg:pt-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="brand-display text-3xl font-bold text-ink">محصولات</h1>
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
                  categorySlug === c.slug
                    ? "bg-copper text-white shadow-sm shadow-copper/25"
                    : "border border-glass-border bg-paper text-ink hover:border-copper/40",
                )}
              >
                {c.nameFa}
              </Link>
            ))}
          </div>

          {categoryOptions.some((c) => c.children.length > 0) ? (
            <div className="space-y-3">
              {categoryOptions
                .filter((c) => c.children.length > 0)
                .map((c) => (
                  <div key={`subs-${c.slug}`}>
                    <p className="mb-2 text-[11px] font-medium text-muted">زیردسته‌های {c.nameFa}</p>
                    <div className="flex flex-wrap gap-2">
                      {c.children.map((child) => (
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
