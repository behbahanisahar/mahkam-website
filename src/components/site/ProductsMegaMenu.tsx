"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { categoriesWithProducts, isNavCategoryActive } from "@/components/site/nav-category";

export type MegaCategory = {
  slug: string;
  nameFa: string;
  productCount?: number;
  children?: { slug: string; nameFa: string; productCount?: number }[];
};

type Props = {
  open: boolean;
  categories: MegaCategory[];
  activeSlug?: string;
  isCatalogPage?: boolean;
  onNavigate?: () => void;
  className?: string;
};

/** Drop child categories that were also sent as roots. */
function rootCategories(categories: MegaCategory[]): MegaCategory[] {
  const nested = new Set(
    categories.flatMap((c) => (c.children ?? []).map((ch) => ch.slug)),
  );
  return categories.filter((c) => !nested.has(c.slug));
}

export function ProductsMegaMenu({
  open,
  categories,
  activeSlug = "",
  isCatalogPage = false,
  onNavigate,
  className,
}: Props) {
  const roots = categoriesWithProducts(rootCategories(categories));
  const allActive = isCatalogPage && !activeSlug;
  const gridCols =
    roots.length >= 5
      ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      : roots.length === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : roots.length === 3
          ? "sm:grid-cols-2 lg:grid-cols-3"
          : roots.length === 2
            ? "sm:grid-cols-2"
            : "";

  return (
    <div
      data-open={open ? "true" : "false"}
      className={cn(
        "mega-panel fixed inset-x-0 top-16 z-50 px-4 sm:top-[4.5rem] sm:px-6 lg:px-8",
        className,
      )}
      role="menu"
      aria-hidden={!open}
    >
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-ink/10 bg-paper shadow-2xl shadow-ink/20">
        {roots.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted">هنوز دسته‌بندی‌ای ثبت نشده است.</p>
        ) : (
          <div className={cn("grid grid-cols-1 gap-px bg-ink/6", gridCols)}>
            {roots.map((cat) => {
              const children = cat.children ?? [];
              const catActive = isNavCategoryActive(cat.slug, activeSlug, children);
              return (
                <div key={cat.slug} className="bg-paper px-5 py-4">
                  <Link
                    href={`/products?category=${cat.slug}`}
                    onClick={onNavigate}
                    role="menuitem"
                    aria-current={cat.slug === activeSlug ? "page" : undefined}
                    className={cn(
                      "block text-sm font-bold leading-6 transition hover:text-copper",
                      catActive ? "text-copper" : "text-ink",
                    )}
                  >
                    {cat.nameFa}
                  </Link>
                  {children.length > 0 ? (
                    <ul className="mt-2 space-y-0.5 border-t border-ink/8 pt-2">
                      {children.map((child) => {
                        const selected = child.slug === activeSlug;
                        return (
                          <li key={child.slug}>
                            <Link
                              href={`/products?category=${child.slug}`}
                              onClick={onNavigate}
                              role="menuitem"
                              aria-current={selected ? "page" : undefined}
                              className={cn(
                                "block rounded-lg px-2 py-1.5 text-[13px] leading-6 transition hover:bg-ink/5 hover:text-ink",
                                selected
                                  ? "bg-copper/10 font-semibold text-copper-deep"
                                  : "text-ink/65",
                              )}
                            >
                              {child.nameFa}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        <div className="border-t border-ink/8 bg-bg-alt/80 px-5 py-3">
          <Link
            href="/products"
            onClick={onNavigate}
            role="menuitem"
            aria-current={allActive ? "page" : undefined}
            className={cn(
              "text-sm font-semibold transition hover:text-copper-deep",
              allActive ? "text-copper-deep" : "text-copper",
            )}
          >
            همه محصولات
          </Link>
        </div>
      </div>
    </div>
  );
}
