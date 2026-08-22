import type { Metadata } from "next";
import { getSiteName } from "@/lib/site";

/** Default social share image (1200×630). */
export const DEFAULT_OG_IMAGE = "/images/og-default.webp";

export type PageMetadataInput = {
  /** Document title (uses root `%s | siteName` template unless absoluteTitle). */
  title: string;
  description: string;
  /** Pathname or path+query for canonical / og:url, e.g. `/about` or `/products?category=x`. */
  path: string;
  /** Override Open Graph / Twitter title (defaults to title). */
  ogTitle?: string;
  image?: string;
  imageAlt?: string;
  keywords?: string[];
  /** When true, title is used as-is (no template). */
  absoluteTitle?: boolean;
  index?: boolean;
  follow?: boolean;
};

/**
 * Full page metadata: title, description, canonical, robots, Open Graph, Twitter.
 * Use on every public page so social previews never inherit the homepage tags.
 */
export function pageMetadata({
  title,
  description,
  path,
  ogTitle,
  image = DEFAULT_OG_IMAGE,
  imageAlt,
  keywords,
  absoluteTitle = false,
  index = true,
  follow = true,
}: PageMetadataInput): Metadata {
  const siteName = getSiteName();
  const socialTitle = ogTitle ?? title;
  const alt = imageAlt ?? siteName;
  const isDefaultOg = image === DEFAULT_OG_IMAGE;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical: path },
    robots: {
      index,
      follow,
      googleBot: { index, follow },
    },
    openGraph: {
      type: "website",
      locale: "fa_IR",
      siteName,
      url: path,
      title: socialTitle,
      description,
      images: [
        {
          url: image,
          alt,
          ...(isDefaultOg ? { width: 1200, height: 630 } : {}),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [image],
    },
  };
}
