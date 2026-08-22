import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Send } from "lucide-react";
import { ProductDetailContent } from "@/components/products/ProductDetailContent";
import { ProductViewTracker } from "@/components/products/ProductViewTracker";
import { SiteContainer } from "@/components/site/SiteContainer";
import { getPublishedProductBySlug } from "@/lib/products/queries";
import { getSiteSettings } from "@/lib/settings";
import { getSiteUrl, getTelegramHandleLabel } from "@/lib/site";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { logAppError } from "@/lib/errors/log";
import {
  mediaSrcWithoutQuery,
  productCatalogSrc,
  resolveMediaUrl,
  shouldBypassImageOptimizer,
} from "@/lib/utils";
import { LtrAwareText } from "@/components/ui/LtrAwareText";
import { canonicalProductSlug, decodeRouteSlug } from "@/lib/products/slug";

type Props = { params: Promise<{ slug: string }> };

/** Avoid ISR hangs on Unicode production slugs. */
export const dynamic = "force-dynamic";
export const dynamicParams = true;

function absoluteImage(siteUrl: string, url: string) {
  const clean = mediaSrcWithoutQuery(url);
  return clean.startsWith("http://") || clean.startsWith("https://")
    ? clean
    : `${siteUrl}${clean.startsWith("/") ? clean : `/${clean}`}`;
}

function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug: rawSlug } = await params;
    const slug = decodeRouteSlug(rawSlug);
    const product = await getPublishedProductBySlug(slug);
    if (!product || !product.isPublished) {
      return pageMetadata({
        title: "محصول یافت نشد",
        description: "این محصول در کاتالوگ مهکام موجود نیست یا حذف شده است.",
        path: `/products/${slug}`,
        index: false,
        follow: true,
      });
    }

    const title = product.nameFa;
    const description =
      product.seoDescription?.trim() ||
      product.shortDesc?.trim() ||
      product.introduction?.trim() ||
      `مشخصات فنی ${product.nameFa} از گسترش سیم و کابل مهکام؛ استعلام قیمت از کانال تلگرام.`;
    const siteUrl = getSiteUrl();
    const rawImage = product.images[0]?.url || `/images/catalog/${product.slug}.webp`;
    const image = rawImage ? absoluteImage(siteUrl, resolveMediaUrl(rawImage)) : undefined;

    return pageMetadata({
      title,
      description,
      path: `/products/${canonicalProductSlug(product.slug)}`,
      image,
      imageAlt: product.nameFa,
      keywords: [
        product.nameFa,
        "سیم و کابل مهکام",
        product.category?.nameFa,
        product.conductor,
        "کاتالوگ کابل",
      ].filter(Boolean) as string[],
    });
  } catch (err) {
    console.error("[product.generateMetadata]", err);
    return pageMetadata({
      title: "محصول",
      description: "کاتالوگ سیم و کابل مهکام",
      path: "/products",
      index: false,
    });
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = decodeRouteSlug(rawSlug);

  let product: Awaited<ReturnType<typeof getPublishedProductBySlug>> = null;
  let settings: Awaited<ReturnType<typeof getSiteSettings>>;

  try {
    [product, settings] = await Promise.all([
      getPublishedProductBySlug(slug),
      getSiteSettings(),
    ]);
  } catch (err) {
    console.error("[ProductDetailPage]", slug, err);
    await logAppError({
      level: "error",
      source: "server",
      statusCode: 500,
      message: `Product page failed: ${slug}`,
      path: `/products/${slug}`,
      stack: err instanceof Error ? err.stack : String(err),
    });
    throw err;
  }

  if (!product || !product.isPublished) notFound();
  const canonicalSlug = canonicalProductSlug(product.slug);
  if (slug !== canonicalSlug) {
    permanentRedirect(`/products/${canonicalSlug}`);
  }

  const specs =
    product.specs && typeof product.specs === "object" && !Array.isArray(product.specs)
      ? (product.specs as Record<string, string>)
      : {};

  const parentCategory = product.category?.parent ?? null;

  const siteUrl = getSiteUrl();
  const intro = product.introduction?.trim() || "";
  const shortLead = product.shortDesc?.trim() || "";
  const seoDesc = product.seoDescription?.trim() || "";
  const structure = product.wireStructure?.trim() || "";
  const heroLead = intro || (shortLead && shortLead !== intro ? shortLead : "") || "";
  const jsonDescription = intro || shortLead || seoDesc || undefined;

  const heroSrc = productCatalogSrc(product);

  const images = product.images
    .map((i) => absoluteImage(siteUrl, resolveMediaUrl(i.url)))
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
    description: jsonDescription,
    sku: canonicalSlug,
    url: `${siteUrl}/products/${canonicalSlug}`,
    brand: { "@type": "Brand", name: "مهکام" },
    manufacturer: {
      "@type": "Organization",
      name: "گسترش سیم و کابل مهکام",
      url: siteUrl,
    },
    category: product.category?.nameFa,
    image: images.length > 0 ? images : [absoluteImage(siteUrl, heroSrc)],
    ...(additionalProperty.length > 0 ? { additionalProperty } : {}),
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "IRR",
      url: `${siteUrl}/products/${canonicalSlug}`,
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
    item: `${siteUrl}/products/${canonicalSlug}`,
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
      <article className="space-y-5">
        <ProductViewTracker slug={slug} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
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
              <Link
                href={`/products?category=${product.category.slug}`}
                className="hover:text-ink"
              >
                {product.category.nameFa}
              </Link>
            </>
          ) : null}
          <span className="mx-2">/</span>
          <span>
            <LtrAwareText text={product.nameFa} />
          </span>
        </nav>

        <section className="ui-card overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="relative aspect-[4/3] shrink-0 bg-[#e6e4e0] lg:aspect-auto lg:min-h-[24rem] lg:w-[min(100%,28rem)] lg:self-stretch">
              {heroSrc ? (
                <Image
                  src={heroSrc}
                  alt={product.images[0]?.alt ?? product.nameFa}
                  fill
                  className="object-contain"
                  sizes="(max-width:1024px) 100vw, 448px"
                  priority
                  unoptimized={shouldBypassImageOptimizer(heroSrc)}
                />
              ) : (
                <div className="flex h-full min-h-[16rem] items-center justify-center bg-bg-alt text-sm text-muted">
                  بدون تصویر
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                {parentCategory ? (
                  <Link
                    href={`/products?category=${parentCategory.slug}`}
                    className="rounded-full bg-copper/12 px-3 py-1 text-xs font-medium text-copper-deep"
                  >
                    {parentCategory.nameFa}
                  </Link>
                ) : null}
                {product.category ? (
                  <Link
                    href={`/products?category=${product.category.slug}`}
                    className="rounded-full bg-copper/12 px-3 py-1 text-xs font-medium text-copper-deep"
                  >
                    {product.category.nameFa}
                  </Link>
                ) : null}
              </div>

              <LtrAwareText
                as="h1"
                text={product.nameFa}
                className="brand-display text-2xl font-bold leading-tight text-ink sm:text-3xl"
              />

              {heroLead ? (
                <LtrAwareText
                  as="p"
                  text={heroLead}
                  className="text-sm leading-8 text-ink/80 sm:text-[15px]"
                />
              ) : null}

              {structure ? (
                <div>
                  <p className="text-xs font-semibold text-copper-deep">ساختار سیم</p>
                  <LtrAwareText
                    as="p"
                    text={structure}
                    className="mt-1 text-sm leading-8 text-ink/75"
                  />
                </div>
              ) : null}

              {(product.conductor || Object.keys(specs).length > 0) && (
                <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                  {product.conductor ? (
                    <div className="rounded-xl bg-bg-alt px-3 py-2">
                      <dt className="text-[11px] text-muted">هادی</dt>
                      <dd className="mt-0.5 font-semibold text-ink">{product.conductor}</dd>
                    </div>
                  ) : null}
                  {Object.entries(specs)
                    .slice(0, 4)
                    .map(([name, value]) => (
                      <div key={name} className="rounded-xl bg-bg-alt px-3 py-2">
                        <dt className="text-[11px] text-muted">{name}</dt>
                        <dd className="mt-0.5 font-semibold text-ink">
                          <LtrAwareText text={String(value)} />
                        </dd>
                      </div>
                    ))}
                </dl>
              )}

              <a
                href={settings.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-md shadow-ink/20 transition hover:bg-ink-soft"
              >
                <Send className="size-4" />
                <span dir="ltr">{getTelegramHandleLabel()}</span>
              </a>
            </div>
          </div>

          {product.images.length > 1 ? (
            <div className="grid grid-cols-4 gap-2 border-t border-glass-border p-3 sm:grid-cols-6">
              {product.images.slice(1, 7).map((img) => {
                const src = mediaSrcWithoutQuery(img.url);
                return (
                  <div
                    key={img.id}
                    className="relative aspect-square overflow-hidden rounded-xl border border-glass-border"
                  >
                    <Image
                      src={src}
                      alt={img.alt ?? product.nameFa}
                      fill
                      loading="lazy"
                      className="object-contain p-1"
                      sizes="120px"
                      unoptimized={shouldBypassImageOptimizer(src)}
                    />
                  </div>
                );
              })}
            </div>
          ) : null}
        </section>

        <ProductDetailContent
          product={product}
          omit={[
            ...(heroLead ? (["introduction"] as const) : []),
            ...(structure ? (["wireStructure"] as const) : []),
          ]}
        />
      </article>
    </SiteContainer>
  );
}
