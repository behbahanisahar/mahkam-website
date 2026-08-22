import { ProductCard, type ProductCardData } from "@/components/products/ProductCard";
import { CatalogPagination } from "@/components/products/CatalogPagination";
import { Reveal } from "@/components/ui/Reveal";
import { CATALOG_GRID_CLASS } from "@/lib/products/catalog";

type Props = {
  initialProducts: ProductCardData[];
  page: number;
  totalPages: number;
  total: number;
  baseParams: Record<string, string | undefined>;
};

export function CatalogLazyGrid({
  initialProducts,
  page,
  totalPages,
  baseParams,
}: Props) {
  return (
    <div className="space-y-6">
      <div className={CATALOG_GRID_CLASS}>
        {initialProducts.map((p, index) => (
          <Reveal
            key={p.slug}
            className="h-full"
            delay={Math.min(index % 10, 9) * 30}
            variant="scale"
          >
            <ProductCard product={p} priority={index < 5} />
          </Reveal>
        ))}
      </div>
      <CatalogPagination page={page} totalPages={totalPages} baseParams={baseParams} />
    </div>
  );
}
