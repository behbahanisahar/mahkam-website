/** Shared upload limits — safe for client + server imports. */

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB before optimize
export const MAX_UPLOAD_MB = 2;
export const MAX_IMAGE_EDGE = 1600;
export const WEBP_QUALITY = 78;

export const ALLOWED_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/avif";

export function formatBytesFa(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
