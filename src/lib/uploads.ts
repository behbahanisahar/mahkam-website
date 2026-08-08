import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile, access } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";

export const UPLOAD_PUBLIC_PREFIX = "/uploads";
export const PRODUCT_UPLOAD_SUBDIR = "products";
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_WIDTH = 2000;
export const WEBP_QUALITY = 80;

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);

/** Persistent upload root — never under `.next` or git-tracked `public/`. */
export function getUploadRoot(): string {
  const fromEnv = process.env.UPLOAD_DIR?.trim();
  if (fromEnv) return path.resolve(fromEnv);
  return path.resolve(process.cwd(), ".data", "uploads");
}

export function getProductsUploadDir(): string {
  return path.join(getUploadRoot(), PRODUCT_UPLOAD_SUBDIR);
}

export function toPublicUploadUrl(subdir: string, filename: string): string {
  return `${UPLOAD_PUBLIC_PREFIX}/${subdir}/${filename}`;
}

export function isAllowedImageMime(mime: string | null | undefined): boolean {
  if (!mime) return false;
  return ALLOWED_MIME.has(mime.toLowerCase());
}

/** Extract `/uploads/...` pathname from relative or absolute URL. */
export function uploadPathnameFromUrl(url: string): string | null {
  const raw = url.trim();
  if (!raw) return null;
  try {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      const pathname = new URL(raw).pathname;
      return pathname.startsWith(`${UPLOAD_PUBLIC_PREFIX}/`) ? pathname : null;
    }
    if (raw.startsWith(`${UPLOAD_PUBLIC_PREFIX}/`)) return raw.split("?")[0] ?? raw;
    return null;
  } catch {
    return null;
  }
}

export function isLocalUploadUrl(url: string): boolean {
  return Boolean(uploadPathnameFromUrl(url));
}

/**
 * Map a public `/uploads/...` URL to an absolute path under UPLOAD_DIR.
 * Returns null on traversal / invalid paths.
 */
export function resolveSafeUploadFsPath(url: string): string | null {
  const pathname = uploadPathnameFromUrl(url);
  if (!pathname) return null;

  const relative = pathname.slice(UPLOAD_PUBLIC_PREFIX.length).replace(/^\/+/, "");
  if (!relative || relative.includes("\0")) return null;
  if (path.isAbsolute(relative)) return null;
  if (relative.split(/[/\\]/).some((p) => p === ".." || p === "")) return null;

  const root = getUploadRoot();
  const absolute = path.resolve(root, relative);
  const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
  if (absolute !== root && !absolute.startsWith(rootWithSep)) return null;
  return absolute;
}

export async function ensureProductsUploadDir(): Promise<string> {
  const dir = getProductsUploadDir();
  await mkdir(dir, { recursive: true });
  return dir;
}

export type SavedProductImage = {
  url: string;
  filename: string;
  bytes: number;
  width: number;
  height: number;
};

/** Optimize + store as WebP under products/{uuid}.webp. Never trusts client filename. */
export async function saveProductImageBuffer(
  input: Buffer,
  declaredMime: string | null,
): Promise<SavedProductImage> {
  if (!isAllowedImageMime(declaredMime)) {
    throw new Error("unsupported_type");
  }
  if (input.byteLength === 0) throw new Error("empty_file");
  if (input.byteLength > MAX_UPLOAD_BYTES) throw new Error("too_large");

  const meta = await sharp(input, { failOn: "error" }).rotate().metadata();
  if (!meta.format || !["jpeg", "png", "webp", "avif"].includes(meta.format)) {
    throw new Error("invalid_image");
  }

  const filename = `${randomUUID()}.webp`;
  const dir = await ensureProductsUploadDir();
  const absolute = path.join(dir, filename);

  const optimized = await sharp(input, { failOn: "error" })
    .rotate()
    .resize({
      width: MAX_IMAGE_WIDTH,
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  await writeFile(absolute, optimized.data, { flag: "wx" });

  return {
    url: toPublicUploadUrl(PRODUCT_UPLOAD_SUBDIR, filename),
    filename,
    bytes: optimized.data.byteLength,
    width: optimized.info.width,
    height: optimized.info.height,
  };
}

/** Delete a local upload only if it is under UPLOAD_DIR and not referenced in DB. */
export async function maybeDeleteUnreferencedLocalUpload(url: string): Promise<boolean> {
  if (!isLocalUploadUrl(url)) return false;

  const pathname = uploadPathnameFromUrl(url);
  if (!pathname) return false;

  const refs = await prisma.productImage.count({
    where: {
      OR: [
        { url },
        { url: pathname },
        // absolute URLs that end with the same path
        { url: { endsWith: pathname } },
      ],
    },
  });
  if (refs > 0) return false;

  const absolute = resolveSafeUploadFsPath(url);
  if (!absolute) return false;

  try {
    await access(absolute);
    await unlink(absolute);
    return true;
  } catch {
    return false;
  }
}
