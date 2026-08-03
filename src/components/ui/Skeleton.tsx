import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("skeleton-shimmer rounded-none bg-ink/8", className)}
      aria-hidden
    />
  );
}

export function SkeletonText({ className }: { className?: string }) {
  return <Skeleton className={cn("h-4 w-full", className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="ui-card flex flex-col overflow-hidden">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-3 border-t border-ink/6 px-4 py-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function CategoryTileSkeleton() {
  return (
    <div className="overflow-hidden bg-ink">
      <Skeleton className="h-[140px]" />
      <div className="space-y-3 bg-ink px-5 py-4">
        <Skeleton className="h-5 w-1/2 bg-white/15" />
        <Skeleton className="h-3 w-full bg-white/10" />
      </div>
    </div>
  );
}

/** Matches current corporate home layout */
export function HomePageSkeleton() {
  return (
    <div aria-busy="true" aria-label="در حال بارگذاری">
      <Skeleton className="min-h-[560px] w-full sm:min-h-[620px]" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        <div className="space-y-4">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-5/6" />
          <Skeleton className="mt-4 h-20 w-full" />
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
          <Skeleton className="mt-6 h-12 w-40" />
        </div>
        <Skeleton className="aspect-[4/5] w-full sm:aspect-[5/6]" />
      </div>
      <div className="grid lg:grid-cols-2">
        <Skeleton className="min-h-[320px] lg:min-h-[420px]" />
        <Skeleton className="min-h-[320px] bg-copper/20 lg:min-h-[420px]" />
      </div>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12">
          <Skeleton className="h-24 lg:col-span-5" />
          <Skeleton className="h-24 lg:col-span-7" />
        </div>
        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <Skeleton className="size-14 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-bg-alt/80 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="mb-8 h-10 w-48" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SitePageSkeleton() {
  return <HomePageSkeleton />;
}

export function CatalogPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="در حال بارگذاری">
      <div className="space-y-3">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-14 w-full" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="در حال بارگذاری">
      <Skeleton className="h-4 w-48" />
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-[4/3] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-4 h-12 w-48" />
          <Skeleton className="mt-6 h-40 w-full" />
        </div>
      </div>
    </div>
  );
}

export function AdminPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="در حال بارگذاری">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function PricesPageSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="در حال بارگذاری">
      <div className="space-y-3">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
      <Skeleton className="h-56 w-full" />
    </div>
  );
}
