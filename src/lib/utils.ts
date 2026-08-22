import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Avoid Next image optimizer hitting broken Unsplash → private-IP errors (causes UI flicker). */
export function resolveMediaUrl(
  url: string | null | undefined,
  fallback = "/images/section-cable-cross.jpg",
): string {
  if (!url) return fallback;
  if (url.includes("images.unsplash.com")) return fallback;
  return url;
}

/**
 * Path-only media URL for next/image + absolute OG tags.
 * Cache-bust query strings (`?v=…`) break Next's local image pipeline in some builds.
 */
export function mediaSrcWithoutQuery(url: string | null | undefined): string {
  const resolved = resolveMediaUrl(url);
  const q = resolved.indexOf("?");
  return q === -1 ? resolved : resolved.slice(0, q);
}

/**
 * VPS uploads live under UPLOAD_DIR (outside `public/`), so the Next.js
 * image optimizer cannot read them as local files.
 *
 * Catalog URLs include cache-busting `?v=…`. Next's `/_next/image` rejects
 * local urls with query strings ("url parameter is not allowed"), so catalog
 * (+ thumbs) must be served unoptimized. Thumbs stay small on the wire.
 */
export function shouldBypassImageOptimizer(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const path =
      url.startsWith("http://") || url.startsWith("https://")
        ? new URL(url).pathname
        : url.split("?")[0] ?? url;
    if (path.startsWith("/uploads/")) return true;
    if (path.startsWith("/images/catalog/") || path.startsWith("/images/catalog-thumbs/")) {
      return true;
    }
    // Any same-origin image with a query string breaks the optimizer
    if (path.startsWith("/images/") && url.includes("?")) return true;
  } catch {
    return false;
  }
  return false;
}

/**
 * Catalog photo for a product. Keep `?v=` so listing cards can cache-bust
 * (product view uses thumbs; details use the full catalog file).
 */
export function encodePublicPath(url: string): string {
  const q = url.indexOf("?");
  const pathPart = q === -1 ? url : url.slice(0, q);
  const query = q === -1 ? "" : url.slice(q);
  if (!pathPart.startsWith("/")) return url;
  const encoded = pathPart
    .split("/")
    .map((seg) => {
      if (!seg) return seg;
      try {
        return encodeURIComponent(decodeURIComponent(seg));
      } catch {
        return encodeURIComponent(seg);
      }
    })
    .join("/");
  return encoded + query;
}

/** Bump when catalog photos/thumbs change so browsers drop the old immutable cache. */
export const CATALOG_CARD_CACHE = "card8";

export function withCatalogCache(url: string): string {
  const encoded = encodePublicPath(url);
  const pathPart = encoded.split("?")[0] ?? encoded;
  return `${pathPart}?v=${CATALOG_CARD_CACHE}`;
}

export function productCatalogSrc(product: {
  slug: string;
  images?: { url: string }[] | null;
}): string {
  const url = product.images?.[0]?.url;
  const raw = url ? resolveMediaUrl(url) : `/images/catalog/${product.slug}.webp`;
  return withCatalogCache(raw);
}

/**
 * Prefer pre-generated ~480px thumbs for product cards / lists.
 * Falls back to the original catalog URL when the path is not a catalog asset.
 */
export function catalogCardImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const [pathPart] = url.split("?");
    const path =
      pathPart.startsWith("http://") || pathPart.startsWith("https://")
        ? new URL(pathPart).pathname
        : pathPart;
    if (!path.startsWith("/images/catalog/") || path.startsWith("/images/catalog-thumbs/")) {
      return withCatalogCache(url);
    }
    return withCatalogCache(path.replace("/images/catalog/", "/images/catalog-thumbs/"));
  } catch {
    return url;
  }
}

/** Strip NULs / control chars from Word/PDF paste so Postgres does not 500. */
export function sanitizeAdminText(input: string): string {
  return input
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F\uFFFE\uFFFF]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .normalize("NFC");
}

export function slugifyPersian(input: string): string {
  return sanitizeAdminText(input)
    .trim()
    .toLowerCase()
    // Keep core×size as "25x5" — stripping × used to glue digits ("255") and collide slugs.
    .replace(/[×xX]/g, "x")
    .replace(/\+/g, "-")
    .replace(/[.\u066B]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
