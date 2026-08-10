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
 * image optimizer cannot read them as local files. Serve as-is (Nginx or
 * `/uploads` route already caches aggressively).
 */
export function shouldBypassImageOptimizer(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    if (url.startsWith("/uploads/")) return true;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return new URL(url).pathname.startsWith("/uploads/");
    }
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
