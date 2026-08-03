export const CACHE_TAGS = {
  settings: "site-settings",
  snapshots: "price-snapshots",
  popular: "popular-products",
  categories: "categories",
  catalog: "catalog",
  product: "product",
} as const;

export const REVALIDATE = {
  settings: 3600,
  snapshots: 300,
  popular: 600,
  categories: 3600,
  catalog: 300,
  product: 600,
  page: 300,
} as const;
