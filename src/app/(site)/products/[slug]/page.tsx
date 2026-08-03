import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Send } from "lucide-react";
import { ProductDetailContent } from "@/components/products/ProductDetailContent";
import { ProductViewTracker } from "@/components/products/ProductViewTracker";
import { SiteContainer } from "@/components/site/SiteContainer";
import { prisma } from "@/lib/prisma";
import { getPublishedProductBySlug } from "@/lib/products/queries";
import { getSiteSettings } from "@/lib/settings";
import { resolveMediaUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 600;

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { isPublished: true },
      select: { slug: true },
      orderBy: { sortOrder: "asc" },
      take: 100,
    });
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product || !product.isPublished) return { title: "محصول یافت نشد" };

  const title = product.seoTitle || product.nameFa;
  const description =
    product.seoDescription || product.shortDesc || product.introduction || undefined;
  const image = product.images[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: image ? [{ url: image, alt: product.nameFa }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getPublishedProductBySlug(slug),
    getSiteSettings(),
  ]);

  if (!product || !product.isPublished) notFound();

  const specs =
    product.specs && typeof product.specs === "object" && !Array.isArray(product.specs)
      ? (product.specs as Record<string, string>)
      : {};

  const parentCategory = product.category?.parent ?? null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const summary =
    product.shortDesc || product.introduction || product.seoDescription || undefined;

  const absoluteImage = (url: string) =>
    url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`;

  const images = product.images
    .map((i) => absoluteImage(resolveMediaUrl(i.url)))
    .filter(Boolean);

  const additionalProperty = [
    product.conductor
      ? { "@type": "PropertyValue", name: "نوع هادی", value: product.conductor }
      : null,
    ...Object.entries(specs).map(([name, value]) => ({
      "@type": "PropertyValue" as const,
      name,
      value: String(value),
    })),
  ].filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameFa,
    description: summary,
    sku: product.slug,
    url: `${siteUrl}/products/${product.slug}`,
    brand: { "@type": "Brand", name: "مهکام" },
    manufacturer: {
      "@type": "Organization",
      name: "گسترش سیم و کابل مهکام",
      url: siteUrl,
    },
    category: product.category?.nameFa,
    image: images.length > 0 ? images : [absoluteImage("/images/mahkam-logo.png")],
    ...(additionalProperty.length > 0 ? { additionalProperty } : {}),
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "IRR",
      url: settings.telegramUrl,
      seller: {
        "@type": "Organization",
        name: "گسترش سیم و کابل مهکام",
        url: siteUrl,
      },
    },
  };

  const crumbs: { name: string; item: string }[] = [
    { name: "صفحه اصلی", item: siteUrl },
    { name: "محصولات", item: `${siteUrl}/products` },
  ];
  if (parentCategory) {
    crumbs.push({
      name: parentCategory.nameFa,
      item: `${siteUrl}/products?category=${parentCategory.slug}`,
    });
  }
  if (product.category) {
    crumbs.push({
      name: product.category.nameFa,
      item: `${siteUrl}/products?category=${product.category.slug}`,
    });
  }
  crumbs.push({
    name: product.nameFa,
    item: `${siteUrl}/products/${product.slug}`,
  });

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.item,
    })),
  };

  return (
    <SiteContainer className="pt-5 sm:pt-6 lg:pt-8">
    <article className="space-y-8">
      <ProductViewTracker slug={slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <nav className="text-xs text-muted" aria-label="مسیر">
        <Link href="/products" className="hover:text-ink">
          محصولات
        </Link>
        {parentCategory ? (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/products?category=${parentCategory.slug}`}
              className="hover:text-ink"
            >
              {parentCategory.nameFa}
            </Link>
          </>
        ) : null}
        {product.category ? (
          <>
            <span className="mx-2">/</span>
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-ink">
              {product.category.nameFa}
            </Link>
          </>
        ) : null}
        <span className="mx-2">/</span>
        <span>{product.nameFa}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="ui-card relative aspect-[4/3] overflow-hidden">
            {product.images[0] ? (
              <Image
                src={resolveMediaUrl(product.images[0].url)}
                alt={product.images[0].alt ?? product.nameFa}
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-bg-alt text-sm text-muted">
                بدون تصویر
              </div>
            )}
          </div>
          {product.images.length > 1 ? (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl border border-glass-border">
                  <Image
                    src={resolveMediaUrl(img.url)}
                    alt={img.alt ?? product.nameFa}
                    fill
                    loading="lazy"
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <h1 className="brand-display text-3xl font-bold leading-tight text-ink">{product.nameFa}</h1>
          {summary ? (
            <p className="mt-4 line-clamp-4 text-sm leading-8 text-muted sm:text-base">{summary}</p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            {product.category ? (
              <Link
                href={`/products?category=${product.category.slug}`}
                className="rounded-full bg-copper/12 px-3.5 py-1.5 text-xs font-medium text-copper-deep"
              >
                {product.category.nameFa}
              </Link>
            ) : null}
            {product.conductor ? (
              <span className="rounded-full bg-bg-alt px-3.5 py-1.5 text-xs font-medium text-ink">
                هادی: {product.conductor}
              </span>
            ) : null}
          </div>

          <a
            href={settings.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-md shadow-ink/20 transition hover:bg-ink-soft"
          >
            <Send className="size-4" />
            دریافت قیمت از تلگرام
          </a>

          {Object.keys(specs).length > 0 ? (
            <div className="ui-card mt-8 overflow-hidden">
              <h2 className="border-b border-glass-border bg-bg-alt/60 px-4 py-3 text-sm font-semibold text-copper-deep">
                جدول مشخصات
              </h2>
              <dl>
                {Object.entries(specs).map(([k, v]) => (
                  <div
                    key={k}
                    className="grid grid-cols-2 gap-2 border-t border-glass-border/60 px-4 py-2.5 text-sm"
                  >
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-medium">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>
      </div>

      <ProductDetailContent product={product} />
    </article>
    </SiteContainer>
  );
}
