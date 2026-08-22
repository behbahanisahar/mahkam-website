import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductCardLink } from "@/components/products/ProductCardLink";
import type { ProductCardData } from "@/components/products/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { LazyImage } from "@/components/ui/LazyImage";
import { formatNumberFa } from "@/lib/i18n/fa";
import { catalogCardImageUrl, productCatalogSrc, shouldBypassImageOptimizer } from "@/lib/utils";
import { canonicalProductSlug } from "@/lib/products/slug";
import { LtrAwareText } from "@/components/ui/LtrAwareText";

type Props = {
  title: string;
  subtitle?: string;
  products: ProductCardData[];
  emptyMessage?: string;
};

export function ProductEditorialList({ title, subtitle, products, emptyMessage }: Props) {
  return (
    <section className="bg-transparent">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <Reveal>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {subtitle ? (
                <p className="text-xs font-bold tracking-[0.18em] text-copper">{subtitle}</p>
              ) : (
                <p className="text-xs font-bold tracking-[0.18em] text-copper">کاتالوگ</p>
              )}
              <h2 className="brand-display mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
                {title}
              </h2>
            </div>
            <Link href="/products" className="link-arrow shrink-0">
              همه محصولات
              <ArrowLeft className="size-3.5" />
            </Link>
          </div>
        </Reveal>

        {products.length === 0 ? (
          <div className="mt-8 border-t border-ink/10 pt-8 text-center text-sm text-muted">
            {emptyMessage}
          </div>
        ) : (
          <ul className="mt-8 divide-y divide-ink/8 border-y border-ink/8">
            {products.map((product, index) => {
              const resolved = productCatalogSrc(product);
              const src = catalogCardImageUrl(resolved) ?? resolved;

              return (
                <li key={product.slug}>
                  <Reveal delay={Math.min(index, 5) * 40}>
                    <ProductCardLink
                      slug={canonicalProductSlug(product.slug)}
                      className="group flex items-center gap-3 py-3.5 transition hover:bg-white/60 sm:gap-5 sm:py-4"
                    >
                      <span
                        className="hidden w-8 shrink-0 text-center text-xs font-bold tabular-nums text-ink/25 sm:block"
                        aria-hidden
                      >
                        {formatNumberFa(index + 1).padStart(2, "۰")}
                      </span>

                      <div className="relative size-16 shrink-0 overflow-hidden bg-[#e6e4e0] sm:size-20">
                        {src ? (
                          index < 4 ? (
                            <Image
                              src={src}
                              alt={product.images?.[0]?.alt ?? product.nameFa}
                              fill
                              priority={index < 2}
                              unoptimized={shouldBypassImageOptimizer(src)}
                              className="object-contain"
                              sizes="80px"
                            />
                          ) : (
                            <LazyImage
                              src={src}
                              alt={product.images?.[0]?.alt ?? product.nameFa}
                              fill
                              wrapperClassName="absolute inset-0"
                              className="object-contain"
                              sizes="80px"
                            />
                          )
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-muted">
                            —
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <h3 className="truncate text-[15px] font-bold text-ink transition group-hover:text-copper sm:text-base">
                            <LtrAwareText text={product.nameFa} />
                          </h3>
                          {product.conductor ? (
                            <span className="rounded-full border border-ink/8 bg-white px-2 py-0.5 text-[10px] font-semibold text-ink/55">
                              {product.conductor}
                            </span>
                          ) : null}
                        </div>
                        {product.shortDesc ? (
                          <p className="mt-0.5 line-clamp-1 text-xs leading-6 text-muted sm:text-sm sm:leading-7">
                            {product.shortDesc}
                          </p>
                        ) : null}
                      </div>

                      <span className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-copper sm:inline-flex">
                        مشخصات
                        <ArrowLeft className="size-3.5 transition group-hover:-translate-x-0.5" />
                      </span>
                    </ProductCardLink>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
