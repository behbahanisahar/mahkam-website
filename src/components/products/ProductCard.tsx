import Image from "next/image";
import { formatNumberFa } from "@/lib/i18n/fa";
import { ProductCardLink } from "@/components/products/ProductCardLink";
import { catalogCardImageUrl, productCatalogSrc, shouldBypassImageOptimizer } from "@/lib/utils";
import { canonicalProductSlug } from "@/lib/products/slug";
import { LazyImage } from "@/components/ui/LazyImage";
import { LtrAwareText } from "@/components/ui/LtrAwareText";

export type ProductCardData = {
  slug: string;
  nameFa: string;
  shortDesc?: string | null;
  conductor?: string | null;
  images?: { url: string; alt?: string | null }[];
};

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardData;
  priority?: boolean;
}) {
  const resolved = productCatalogSrc(product);
  const src = catalogCardImageUrl(resolved) ?? resolved;
  const unoptimized = shouldBypassImageOptimizer(src);

  return (
    <ProductCardLink
      slug={canonicalProductSlug(product.slug)}
      className="group card-lift ui-card flex h-full flex-col overflow-hidden"
    >
      <div className="relative aspect-square shrink-0 bg-[#e6e4e0]">
        {src ? (
          priority ? (
            <Image
              src={src}
              alt={product.images?.[0]?.alt ?? product.nameFa}
              fill
              priority
              unoptimized={unoptimized}
              className="object-contain"
              sizes="(max-width:640px) 50vw, (max-width:768px) 33vw, (max-width:1280px) 25vw, 16vw"
            />
          ) : (
            <LazyImage
              src={src}
              alt={product.images?.[0]?.alt ?? product.nameFa}
              fill
              wrapperClassName="absolute inset-0"
              className="object-contain"
              sizes="(max-width:640px) 50vw, (max-width:768px) 33vw, (max-width:1280px) 25vw, 16vw"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">بدون تصویر</div>
        )}
      </div>
      <div className="flex h-24 shrink-0 flex-col justify-between border-t border-ink/6 px-4 py-3">
        <div className="line-clamp-2 h-12 overflow-hidden text-sm font-bold leading-6 text-ink">
          <LtrAwareText as="span" text={product.nameFa} />
        </div>
        <span className="text-xs font-semibold text-copper">مشاهده ←</span>
      </div>
    </ProductCardLink>
  );
}

export function ProductCountLabel({ count }: { count: number }) {
  return <span>{formatNumberFa(count)} محصول</span>;
}
