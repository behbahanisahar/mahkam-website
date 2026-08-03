import { SiteContainer } from "@/components/site/SiteContainer";
import { ProductDetailSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <SiteContainer className="pt-5 sm:pt-6 lg:pt-8">
      <ProductDetailSkeleton />
    </SiteContainer>
  );
}
