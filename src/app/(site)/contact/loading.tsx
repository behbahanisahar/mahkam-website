import { SiteContainer } from "@/components/site/SiteContainer";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <SiteContainer className="space-y-10 pt-5 sm:pt-6 lg:pt-8" aria-busy>
      <div className="space-y-3 border-b border-ink/10 pb-8">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-48" />
          <Skeleton className="h-14 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-11 w-32" />
            <Skeleton className="h-11 w-36" />
          </div>
        </div>
        <Skeleton className="h-64 lg:col-span-7 sm:h-[340px]" />
      </div>
    </SiteContainer>
  );
}
