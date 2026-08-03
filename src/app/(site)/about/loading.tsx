import { SiteContainer } from "@/components/site/SiteContainer";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <SiteContainer className="space-y-14 pt-5 sm:pt-6 lg:pt-8" aria-busy>
      <div className="space-y-3">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </SiteContainer>
  );
}
