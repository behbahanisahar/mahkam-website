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
      className="group card-lift ui-card flex flex-col overflow-hidden"
    >
      <div className="relative aspect-square bg-[#e6e4e0]">
        {src ? (
          priority ? (
            <Image
              src={src}
              alt={product.images?.[0]?.alt ?? product.nameFa}
              fill
              priority
              unoptimized={unoptimized}
              className="object-contain"
              sizes="(max-width:768px) 50vw, 25vw"
            />
          ) : (
            <LazyImage
              src={src}
              alt={product.images?.[0]?.alt ?? product.nameFa}
              fill
              wrapperClassName="absolute inset-0"
              className="object-contain"
              sizes="(max-width:768px) 50vw, 25vw"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">بدون تصویر</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 border-t border-ink/6 px-4 py-4">
        <LtrAwareText
          as="h3"
          text={product.nameFa}
          className="text-sm font-bold leading-6 text-ink"
        />
        <span className="mt-auto text-xs font-semibold text-copper">مشاهده ←</span>
      </div>
    </ProductCardLink>
  );
}

export function ProductCountLabel({ count }: { count: number }) {
  return <span>{formatNumberFa(count)} محصول</span>;
}
