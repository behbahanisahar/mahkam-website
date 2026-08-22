import type { NextConfig } from "next";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const flexAliases = require("./prisma/data/prod-flex-aliases.json") as {
  prodSlug: string;
  latinSlug: string;
}[];

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // Gzip/Brotli when not terminated by nginx; cheap win for HTML/JSON/JS.
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Same-origin `/uploads/*` and `/images/*` work without remotePatterns.
    // Keep legacy UploadThing/Unsplash hostnames so existing ProductImage URLs still render.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "uploadthing.com" },
      { protocol: "https", hostname: "ufs.sh" },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400,
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return flexAliases.map((a) => ({
      source: `/products/${a.prodSlug}`,
      destination: `/products/${a.latinSlug}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
