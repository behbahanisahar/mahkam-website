export type NavSlugNode = {
  slug: string;
  children?: { slug: string }[];
};

type CountedNavNode = {
  slug: string;
  nameFa: string;
  productCount?: number;
  children?: { slug: string; nameFa: string; productCount?: number }[];
};

/** Keep only categories/subcategories that have published products. */
export function categoriesWithProducts<T extends CountedNavNode>(categories: T[]): T[] {
  return categories
    .map((cat) => {
      const children = (cat.children ?? []).filter((ch) => (ch.productCount ?? 0) > 0);
      return { ...cat, children };
    })
    .filter((cat) => (cat.productCount ?? 0) > 0 || cat.children.length > 0);
}

/** Parent slug for a selected category (itself if it is a root). */
export function parentSlugOf(categories: NavSlugNode[], activeSlug: string): string | null {
  if (!activeSlug) return null;
  for (const c of categories) {
    if (c.slug === activeSlug) return c.slug;
    if (c.children?.some((ch) => ch.slug === activeSlug)) return c.slug;
  }
  return null;
}

export function isNavCategoryActive(
  slug: string,
  activeSlug: string,
  children?: { slug: string }[],
) {
  if (!activeSlug) return false;
  return slug === activeSlug || Boolean(children?.some((c) => c.slug === activeSlug));
}
