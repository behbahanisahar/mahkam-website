import flexAliases from "../../../prisma/data/prod-flex-aliases.json";

/** Persian/production slugs → latin catalog slugs. */
export const FLEX_SLUG_ALIASES: Record<string, string> = Object.fromEntries(
  flexAliases.map((a) => [a.prodSlug, a.latinSlug]),
);

/** Latin catalog slugs → still-live production Persian slugs. */
export const PROD_SLUG_FOR_LATIN: Record<string, string> = Object.fromEntries(
  flexAliases.map((a) => [a.latinSlug, a.prodSlug]),
);

export function decodeRouteSlug(slug: string): string {
  let value = String(slug || "").trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    /* already decoded */
  }
  return value.normalize("NFC");
}

export function latinSlugFor(slug: string): string | null {
  const decoded = decodeRouteSlug(slug);
  return FLEX_SLUG_ALIASES[decoded] ?? null;
}

export function prodSlugForLatin(slug: string): string | null {
  return PROD_SLUG_FOR_LATIN[decodeRouteSlug(slug)] ?? null;
}

/** Prefer stable ASCII slugs for canonical URLs, sitemap, and internal links. */
export function canonicalProductSlug(slug: string): string {
  const decoded = decodeRouteSlug(slug);
  return FLEX_SLUG_ALIASES[decoded] ?? decoded;
}
