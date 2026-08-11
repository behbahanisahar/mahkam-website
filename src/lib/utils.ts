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
 * VPS uploads live under UPLOAD_DIR (outside `public/`), so the Next.js
 * image optimizer cannot read them as local files. Catalog AI photos also
 * bypass the optimizer so deploys are not stuck on a stale `/_next/image` cache.
 */
export function shouldBypassImageOptimizer(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const path =
      url.startsWith("http://") || url.startsWith("https://")
        ? new URL(url).pathname
        : url.split("?")[0] ?? url;
    if (path.startsWith("/uploads/")) return true;
    if (path.startsWith("/images/catalog/")) return true;
  } catch {
    return false;
  }
  return false;
}

export function slugifyPersian(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
