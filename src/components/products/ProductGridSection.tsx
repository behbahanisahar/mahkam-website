import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductCard, type ProductCardData } from "@/components/products/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { CATALOG_GRID_CLASS } from "@/lib/products/catalog";

type Props = {
  title: string;
  subtitle?: string;
  products: ProductCardData[];
  emptyMessage?: string;
  showCatalogLink?: boolean;
  featuredLayout?: boolean;
};

export function ProductGridSection({
  title,
  subtitle,
  products,
  emptyMessage,
  showCatalogLink = true,
  featuredLayout = false,
}: Props) {
  if (products.length === 0 && !emptyMessage) return null;

  if (featuredLayout) {
    return (
      <section className="bg-transparent">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Reveal>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-copper">کاتالوگ</p>
                <h2 className="brand-display mt-2 text-3xl font-extrabold text-ink sm:text-4xl">
                  {title}
                </h2>
                {subtitle ? <p className="mt-2 text-sm text-muted">{subtitle}</p> : null}
              </div>
              {showCatalogLink ? (
                <Link href="/products" className="link-arrow shrink-0">
                  همه محصولات
                  <ArrowLeft className="size-3.5" />
                </Link>
              ) : null}
            </div>
          </Reveal>

          {products.length === 0 ? (
            <div className="ui-card mt-10 p-10 text-center text-sm text-muted">{emptyMessage}</div>
          ) : (
            <div className={`mt-10 ${CATALOG_GRID_CLASS}`}>
              {products.map((p, index) => (
                <Reveal
                  key={p.slug}
                  className="h-full"
                  delay={Math.min(index, 7) * 50}
                  variant="scale"
                >
                  <ProductCard product={p} priority={index < 4} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h2 className="brand-display text-2xl font-extrabold text-ink">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        </div>
        {showCatalogLink ? (
          <Link href="/products" className="link-arrow">
            همه محصولات
            <ArrowLeft className="size-3.5" />
          </Link>
        ) : null}
      </div>
      {products.length === 0 ? (
        <div className="ui-card p-8 text-center text-sm text-muted">{emptyMessage}</div>
      ) : (
        <div className={CATALOG_GRID_CLASS}>
          {products.map((p, index) => (
            <ProductCard key={p.slug} product={p} priority={index < 4} />
          ))}
        </div>
      )}
    </section>
  );
}
