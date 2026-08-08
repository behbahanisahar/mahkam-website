/**
 * Canonical public site origin (no trailing slash).
 *
 * Until mahkamcable.ir DNS/SSL is ready, keep production env as:
 *   NEXT_PUBLIC_SITE_URL=https://mahkamcable.com
 *   NEXTAUTH_URL=https://mahkamcable.com
 * After cutover, switch both to https://mahkamcable.ir
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return process.env.NODE_ENV === "production"
    ? "https://mahkamcable.ir"
    : "http://localhost:3000";
}

export function getSiteName(): string {
  return process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "گسترش سیم و کابل مهکام";
}

export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = getSiteUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
